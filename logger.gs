function logChange(user, action) {
  const logSheet = SpreadsheetApp.openById("ID_ТАБЛИЦІ").getSheetByName("Журнал змін");
  logSheet.appendRow([new Date(), user, action]);
}
