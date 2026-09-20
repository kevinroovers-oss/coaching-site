// Six numerals and one hairline on the right edge. The travelling mark shows
// where you are; the accent numeral shows which section that is.
export function initIndicator() {
  const nav = document.getElementById('indicator');
  const rule = document.getElementById('indicatorRule');
  if (!nav || !rule) return { set: () => {} };

  const items = [...nav.querySelectorAll('li')];
  const trackHeight = 128;
  const markHeight = 24;
  let active = -1;

  return {
    set(progress, sectionIndex) {
      rule.style.transform = `translateY(${(progress * (trackHeight - markHeight)).toFixed(2)}px)`;
      if (sectionIndex === active) return;
      active = sectionIndex;
      items.forEach((li, i) => {
        li.classList.toggle('is-active', i === sectionIndex);
        li.classList.toggle('is-past', i < sectionIndex);
      });
    },
  };
}
