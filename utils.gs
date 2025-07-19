// utils.gs

/**
 * Створює або отримує папку за назвою
 * @param {string} name — назва папки
 * @returns {Folder} — Google Drive папка
 */
function getOrCreateBackupFolder(name) {
  const folders = DriveApp.searchFolders(`title = '${name}'`);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

/**
 * Копіює папку рекурсивно
 * @param {Folder} source — вихідна папка
 * @param {Folder} destination — цільова папка
 */
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

/**
 * Перевіряє, чи є користувач адміном
 * @param {string} userEmail — емейл користувача
 * @returns {boolean}
 */
function isUserAdmin(userEmail) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Користувачі");
  const data = sheet.getDataRange().getValues();
  const userRow = data.find(row => row[0] === userEmail);
  return userRow && userRow[1] === "admin";
}

/**
 * Логує зміни в аркуші "Журнал змін"
 * @param {string} user — емейл користувача
 * @param {string} action — дія, яку виконано
 */
function logChange(user, action) {
  const logSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Журнал змін");
  logSheet.appendRow([new Date(), user, action]);
}
