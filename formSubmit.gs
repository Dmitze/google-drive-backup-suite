// Импортируем функции из config.gs (Apps Script автоматически видит их)

/**
 * Обработчик отправки формы пользователя
 * @param {Object} formData - данные, полученные из формы
 * @returns {Object} - результат выполнения
 */
function onFormSubmit(formData) {
  try {
    var user = Session.getActiveUser().getEmail();
    var config = getConfig();
    config.folderIds = formData.folderIds || config.folderIds;
    config.backupFolderName = formData.backupFolderName || config.backupFolderName;
    config.enabled = typeof formData.enabled !== 'undefined' ? formData.enabled : config.enabled;
    config.interval = typeof formData.interval !== 'undefined' ? formData.interval : config.interval;
    config.telegramId = typeof formData.telegramId !== 'undefined' ? formData.telegramId : config.telegramId;
    saveConfig(config);
    logChange(user, 'Збережено налаштування через форму');
    return { success: true, message: 'Налаштування збережено.' };
  } catch (e) {
    logChange(Session.getActiveUser().getEmail(), 'Помилка збереження налаштувань через форму', e.message);
    return { success: false, message: 'Помилка збереження налаштувань: ' + e.message };
  }
}
