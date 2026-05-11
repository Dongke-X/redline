const t = (k) => chrome.i18n.getMessage(k);
const $ = (id) => document.getElementById(id);

$('title').textContent = t('options_title');
$('lbl-mode').textContent = t('options_save_mode_label');
$('opt-zip').textContent = t('options_save_mode_zip');
$('opt-fs').textContent = t('options_save_mode_fs');
$('lbl-auto').textContent = t('options_autoinject_label');
$('autoinject').placeholder = t('options_autoinject_placeholder');
$('save').textContent = t('options_save_btn');

const DEFAULTS = { saveMode: 'zip', autoInject: '' };

async function load() {
  const cfg = await chrome.storage.sync.get(DEFAULTS);
  $('save-mode').value = cfg.saveMode;
  $('autoinject').value = cfg.autoInject;
}

$('save').addEventListener('click', async () => {
  const cfg = {
    saveMode: $('save-mode').value,
    autoInject: $('autoinject').value,
  };
  await chrome.storage.sync.set(cfg);
  const toast = $('toast');
  toast.textContent = t('options_saved_toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
});

load();
