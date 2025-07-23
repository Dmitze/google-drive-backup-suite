/**
 * Точка входа: проверка доступа и создание триггера резервного копирования
 * @returns {HtmlOutput}
 */
function doGet() {
  try {
    const user = Session.getActiveUser().getEmail();
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_USERS);
    const data = sheet.getDataRange().getValues();
    const found = data.some(row => row[0] === user);
    if (!found) {
      return HtmlService.createHtmlOutput("❌ У вас немає доступу.");
    }

    // Автоматичне створення тригера при першому вході (якщо немає тригера)
    const triggers = ScriptApp.getProjectTriggers();
    const hasBackupTrigger = triggers.some(t => t.getHandlerFunction() === "backupUserFolders");
    if (!hasBackupTrigger) {
      createBackupTrigger(user); // учитывает пользовательский интервал
      logChange(user, "Створено тригер резервного копіювання (інтервал користувача)");
    }

    return HtmlService.createTemplateFromFile("pages").evaluate();
  } catch (e) {
    logChange(Session.getActiveUser().getEmail(), 'Помилка авторизації/ініціалізації', e.message);
    return HtmlService.createHtmlOutput("❌ Виникла помилка: " + e.message);
  }
}
