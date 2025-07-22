function doGet() {
  const user = Session.getActiveUser().getEmail();
  const sheet = SpreadsheetApp.openById("ID_ТАБЛИЦІ").getSheetByName("Користувачі");
  const data = sheet.getDataRange().getValues();
  const found = data.some(row => row[0] === user);

  if (!found) {
    return HtmlService.createHtmlOutput("❌ У вас немає доступу.");
  }

  // Автоматичне створення тригера при першому вході
  const triggers = ScriptApp.getProjectTriggers();
  const hasBackupTrigger = triggers.some(t => t.getHandlerFunction() === "backupFolder");
  if (!hasBackupTrigger) {
    ScriptApp.newTrigger("backupFolder")
      .timeBased()
      .everyMinutes(5)
      .create();
  }

  return HtmlService.createTemplateFromFile("pages").evaluate();
}
