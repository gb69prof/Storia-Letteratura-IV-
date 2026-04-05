
(() => {
  const root = document.documentElement;
  const body = document.body;
  const page = body.dataset.page || 'home';

  const savedScale = localStorage.getItem('fontScale');
  if (savedScale) root.style.setProperty('--font-scale', savedScale);

  if (localStorage.getItem('focusMode') === '1') body.classList.add('focus-mode');

  const notesArea = document.getElementById('notes-area');
  const notesPanel = document.getElementById('notes-panel');

  if (notesArea) {
    const saved = localStorage.getItem('notes:' + page);
    if (saved) notesArea.value = saved;
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'increase-font') {
      const current = parseFloat(getComputedStyle(root).getPropertyValue('--font-scale')) || 1;
      const next = Math.min(1.25, +(current + 0.05).toFixed(2));
      root.style.setProperty('--font-scale', next);
      localStorage.setItem('fontScale', next);
    }

    if (action === 'decrease-font') {
      const current = parseFloat(getComputedStyle(root).getPropertyValue('--font-scale')) || 1;
      const next = Math.max(0.9, +(current - 0.05).toFixed(2));
      root.style.setProperty('--font-scale', next);
      localStorage.setItem('fontScale', next);
    }

    if (action === 'toggle-focus') {
      body.classList.toggle('focus-mode');
      localStorage.setItem('focusMode', body.classList.contains('focus-mode') ? '1' : '0');
    }

    if (action === 'toggle-notes' && notesPanel) {
      notesPanel.hidden = !notesPanel.hidden;
    }

    if (action === 'save-notes' && notesArea) {
      localStorage.setItem('notes:' + page, notesArea.value);
      btn.textContent = 'Salvati';
      setTimeout(() => btn.textContent = 'Salva', 900);
    }

    if (action === 'clear-notes' && notesArea) {
      notesArea.value = '';
      localStorage.removeItem('notes:' + page);
    }
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register((page === 'home' ? './' : '../') + 'service-worker.js').catch(() => {}));
  }
})();
