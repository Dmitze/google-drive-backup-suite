function updateUserRole(email, role) {
  const sheet = SpreadsheetApp.openById("ID_ТАБЛИЦІ").getSheetByName("Користувачі");
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === email);
  if (rowIndex > -1) {
    sheet.getRange(rowIndex + 1, 2).setValue(role);
  }
}

function deleteUser(email) {
  const sheet = SpreadsheetApp.openById("ID_ТАБЛИЦІ").getSheetByName("Користувачі");
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === email);
  if (rowIndex > -1) {
    sheet.deleteRow(rowIndex + 1);
  }
}

function getUserConfig(email) {
  const sheet = SpreadsheetApp.openById("ID_ТАБЛИЦІ").getSheetByName("Налаштування");
  const data = sheet.getDataRange().getValues();
  const row = data.find(r => r[0] === email);

  return row ? {
    user: row[0],
    folderIds: row[1].split(',').map(id => id.trim()),
    backupFolderName: row[2] || "Резервні копії",
    enabled: row[3]
  } : null;
}

function getUserLogs(email) {
  const sheet = SpreadsheetApp.openById("ID_ТАБЛИЦІ").getSheetByName("Логи");
  const data = sheet.getDataRange().getValues();
  return data.filter(r => r[1] === email);
}
