
const notesKey = 'parini-pwa-notes-v1';
const notesArea = document.getElementById('notesArea');
const saveStatus = document.getElementById('saveStatus');
const notesPanel = document.getElementById('notesPanel');
const sidebar = document.getElementById('sidebar');

notesArea.value = localStorage.getItem(notesKey) || '';
notesArea.addEventListener('input', () => {
  localStorage.setItem(notesKey, notesArea.value);
  saveStatus.textContent = 'Appunti salvati in locale';
});

document.getElementById('clearNotes').addEventListener('click', () => {
  notesArea.value = '';
  localStorage.removeItem(notesKey);
  saveStatus.textContent = 'Appunti svuotati';
});

document.getElementById('addSelection').addEventListener('click', () => {
  const selected = window.getSelection().toString().trim();
  if (!selected) {
    saveStatus.textContent = 'Seleziona prima un passo della lezione';
    return;
  }
  const quote = `
• ${selected}
`;
  notesArea.value = (notesArea.value + quote).trim() + '
';
  localStorage.setItem(notesKey, notesArea.value);
  saveStatus.textContent = 'Selezione aggiunta agli appunti';
});

document.getElementById('notesBtn').addEventListener('click', ()=> notesPanel.classList.add('open'));
document.getElementById('closeNotes').addEventListener('click', ()=> notesPanel.classList.remove('open'));
document.getElementById('menuBtn').addEventListener('click', ()=> sidebar.classList.toggle('open'));
document.getElementById('concentrationBtn').addEventListener('click', ()=> document.body.classList.toggle('concentration'));
document.getElementById('galleryBtn').addEventListener('click', ()=> document.getElementById('schemi').scrollIntoView({behavior:'smooth'}));

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
document.querySelectorAll('.schema-card').forEach(card => {
  card.addEventListener('click', () => {
    const img = card.querySelector('img');
    lightbox.hidden = false;
    lightboxImg.src = img.src;
    lightboxCaption.textContent = card.querySelector('figcaption').textContent;
  });
});
document.getElementById('lightboxClose').addEventListener('click', ()=> lightbox.hidden = true);
lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.hidden = true; });

const tocLinks = [...document.querySelectorAll('.toc a')];
const sections = tocLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const obs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
sections.forEach(s => obs.observe(s));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
}
