(() => {
  'use strict';
  const slides = window.OT_SLIDES;
  const sources = window.OT_SOURCES;
  const stage = document.getElementById('stage');
  const viewport = document.getElementById('viewport');
  const frame = document.getElementById('frame');
  const notes = document.getElementById('notes');
  const notesToggle = document.getElementById('notes-toggle');
  const toc = document.getElementById('toc');
  const tocList = document.getElementById('toc-list');
  const imageViewer = document.getElementById('image-viewer');
  const viewerImage = document.getElementById('image-viewer-image');
  document.getElementById('toc-subtitle').textContent = `${slides.length}장 · 20:00–22:00`;
  const prev = document.getElementById('previous');
  const next = document.getElementById('next');
  let current = -1;
  let statusTimer;
  const slideElements = slides.map((slide, index) => {
    const element = document.createElement('section');
    element.className = `slide ${slide.className || ''}`;
    element.id = `slide-${index + 1}`;
    element.setAttribute('aria-label', `${index + 1} / ${slides.length}: ${slide.title}`);
    element.innerHTML = slide.html;
    const footer = document.createElement('div');
    footer.className = 'slide-footer';
    const label = document.createElement('span');
    label.textContent = 'LeanAgent · 가짜연구소 13기';
    const links = document.createElement('div');
    links.className = 'sources';
    (slide.sources || []).forEach(key => {
      const anchor = document.createElement('a');
      anchor.href = sources[key].url;
      anchor.textContent = sources[key].label;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      links.append(anchor);
    });
    const number = document.createElement('span');
    number.className = 'slide-number';
    number.textContent = String(index + 1).padStart(2, '0');
    footer.append(label, links, number);
    element.append(footer);
    stage.append(element);
    const button = document.createElement('button');
    button.type = 'button';
    const count = document.createElement('span');
    count.textContent = String(index + 1).padStart(2, '0');
    const title = document.createElement('span');
    title.textContent = slide.title;
    const section = document.createElement('small');
    section.textContent = slide.section;
    title.append(section);
    button.append(count, title);
    button.addEventListener('click', () => { toc.close(); go(index); });
    tocList.append(button);
    return element;
  });

  stage.querySelectorAll('[data-runner]').forEach(button => {
    const runner = window.OT_RUNNERS[Number(button.dataset.runner)];
    const url = runner.linkedin.trim();
    if (!url) {
      button.addEventListener('click', () => message(`${runner.name}님의 링크드인 주소가 아직 등록되지 않았습니다.`));
      return;
    }
    const link = document.createElement('a');
    link.className = button.className;
    link.textContent = runner.name;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${runner.name} 링크드인 (새 탭)`);
    button.replaceWith(link);
  });

  function fit() {
    if (window.matchMedia('(max-width: 760px)').matches) {
      frame.style.width = '';
      frame.style.height = '';
      stage.style.transform = '';
      return;
    }
    const scale = Math.max(0.1, Math.min((viewport.clientWidth - 48) / 1600, (viewport.clientHeight - 40) / 900));
    frame.style.width = `${1600 * scale}px`;
    frame.style.height = `${900 * scale}px`;
    stage.style.transform = `scale(${scale})`;
  }
  function readHash() {
    const match = location.hash.match(/^#slide-(\d+)$/);
    return match ? Number(match[1]) - 1 : 0;
  }
  function go(index, updateHash = true) {
    const chosen = Math.max(0, Math.min(slides.length - 1, Number.isFinite(index) ? index : 0));
    if (chosen === current) return;
    const previouslyFocusedSlide = document.activeElement?.closest('.slide');
    current = chosen;
    slideElements.forEach((element, i) => {
      const active = i === current;
      element.classList.toggle('active', active);
      element.setAttribute('aria-hidden', String(!active));
      element.inert = !active;
      tocList.children[i].setAttribute('aria-current', String(active));
    });
    const slide = slides[current];
    document.getElementById('counter').textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
    document.getElementById('section-label').textContent = slide.section;
    document.getElementById('progress').style.width = `${((current + 1) / slides.length) * 100}%`;
    document.getElementById('notes-time').textContent = slide.time;
    document.getElementById('notes-title').textContent = slide.title;
    const body = document.getElementById('notes-body');
    body.replaceChildren(...slide.notes.map(note => {
      const p = document.createElement('p');
      p.textContent = note;
      return p;
    }));
    prev.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    document.title = `${current + 1}. ${slide.title} · LeanAgent OT`;
    if (updateHash) history.replaceState(null, '', `#slide-${current + 1}`);
    if (previouslyFocusedSlide) {
      slideElements[current].tabIndex = -1;
      slideElements[current].focus({ preventScroll: true });
    }
    if (window.matchMedia('(max-width: 760px)').matches) window.scrollTo({ top: 0, behavior: 'instant' });
    fit();
  }
  function toggleNotes(force) {
    const open = typeof force === 'boolean' ? force : notes.hidden;
    notes.hidden = !open;
    notesToggle.setAttribute('aria-pressed', String(open));
    fit();
  }
  function message(text) {
    const status = document.getElementById('status');
    status.textContent = text;
    status.classList.add('visible');
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => status.classList.remove('visible'), 4500);
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else message('이 브라우저는 전체화면 API를 지원하지 않습니다. 브라우저 전체화면 기능을 사용해주세요.');
    } catch {
      message('전체화면 전환을 허용하지 않는 환경입니다. 브라우저 전체화면 기능을 사용해주세요.');
    }
  }
  prev.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  notesToggle.addEventListener('click', () => toggleNotes());
  document.getElementById('notes-close').addEventListener('click', () => { toggleNotes(false); notesToggle.focus(); });
  document.getElementById('contents').addEventListener('click', () => toc.showModal());
  document.getElementById('toc-close').addEventListener('click', () => toc.close());
  document.querySelectorAll('[data-image]').forEach(button => {
    button.addEventListener('click', () => {
      viewerImage.src = button.dataset.image;
      viewerImage.alt = button.querySelector('img').alt;
      document.getElementById('image-viewer-title').textContent = button.dataset.caption;
      imageViewer.showModal();
    });
  });
  document.getElementById('image-viewer-close').addEventListener('click', () => imageViewer.close());
  document.getElementById('fullscreen').addEventListener('click', toggleFullscreen);
  document.getElementById('print').addEventListener('click', () => window.print());
  document.addEventListener('fullscreenchange', () => {
    document.getElementById('fullscreen').innerHTML = `${document.fullscreenElement ? '전체화면 종료' : '전체화면'} <kbd>F</kbd>`;
    fit();
  });
  document.addEventListener('keydown', event => {
    if (toc.open || imageViewer.open || event.ctrlKey || event.altKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable=true]')) return;
    // Space and Enter retain native activation when a button or link has focus.
    if ((event.key === ' ' || event.key === 'Enter') && event.target.closest('button,a')) return;
    switch (event.key) {
      case 'ArrowRight': case 'PageDown': case ' ': event.preventDefault(); go(current + 1); break;
      case 'ArrowLeft': case 'PageUp': event.preventDefault(); go(current - 1); break;
      case 'Home': event.preventDefault(); go(0); break;
      case 'End': event.preventDefault(); go(slides.length - 1); break;
      case 'n': case 'N': event.preventDefault(); toggleNotes(); break;
      case 't': case 'T': event.preventDefault(); toc.showModal(); break;
      case 'f': case 'F': event.preventDefault(); toggleFullscreen(); break;
      case 'Escape': if (!notes.hidden) { toggleNotes(false); notesToggle.focus(); } break;
    }
  });
  const steps = [
    { code: 'example (P Q : Prop) :\n    P ∧ Q → Q ∧ P := by\n  -- 증명을 시작합니다', goal: 'P Q : Prop\n⊢ P ∧ Q → Q ∧ P', meaning: 'P와 Q가 참이라는 조건에서 Q와 P가 참임을 보입니다.' },
    { code: 'example (P Q : Prop) :\n    P ∧ Q → Q ∧ P := by\n  intro h', goal: 'P Q : Prop\nh : P ∧ Q\n⊢ Q ∧ P', meaning: 'intro h로 P ∧ Q를 가정으로 가져옵니다.' },
    { code: 'example (P Q : Prop) :\n    P ∧ Q → Q ∧ P := by\n  intro h\n  constructor', goal: 'h : P ∧ Q\n\n목표 1  ⊢ Q\n목표 2  ⊢ P', meaning: 'constructor로 두 목표를 나눕니다. h.2는 Q의 증명, h.1은 P의 증명입니다.' },
    { code: 'example (P Q : Prop) :\n    P ∧ Q → Q ∧ P := by\n  intro h\n  constructor\n  · exact h.2\n  · exact h.1', goal: '남은 목표 없음', meaning: '각 목표에 맞는 증명을 제공해 완료합니다.' }
  ];
  function setStep(index) {
    const step = steps[index];
    document.getElementById('step-code').textContent = step.code;
    document.getElementById('step-goal').textContent = step.goal;
    document.getElementById('step-meaning').textContent = step.meaning;
    document.querySelectorAll('[data-step]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.step) === index)));
  }
  document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => setStep(Number(button.dataset.step))));
  function setRepair(fixed) {
    const line = document.getElementById('repair-line');
    line.textContent = fixed ? 'h.2' : 'h.1';
    line.className = fixed ? 'good' : 'bad';
    const feedback = document.getElementById('repair-feedback');
    feedback.classList.toggle('ok', fixed);
    feedback.innerHTML = fixed
      ? '<h3>목표에 맞는 증명</h3><p><code>h.2 : Q</code></p><p>현재 목표 Q에 맞는 증명을 제공합니다.<br>이어 h.1로 P도 증명합니다.</p><p class="small">두 목표를 모두 해결했습니다.</p>'
      : '<h3>타입이 맞지 않습니다</h3><p>현재 목표: <code>Q</code><br>제공한 증명: <code>h.1 : P</code></p><p class="small">h.1 대신 Q의 증명인 h.2가 필요합니다.</p>';
    document.querySelectorAll('[data-repair]').forEach(button => button.setAttribute('aria-pressed', String((button.dataset.repair === 'fixed') === fixed)));
  }
  document.querySelectorAll('[data-repair]').forEach(button => button.addEventListener('click', () => setRepair(button.dataset.repair === 'fixed')));
  setStep(0);
  setRepair(false);
  window.addEventListener('hashchange', () => go(readHash(), false));
  window.addEventListener('resize', fit);
  new ResizeObserver(fit).observe(viewport);
  window.addEventListener('beforeprint', () => { slideElements.forEach(element => { element.inert = false; element.setAttribute('aria-hidden', 'false'); }); });
  window.addEventListener('afterprint', () => { slideElements.forEach((element, i) => { element.inert = i !== current; element.setAttribute('aria-hidden', String(i !== current)); }); });
  go(readHash());
})();
