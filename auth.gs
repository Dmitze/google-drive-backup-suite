function doGet() {
  const user = Session.getActiveUser().getEmail();
  const sheet = SpreadsheetApp.openById("ID_ТАБЛИЦІ").getSheetByName("Користувачі");
  const data = sheet.getDataRange().getValues();
  const found = data.some(row => row[0] === user);

  if (!found) {
    return HtmlService.createHtmlOutput("❌ У вас немає доступу.");
  }

  return HtmlService.createTemplateFromFile("pages").evaluate();
}
