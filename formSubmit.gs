function getConfig() {
  const user = Session.getActiveUser().getEmail();
  const sheet = SpreadsheetApp.openById("ID_ТАБЛИЦІ").getSheetByName("Налаштування");
  const data = sheet.getDataRange().getValues();
  const row = data.find(r => r[0] === user);

  return {
    user,
    folderIds: row ? row[1].split(',') : [],
    backupFolderName: row ? row[2] : "Резервні копії",
    enabled: row ? row[3] : true
  };
}

function saveConfig(config) {
  const sheet = SpreadsheetApp.openById("ID_ТАБЛИЦІ").getSheetByName("Налаштування");
  const data = sheet.getDataRange().getValues();
  const userIndex = data.findIndex(row => row[0] === config.user);

  if (userIndex > -1) {
    sheet.getRange(userIndex + 1, 2, 1, 3).setValues([[config.folderIds.join(','), config.backupFolderName, config.enabled]]);
  } else {
    sheet.appendRow([config.user, config.folderIds.join(','), config.backupFolderName, config.enabled]);
  }

  logChange(config.user, "Змінено налаштування");
}
