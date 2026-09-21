import { gsap } from 'gsap';
import { E, D } from '../motion/easing.js';

// The service detail. A dialog, never a navigation: the scene keeps running and
// softly blurs behind the panel, so you never lose your place in the story.
export function initOverlay({ onOpen, onClose } = {}) {
  const root = document.getElementById('overlay');
  const scrim = root.querySelector('.overlay-scrim');
  const panel = root.querySelector('.overlay-panel');
  const closeBtn = document.getElementById('overlayClose');
  const num = document.getElementById('overlayNum');
  const title = document.getElementById('overlayTitle');
  const what = document.getElementById('overlayWhat');
  const proof = document.getElementById('overlayProof');
  const bron = document.getElementById('overlayBron');

  // Read the detail out of the page rather than out of a JSON blob, so the
  // same words serve the overlay, a crawler and anyone without JavaScript.
  const cards = [...document.querySelectorAll('.service-card')];
  const data = cards.map((card) => {
    const detail = card.parentElement.querySelector('.service-detail');
    const field = (name) => detail?.querySelector(`[data-field="${name}"]`)?.textContent ?? '';
    return {
      title: card.querySelector('.service-title')?.textContent ?? '',
      what: field('what'),
      proof: field('proof'),
      bron: field('bron'),
    };
  });

  let openIndex = null;
  let lastFocus = null;
  let tl = null;

  function open(index) {
    if (openIndex !== null) return;
    const item = data[index];
    if (!item) return;
    openIndex = index;
    lastFocus = document.activeElement;

    num.textContent = String(index + 1).padStart(2, '0');
    title.textContent = item.title;
    what.textContent = item.what;
    proof.textContent = item.proof;
    bron.textContent = item.bron;
    bron.hidden = !item.bron;

    root.hidden = false;
    document.body.classList.add('is-overlay-open');
    onOpen?.(index);

    tl?.kill();
    tl = gsap.timeline();
    tl.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: E.inOut }, 0);
    tl.fromTo(
      panel,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: D.reveal, ease: E.out },
      0.08
    );
    tl.fromTo(
      [num, title, what, proof, bron],
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.06, ease: E.out },
      0.14
    );
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (openIndex === null) return;
    openIndex = null;
    document.body.classList.remove('is-overlay-open');
    onClose?.();
    tl?.kill();
    tl = gsap.timeline({
      onComplete: () => {
        root.hidden = true;
        lastFocus?.focus?.({ preventScroll: true });
      },
    });
    tl.to(panel, { opacity: 0, y: 14, duration: 0.42, ease: E.inOut }, 0);
    tl.to(scrim, { opacity: 0, duration: 0.5, ease: E.inOut }, 0.04);
  }

  scrim.addEventListener('click', close);
  closeBtn.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (openIndex === null) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    // Minimal focus trap: the panel only ever has one focusable control.
    if (e.key === 'Tab') {
      e.preventDefault();
      closeBtn.focus();
    }
  });

  return { open, close, isOpen: () => openIndex !== null };
}
