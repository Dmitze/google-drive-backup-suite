/**
 * Логирует действие пользователя в журнал изменений.
 * @param {string} user - email пользователя
 * @param {string} action - описание действия
 * @param {...any} extraFields - дополнительные поля для лога (опционально)
 */
function logChange(user, action, ...extraFields) {
  try {
    var ss = SpreadsheetApp.openById(typeof SPREADSHEET_ID !== 'undefined' ? SPREADSHEET_ID : 'ID_ТАБЛИЦІ');
    var logSheet = ss.getSheetByName('Журнал змін');
    if (!logSheet) {
      throw new Error('Лист "Журнал змін" не найден.');
    }
    var row = [new Date(), user, action].concat(extraFields);
    logSheet.appendRow(row);
  } catch (e) {
    // Можно заменить на более сложную обработку или уведомление администратора
    console.error('Ошибка логирования:', e.message);
  }
}
