/* ============================
   FOSCOLO PWA — app.js
   Funzionalità: evidenziazioni, appunti,
   concentrazione, fullscreen, progresso
   ============================ */

(function () {
  'use strict';

  // ——— UTILITÀ ———
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const KEY = (k) => `foscolo_${k}`;

  // ——— PAGINA CORRENTE ———
  const paginaId = document.body.dataset.pagina || 'index';

  // ============================
  // PROGRESSO LEZIONI
  // ============================
  function caricaProgresso() {
    return JSON.parse(localStorage.getItem(KEY('progresso')) || '{}');
  }

  function salvaProgresso(id, valore) {
    const p = caricaProgresso();
    p[id] = valore;
    localStorage.setItem(KEY('progresso'), JSON.stringify(p));
  }

  function aggiornaBarre() {
    const p = caricaProgresso();
    $$('.card-lezione').forEach(card => {
      const id = card.dataset.lezioneId;
      if (!id) return;
      const fill = card.querySelector('.card-lezione__prog-fill');
      if (fill) fill.style.width = (p[id] || 0) + '%';
    });
  }

  // ============================
  // EVIDENZIAZIONI
  // ============================
  function caricaEvidenziazioni(id) {
    return JSON.parse(localStorage.getItem(KEY('ev_' + id)) || '[]');
  }

  function salvaEvidenziazioni(id, arr) {
    localStorage.setItem(KEY('ev_' + id), JSON.stringify(arr));
  }

  function applicaEvidenziazioni(contenuto, id) {
    const saved = caricaEvidenziazioni(id);
    if (!saved.length) return;
    // Approccio: marchiamo i testi salvati cercando nel contenuto
    saved.forEach(testo => {
      evidenziaTestoNelDom(contenuto, testo);
    });
    aggiornaListaEv(id);
  }

  function evidenziaTestoNelDom(contenuto, testo) {
    if (!testo || testo.length < 3) return;
    const walker = document.createTreeWalker(contenuto, NodeFilter.SHOW_TEXT);
    const nodi = [];
    let n;
    while ((n = walker.nextNode())) nodi.push(n);

    nodi.forEach(nodo => {
      if (!nodo.parentElement || nodo.parentElement.tagName === 'MARK') return;
      const idx = nodo.textContent.indexOf(testo);
      if (idx === -1) return;
      const range = document.createRange();
      range.setStart(nodo, idx);
      range.setEnd(nodo, idx + testo.length);
      const mark = document.createElement('mark');
      mark.className = 'highlight';
      mark.title = 'Clicca per rimuovere';
      mark.addEventListener('click', () => rimuoviEvidenziazione(testo, mark));
      range.surroundContents(mark);
    });
  }

  function rimuoviEvidenziazione(testo, markEl) {
    const parent = markEl.parentNode;
    while (markEl.firstChild) parent.insertBefore(markEl.firstChild, markEl);
    parent.removeChild(markEl);

    const saved = caricaEvidenziazioni(paginaId).filter(t => t !== testo);
    salvaEvidenziazioni(paginaId, saved);
    aggiornaListaEv(paginaId);
  }

  function aggiornaListaEv(id) {
    const lista = $('#ev-lista');
    if (!lista) return;
    const saved = caricaEvidenziazioni(id);
    if (!saved.length) {
      lista.innerHTML = '<span style="color:var(--testo-muted);font-size:0.8rem;font-style:italic">Nessuna evidenziazione</span>';
      return;
    }
    lista.innerHTML = saved.map((t, i) =>
      `<div class="evidenziazione-item" title="Clicca per rimuovere" data-idx="${i}">
        «${t.length > 60 ? t.slice(0, 57) + '…' : t}»
      </div>`
    ).join('');

    $$('.evidenziazione-item', lista).forEach(el => {
      el.addEventListener('click', () => {
        const testo = saved[+el.dataset.idx];
        $$('mark.highlight').forEach(m => {
          if (m.textContent === testo) rimuoviEvidenziazione(testo, m);
        });
      });
    });
  }

  function inizializzaEvidenziazioni(contenuto) {
    if (!contenuto) return;

    applicaEvidenziazioni(contenuto, paginaId);

    document.addEventListener('mouseup', () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      const testo = sel.toString().trim();
      if (testo.length < 3 || testo.length > 600) return;
      if (!contenuto.contains(sel.anchorNode)) return;

      const saved = caricaEvidenziazioni(paginaId);
      if (saved.includes(testo)) return;
      saved.push(testo);
      salvaEvidenziazioni(paginaId, saved);

      try {
        const range = sel.getRangeAt(0);
        const mark = document.createElement('mark');
        mark.className = 'highlight';
        mark.title = 'Clicca per rimuovere';
        range.surroundContents(mark);
        mark.addEventListener('click', () => rimuoviEvidenziazione(testo, mark));
        sel.removeAllRanges();
      } catch (e) {
        // Selezione cross-nodo: ignoriamo
      }

      aggiornaListaEv(paginaId);
    });

    // Btn: aggiungi alle note
    const btnNote = $('#ev-a-note');
    if (btnNote) {
      btnNote.addEventListener('click', () => {
        const saved = caricaEvidenziazioni(paginaId);
        if (!saved.length) return;
        const textarea = $('#appunti-textarea');
        if (!textarea) return;
        const aggiunta = '\n— EVIDENZIAZIONI —\n' + saved.map(t => `• ${t}`).join('\n') + '\n';
        textarea.value += aggiunta;
        salvaAppunti();
      });
    }

    // Btn: svuota evidenziazioni
    const btnSvuota = $('#ev-svuota');
    if (btnSvuota) {
      btnSvuota.addEventListener('click', () => {
        if (!confirm('Rimuovere tutte le evidenziazioni di questa lezione?')) return;
        salvaEvidenziazioni(paginaId, []);
        $$('mark.highlight').forEach(m => {
          const parent = m.parentNode;
          while (m.firstChild) parent.insertBefore(m.firstChild, m);
          parent.removeChild(m);
        });
        aggiornaListaEv(paginaId);
      });
    }
  }

  // ============================
  // APPUNTI
  // ============================
  function caricaAppunti() {
    return localStorage.getItem(KEY('note_' + paginaId)) || '';
  }

  function salvaAppunti() {
    const ta = $('#appunti-textarea');
    if (!ta) return;
    localStorage.setItem(KEY('note_' + paginaId), ta.value);
  }

  function inizializzaAppunti() {
    const ta = $('#appunti-textarea');
    if (!ta) return;
    ta.value = caricaAppunti();
    ta.addEventListener('input', salvaAppunti);

    const btnSalva = $('#note-salva');
    if (btnSalva) {
      btnSalva.addEventListener('click', () => {
        salvaAppunti();
        btnSalva.textContent = '✓ Salvato';
        setTimeout(() => { btnSalva.textContent = 'Salva appunti'; }, 1500);
      });
    }

    const btnEsporta = $('#note-esporta');
    if (btnEsporta) {
      btnEsporta.addEventListener('click', () => {
        const testo = ta.value;
        if (!testo.trim()) return;
        const blob = new Blob([testo], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `foscolo_appunti_${paginaId}.txt`;
        a.click();
      });
    }
  }

  // ============================
  // MODALITÀ CONCENTRAZIONE
  // ============================
  function inizializzaConcentrazione() {
    const btn = $('#btn-concentrazione');
    const banner = $('#banner-concentrazione');

    function attiva() {
      document.body.classList.add('concentrazione');
      localStorage.setItem(KEY('concentrazione'), '1');
    }

    function disattiva() {
      document.body.classList.remove('concentrazione');
      localStorage.removeItem(KEY('concentrazione'));
    }

    if (btn) {
      btn.addEventListener('click', () => {
        if (document.body.classList.contains('concentrazione')) disattiva();
        else attiva();
      });
    }

    if (banner) {
      banner.addEventListener('click', disattiva);
    }

    // Ripristina stato
    if (localStorage.getItem(KEY('concentrazione'))) attiva();
  }

  // ============================
  // FULLSCREEN IMMAGINI
  // ============================
  function inizializzaFullscreen() {
    const overlay = $('#overlay-fullscreen');
    const overlayImg = overlay ? $('#overlay-img') : null;

    if (!overlay) return;

    $$('.img-lezione').forEach(img => {
      img.addEventListener('click', () => {
        overlayImg.src = img.src;
        overlayImg.alt = img.alt;
        overlay.classList.add('aperto');
        document.body.style.overflow = 'hidden';
      });
    });

    overlay.addEventListener('click', chiudiOverlay);
    const btnChiudi = $('#overlay-chiudi');
    if (btnChiudi) btnChiudi.addEventListener('click', chiudiOverlay);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') chiudiOverlay();
    });

    function chiudiOverlay() {
      overlay.classList.remove('aperto');
      document.body.style.overflow = '';
    }
  }

  // ============================
  // PROGRESSO DI LETTURA
  // ============================
  function inizializzaProgressoLettura() {
    const barra = $('.barra-progresso__fill');
    const label = $('.progresso-lezione');
    if (!barra) return;

    function aggiorna() {
      const altezza = document.documentElement.scrollHeight - window.innerHeight;
      if (altezza <= 0) return;
      const perc = Math.min(100, Math.round((window.scrollY / altezza) * 100));
      barra.style.width = perc + '%';
      if (label) label.textContent = `Lettura: ${perc}%`;
      salvaProgresso(paginaId, perc);
    }

    window.addEventListener('scroll', aggiorna, { passive: true });
    aggiorna();
  }

  // ============================
  // INIT HOMEPAGE
  // ============================
  function initHome() {
    aggiornaBarre();
  }

  // ============================
  // INIT LEZIONE
  // ============================
  function initLezione() {
    const contenuto = $('.lezione-contenuto');
    inizializzaEvidenziazioni(contenuto);
    inizializzaAppunti();
    inizializzaConcentrazione();
    inizializzaFullscreen();
    inizializzaProgressoLettura();
    aggiornaListaEv(paginaId);
  }

  // ============================
  // BOOT
  // ============================
  document.addEventListener('DOMContentLoaded', () => {
    if (paginaId === 'index') initHome();
    else initLezione();

    // Animazione ingresso card
    $$('.anim-entra').forEach(el => {
      el.style.opacity = '';
    });
  });

})();
