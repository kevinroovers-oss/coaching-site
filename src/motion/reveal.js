import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { E, D } from './easing.js';

// Text arrives by rising out from behind a mask, line by line, tied to scroll
// position. Nothing on this site fades in on its own.
export function initReveals({ reducedMotion }) {
  if (reducedMotion) {
    document.documentElement.classList.add('no-motion');
    return;
  }

  // A ScrollTrigger only fires onEnter when the scroll *crosses* its start.
  // Land on an anchor, reload halfway down, or jump with a keyboard and the
  // triggers above you never fire, leaving headings stuck behind their masks.
  // So every reveal also checks whether it is already past, and plays at once.
  const past = (el, ratio) => el.getBoundingClientRect().top < window.innerHeight * ratio;

  // Headings: every .line inside gets its own mask and its own delay.
  gsap.utils.toArray('.h1, .h2, .h3').forEach((el) => {
    const inner = el.querySelectorAll('.line-i');
    if (!inner.length) return;
    // `y: 0` is not redundant. The CSS start state is translate3d(0,105%,0);
    // GSAP resolves that to a 125px base `y` and would then animate yPercent on
    // top of it, leaving the line permanently pushed down by its own height.
    gsap.set(inner, { yPercent: 105, y: 0 });
    const play = (instant) => {
      if (el.dataset.revealed) return;
      el.dataset.revealed = '1';
      gsap.to(inner, {
        yPercent: 0,
        y: 0,
        duration: instant ? 0.6 : D.reveal,
        ease: E.out,
        stagger: instant ? 0.04 : D.stagger,
      });
    };
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => play(false) });
    if (past(el, 0.88)) play(true);
  });

  // Everything else that reveals as a block.
  gsap.utils.toArray('.reveal').forEach((el, i) => {
    const play = (instant) => {
      if (el.dataset.revealed) return;
      el.dataset.revealed = '1';
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: instant ? 0.5 : 0.9,
        ease: E.out,
        delay: instant ? 0 : (i % 4) * 0.04,
        onComplete: () => el.classList.add('is-in'),
      });
    };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => play(false) });
    if (past(el, 0.9)) play(true);
  });
}

// The hero is the one block that is not scroll-triggered: it plays once the
// preloader is satisfied, so the first thing you see is the site introducing
// itself rather than waiting for you.
export function playHero({ reducedMotion }) {
  const h1 = document.querySelectorAll('.section--hero .h1 .line-i');
  const line = document.querySelectorAll('.section--hero .hero-line .line-i');
  const hint = document.querySelector('.scroll-hint');

  if (reducedMotion) {
    document.documentElement.classList.add('is-ready');
    return;
  }

  document.documentElement.classList.add('is-ready');
  const tl = gsap.timeline();
  tl.fromTo(h1, { yPercent: 108, y: 0 }, { yPercent: 0, y: 0, duration: 1.4, ease: E.out, stagger: 0.09 }, 0);
  tl.fromTo(line, { yPercent: 108, y: 0 }, { yPercent: 0, y: 0, duration: 1.2, ease: E.out, stagger: 0.07 }, 0.24);
  tl.fromTo(hint, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: E.out }, 0.9);
  return tl;
}
