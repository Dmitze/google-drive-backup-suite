function backupFolder() {
  const user = Session.getActiveUser().getEmail();
  const sheet = SpreadsheetApp.openById("ID_ТАБЛИЦІ").getSheetByName("Налаштування");
  const data = sheet.getDataRange().getValues();

  const userRow = data.find(row => row[0] === user);
  if (!userRow) return;

  const folderIds = userRow[1].split(',').map(id => id.trim());
  const backupFolderName = userRow[2] || "Резервні копії";
  const enabled = userRow[3] !== false;

  if (!enabled) return;

  const backupFolder = getOrCreateBackupFolder(backupFolderName);

  folderIds.forEach(folderId => {
    const folder = DriveApp.getFolderById(folderId);
    if (!folder) return;

    const today = new Date().toISOString().slice(0, 10);
    const newFolderName = folder.getName() + " — " + today;
    const existing = backupFolder.getFoldersByName(newFolderName);

    if (existing.hasNext()) return;

    const newFolder = backupFolder.createFolder(newFolderName);
    copyFolder(folder, newFolder);

    logBackup(user, newFolderName, true);
  });
}

function getOrCreateBackupFolder(name) {
  const folders = DriveApp.searchFolders(`title = '${name}'`);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function copyFolder(source, destination) {
  const files = source.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    file.makeCopy(file.getName(), destination);
  }

  const subFolders = source.getFolders();
  while (subFolders.hasNext()) {
    const subFolder = subFolders.next();
    const newSubFolder = destination.createFolder(subFolder.getName());
    copyFolder(subFolder, newSubFolder);
  }
}

function logBackup(user, folderName, success) {
  const logSheet = SpreadsheetApp.openById("ID_ТАБЛИЦІ").getSheetByName("Логи");
  logSheet.appendRow([new Date(), user, folderName, success ? "Успішно" : "Помилка"]);
}
