// config.gs

const SPREADSHEET_ID = "ID_ТАБЛИЦІ"; // Замініть на ID вашої Google Таблиці
const SHEET_SETTINGS = "Налаштування";
const SHEET_USERS = "Користувачі";
const SHEET_FOLDERS = "Папки";
const SHEET_LOGS = "Логи";
const SHEET_CHANGES = "Журнал змін";

/**
 * Перевіряє, чи увімкнено резервування для користувача
 * @param {any} value
 * @returns {boolean}
 */
function isEnabled(value) {
  return value === true || value === "TRUE" || value === "true" || value === 1 || value === "1";
}

/**
 * Отримує налаштування користувача
 * @param {string=} email
 * @returns {{user: string, folderIds: string[], backupFolderName: string, enabled: boolean, interval: number, telegramId: string}}
 */
function getConfig(email) {
  try {
    const user = email || Session.getActiveUser().getEmail();
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_SETTINGS);
    const data = sheet.getDataRange().getValues();
    const row = data.find(r => r[0] === user);
    return {
      user,
      folderIds: row ? (row[1] ? row[1].split(',').map(id => id.trim()) : []) : [],
      backupFolderName: row ? (row[2] || "Резервні копії") : "Резервні копії",
      enabled: row ? isEnabled(row[3]) : true,
      interval: row && row[4] ? Number(row[4]) : 5, // 5 хвилин за замовчуванням
      telegramId: row && row[5] ? String(row[5]) : ""
    };
  } catch (e) {
    console.error('Помилка отримання налаштувань:', e.message);
    return {
      user: email || '',
      folderIds: [],
      backupFolderName: "Резервні копії",
      enabled: true,
      interval: 5,
      telegramId: ""
    };
  }
}

/**
 * Зберігає налаштування користувача
 * @param {Object} config — об'єкт із налаштуваннями
 */
function saveConfig(config) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_SETTINGS);
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] === config.user);
    const rowData = [
      config.user,
      (config.folderIds || []).join(', '),
      config.backupFolderName || "Резервні копії",
      typeof config.enabled !== 'undefined' ? config.enabled : true,
      typeof config.interval !== 'undefined' ? config.interval : 5,
      config.telegramId || ""
    ];
    if (rowIndex > -1) {
      sheet.getRange(rowIndex + 1, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    logChange(config.user, "Змінено налаштування");
  } catch (e) {
    console.error('Помилка збереження налаштувань:', e.message);
    logChange(config.user || '', 'Помилка збереження налаштувань', e.message);
  }
}

/**
 * Отримує список папок з аркуша "Папки"
 */
function getFoldersList() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_FOLDERS);
    const data = sheet.getDataRange().getValues();
    return data.slice(1); // без заголовка
  } catch (e) {
    console.error('Помилка отримання списку папок:', e.message);
    return [];
  }
}

/**
 * Отримує список користувачів з аркуша "Користувачі"
 */
function getAllUsers() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_USERS);
    const data = sheet.getDataRange().getValues();
    return data.slice(1).map(row => ({ email: row[0], role: row[1] }));
  } catch (e) {
    console.error('Помилка отримання списку користувачів:', e.message);
    return [];
  }
}

/**
 * Резервне копіювання папок користувача
 * @param {string} email — email користувача (опціонально)
 * @returns {Object} — результат резервного копіювання
 */
function backupUserFolders(email) {
  const config = getConfig(email);
  if (!isEnabled(config.enabled)) {
    logChange(config.user, 'Резервне копіювання не увімкнено');
    return { success: false, message: 'Резервне копіювання не увімкнено' };
  }
  try {
    const backupFolder = getOrCreateBackupFolder(config.backupFolderName);
    config.folderIds.forEach(folderId => {
      try {
        const source = DriveApp.getFolderById(folderId);
        copyFolder(source, backupFolder);
        logChange(config.user, 'Резервне копіювання виконано', folderId, 'success');
      } catch (e) {
        logChange(config.user, 'Помилка резервного копіювання', folderId, 'error', e.message);
      }
    });
    return { success: true, message: 'Резервне копіювання завершено' };
  } catch (e) {
    logChange(config.user, 'Загальна помилка резервного копіювання', '', 'error', e.message);
    return { success: false, message: e.message };
  }
}

/**
 * Створює тригер резервного копіювання для користувача
 * @param {string=} email
 */
function createBackupTrigger(email) {
  const config = getConfig(email);
  const interval = config.interval || 5;
  // Удалить старые триггеры для этого пользователя
  deleteBackupTrigger();
  let triggerBuilder = ScriptApp.newTrigger('backupUserFolders').timeBased();
  if (interval === 5) triggerBuilder = triggerBuilder.everyMinutes(5);
  else if (interval === 60) triggerBuilder = triggerBuilder.everyHours(1);
  else if (interval === 1440) triggerBuilder = triggerBuilder.everyDays(1);
  else triggerBuilder = triggerBuilder.everyMinutes(interval);
  triggerBuilder.create();
}

/**
 * Удаляет все триггеры резервного копіювання
 */
function deleteBackupTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'backupUserFolders') {
      ScriptApp.deleteTrigger(t);
    }
  });
}
