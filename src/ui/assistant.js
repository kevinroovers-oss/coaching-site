import { gsap } from 'gsap';
import { E, D } from '../motion/easing.js';

// The assistant. Streams from /api/chat, which holds the API key.
//
// Two states the interface has to handle gracefully, because both are normal:
// the endpoint is missing (a static preview, or before the first deploy), and
// the endpoint exists but has no API key. Neither should look like a crash.

const ENDPOINT = '/api/chat';

// Injected by the content plugin, so the assistant's fallback copy lives in
// content.js with the rest of the words.
const STRINGS = (() => {
  try {
    return JSON.parse(document.getElementById('askStrings')?.textContent || '{}');
  } catch {
    return {};
  }
})();

export function initAssistant({ onOpen, onClose } = {}) {
  const root = document.getElementById('ask');
  if (!root) return { open: () => {}, isOpen: () => false };

  const openBtn = document.getElementById('askOpen');
  const closeBtn = document.getElementById('askClose');
  const scrim = root.querySelector('.ask-scrim');
  const panel = root.querySelector('.ask-panel');
  const log = document.getElementById('askLog');
  const form = document.getElementById('askForm');
  const input = document.getElementById('askInput');
  const prompts = document.getElementById('askPrompts');

  /** @type {{role: 'user'|'assistant', content: string}[]} */
  const history = [];
  let open = false;
  let busy = false;
  let lastFocus = null;

  function bubble(role, text = '') {
    const el = document.createElement('div');
    el.className = `ask-turn ask-turn--${role}`;
    const p = document.createElement('p');
    p.textContent = text;
    el.append(p);
    log.append(el);
    log.scrollTop = log.scrollHeight;
    return p;
  }

  function note(text) {
    const el = document.createElement('p');
    el.className = 'ask-note';
    el.textContent = text;
    log.append(el);
    log.scrollTop = log.scrollHeight;
  }

  function setBusy(state) {
    busy = state;
    root.classList.toggle('is-busy', state);
    input.disabled = state;
    form.querySelector('.ask-send').disabled = state;
  }

  async function ask(question) {
    const text = question.trim();
    if (!text || busy) return;

    prompts.hidden = true;
    history.push({ role: 'user', content: text });
    bubble('user', text);
    input.value = '';
    setBusy(true);

    const target = bubble('assistant');
    target.parentElement.classList.add('is-streaming');
    let answer = '';

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) {
        // 404/405 means there is no function behind this page at all.
        const offline = res.status === 404 || res.status === 405;
        let message = offline ? STRINGS.offline : STRINGS.generic;
        if (!offline) {
          try {
            const data = await res.json();
            if (data?.error) message = data.error;
          } catch { /* keep the default */ }
        }
        target.parentElement.remove();
        note(message);
        history.pop();
        return;
      }

      // Server-sent events, read as they arrive.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let split;
        while ((split = buffer.indexOf('\n\n')) !== -1) {
          const frame = buffer.slice(0, split);
          buffer = buffer.slice(split + 2);
          const event = frame.match(/^event: (.+)$/m)?.[1];
          const raw = frame.match(/^data: (.+)$/m)?.[1];
          if (!event || !raw) continue;
          const data = JSON.parse(raw);

          if (event === 'delta') {
            answer += data.text;
            target.textContent = answer;
            log.scrollTop = log.scrollHeight;
          } else if (event === 'error') {
            if (!answer) target.parentElement.remove();
            note(data.message);
          }
        }
      }

      if (answer) history.push({ role: 'assistant', content: answer });
      else history.pop();
    } catch {
      target.parentElement.remove();
      note(STRINGS.unreachable);
      history.pop();
    } finally {
      target.parentElement?.classList.remove('is-streaming');
      setBusy(false);
      if (open) input.focus();
    }
  }

  // --- open / close -------------------------------------------------------
  function show() {
    if (open) return;
    open = true;
    lastFocus = document.activeElement;
    root.hidden = false;
    document.body.classList.add('is-overlay-open');
    onOpen?.();
    gsap
      .timeline()
      .fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: E.inOut }, 0)
      .fromTo(panel, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: D.reveal, ease: E.out }, 0.06);
    setTimeout(() => input.focus(), 120);
  }

  function hide() {
    if (!open) return;
    open = false;
    document.body.classList.remove('is-overlay-open');
    onClose?.();
    gsap
      .timeline({
        onComplete: () => {
          root.hidden = true;
          lastFocus?.focus?.({ preventScroll: true });
        },
      })
      .to(panel, { opacity: 0, y: 14, duration: 0.4, ease: E.inOut }, 0)
      .to(scrim, { opacity: 0, duration: 0.45, ease: E.inOut }, 0.04);
  }

  openBtn?.addEventListener('click', show);
  closeBtn.addEventListener('click', hide);
  scrim.addEventListener('click', hide);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    ask(input.value);
  });

  prompts.addEventListener('click', (e) => {
    const btn = e.target.closest('.ask-prompt');
    if (btn) ask(btn.textContent);
  });

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      hide();
      return;
    }
    if (e.key !== 'Tab') return;
    // Keep focus inside the panel while it is modal.
    const focusable = [...panel.querySelectorAll('button, input, a[href]')].filter(
      (el) => !el.disabled && el.offsetParent !== null
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  return { open: show, close: hide, isOpen: () => open };
}
