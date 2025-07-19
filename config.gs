// config.gs

const SPREADSHEET_ID = "ID_ТАБЛИЦІ"; // Замініть на ID вашої Google Таблиці

/**
 * Отримує налаштування користувача
 */
function getConfig() {
  const user = Session.getActiveUser().getEmail();
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Налаштування");
  const data = sheet.getDataRange().getValues();
  const row = data.find(r => r[0] === user);

  return {
    user,
    folderIds: row ? row[1].split(',').map(id => id.trim()) : [],
    backupFolderName: row ? row[2] : "Резервні копії",
    enabled: row ? row[3] : true
  };
}

/**
 * Зберігає налаштування користувача
 * @param {Object} config — об'єкт із налаштуваннями
 */
function saveConfig(config) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Налаштування");
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === config.user);

  if (rowIndex > -1) {
    sheet.getRange(rowIndex + 1, 2, 1, 3).setValues([
      [config.folderIds.join(', '), config.backupFolderName, config.enabled]
    ]);
  } else {
    sheet.appendRow([config.user, config.folderIds.join(', '), config.backupFolderName, config.enabled]);
  }

  logChange(config.user, "Змінено налаштування");
}

/**
 * Отримує список папок з аркуша "Папки"
 */
function getFoldersList() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Папки");
  const data = sheet.getDataRange().getValues();
  return data.slice(1); // без заголовка
}

/**
 * Отримує список користувачів з аркуша "Користувачі"
 */
function getAllUsers() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Користувачі");
  const data = sheet.getDataRange().getValues();
  return data.slice(1).map(row => ({ email: row[0], role: row[1] }));
}
