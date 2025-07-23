// utils.gs

/**
 * Створює або отримує папку за назвою
 * @param {string} name — назва папки
 * @returns {Folder|null} — Google Drive папка або null у разі помилки
 */
function getOrCreateBackupFolder(name) {
  try {
    const folders = DriveApp.searchFolders(`title = '${name}'`);
    return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
  } catch (e) {
    console.error('Помилка створення/отримання папки:', e.message);
    return null;
  }
}

/**
 * Копіює папку рекурсивно
 * @param {Folder} source — вихідна папка
 * @param {Folder} destination — цільова папка
 */
function copyFolder(source, destination) {
  try {
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
  } catch (e) {
    console.error('Помилка копіювання папки:', e.message);
  }
}

/**
 * Перевіряє, чи є користувач адміном
 * @param {string} userEmail — емейл користувача
 * @returns {boolean}
 */
function isUserAdmin(userEmail) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_USERS);
    if (!sheet) throw new Error('Лист "Користувачі" не знайдено.');
    const data = sheet.getDataRange().getValues();
    const userRow = data.find(row => row[0] === userEmail);
    return userRow && userRow[1] === "admin";
  } catch (e) {
    console.error('Помилка перевірки прав адміністратора:', e.message);
    return false;
  }
}
