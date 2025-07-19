function getAllUsers() {
  const sheet = SpreadsheetApp.openById("ID_ТАБЛИЦІ").getSheetByName("Користувачі");
  const data = sheet.getDataRange().getValues();
  return data.map(row => ({ email: row[0], role: row[1] }));
}

function editUser(email, newRole) {
  const sheet = SpreadsheetApp.openById("ID_ТАБЛИЦІ").getSheetByName("Користувачі");
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === email);
  if (rowIndex > -1) {
    sheet.getRange(rowIndex + 1, 2).setValue(newRole);
  }
}
