/**
 * Получить всех пользователей (использует Code.gs)
 */
function getAllUsers() {
  return getAllUsersFromCode(); // функция getAllUsers из Code.gs
}

/**
 * Обновить роль пользователя (только для админа)
 */
function updateUserRole(email, role) {
  try {
    const currentUser = Session.getActiveUser().getEmail();
    if (!isUserAdmin(currentUser)) throw new Error('Недостатньо прав');
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_USERS);
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] === email);
    if (rowIndex > -1) {
      sheet.getRange(rowIndex + 1, 2).setValue(role);
      logChange(currentUser, `Змінив роль для ${email} на ${role}`);
    }
  } catch (e) {
    logChange(Session.getActiveUser().getEmail(), 'Помилка зміни ролі', email, role, e.message);
    throw e;
  }
}

/**
 * Удалить пользователя (только для админа, нельзя удалить себя)
 */
function deleteUser(email) {
  try {
    const currentUser = Session.getActiveUser().getEmail();
    if (!isUserAdmin(currentUser)) throw new Error('Недостатньо прав');
    if (email === currentUser) throw new Error('Не можна видалити себе!');
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_USERS);
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] === email);
    if (rowIndex > -1) {
      sheet.deleteRow(rowIndex + 1);
      logChange(currentUser, `Видалив користувача ${email}`);
    }
  } catch (e) {
    logChange(Session.getActiveUser().getEmail(), 'Помилка видалення користувача', email, e.message);
    throw e;
  }
}

/**
 * Получить настройки пользователя (использует Code.gs)
 */
function getUserConfig(email) {
  return getConfig(email); // универсальная функция из Code.gs
}

/**
 * Получить логи пользователя
 */
function getUserLogs(email) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_LOGS);
    const data = sheet.getDataRange().getValues();
    return data.filter(r => r[1] === email);
  } catch (e) {
    logChange(Session.getActiveUser().getEmail(), 'Помилка отримання логів', email, e.message);
    return [];
  }
}
