import './styles.css';

const select = <T extends Element>(selector: string) => document.querySelector<T>(selector);
const selectAll = <T extends Element>(selector: string) => document.querySelectorAll<T>(selector);

const modeButton = select<HTMLButtonElement>('.mode-button');
const storedMode = localStorage.getItem('portfolio-mode');
if (storedMode === 'inverted') document.body.classList.add('inverted');

modeButton?.addEventListener('click', () => {
  const isInverted = document.body.classList.toggle('inverted');
  modeButton.setAttribute('aria-pressed', String(isInverted));
  localStorage.setItem('portfolio-mode', isInverted ? 'inverted' : 'default');
});
modeButton?.setAttribute('aria-pressed', String(document.body.classList.contains('inverted')));

const clock = select<HTMLElement>('#clock');
const updateClock = () => {
  if (clock) clock.textContent = new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(new Date());
};
updateClock();
window.setInterval(updateClock, 1000);
const year = select<HTMLElement>('#year');
if (year) year.textContent = String(new Date().getFullYear());

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -30px' });
selectAll<HTMLElement>('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
  revealObserver.observe(element);
});

const filterButtons = selectAll<HTMLButtonElement>('[data-filter]');
const cards = selectAll<HTMLElement>('.project-card');
filterButtons.forEach((button) => button.addEventListener('click', () => {
  filterButtons.forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  const filter = button.dataset.filter;
  cards.forEach((card) => {
    const categories = card.dataset.category?.split(' ') ?? [];
    card.classList.toggle('is-hidden', filter !== 'all' && !categories.includes(filter ?? ''));
  });
}));

const canvas = select<HTMLCanvasElement>('#ascii-field');
const context = canvas?.getContext('2d');
const pointerLens = select<HTMLElement>('.pointer-lens');
let pointer = { x: -1000, y: -1000 };
let renderedPointer = { x: -1000, y: -1000 };
let frame = 0;
let lensFrame = 0;
let lensTarget = { x: 0, y: 0 };
let lensPosition = { x: 0, y: 0 };
let lensInitialized = false;

const animatePointerLens = () => {
  if (!pointerLens) return;
  lensPosition.x += (lensTarget.x - lensPosition.x) * 0.1;
  lensPosition.y += (lensTarget.y - lensPosition.y) * 0.1;
  pointerLens.style.transform = `translate3d(${lensPosition.x - 75}px, ${lensPosition.y - 75}px, 0)`;

  const distance = Math.hypot(lensTarget.x - lensPosition.x, lensTarget.y - lensPosition.y);
  lensFrame = distance > 0.1 ? window.requestAnimationFrame(animatePointerLens) : 0;
};

const movePointerLens = (event: PointerEvent) => {
  if (!pointerLens) return;
  lensTarget = { x: event.clientX, y: event.clientY };
  if (!lensInitialized) {
    lensPosition = { ...lensTarget };
    lensInitialized = true;
  }
  pointerLens.classList.add('active');
  const target = event.target instanceof Element ? event.target : null;
  pointerLens.classList.toggle('on-dark', Boolean(target?.closest('.skills, .articles')));
  if (!lensFrame) lensFrame = window.requestAnimationFrame(animatePointerLens);
};

const asciiRamp = ' .:-=+*#%@';

const drawAsciiField = () => {
  if (!canvas || !context) return;
  const ratio = Math.min(window.devicePixelRatio, 2);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  context.clearRect(0, 0, width, height);
  const dark = document.body.classList.contains('inverted');
  const characterWidth = width < 600 ? 10 : 13;
  const lineHeight = width < 600 ? 14 : 17;
  const fontSize = width < 600 ? 9 : 11;
  const centerX = width < 600 ? width * .72 : width * .76;
  const centerY = height * .46;
  const radiusX = width < 600 ? width * .31 : width * .23;
  const radiusY = height * .34;
  context.font = `${fontSize}px "IBM Plex Mono", monospace`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  if (pointer.x > -500 && renderedPointer.x < -500) renderedPointer = { ...pointer };
  if (pointer.x > -500) {
    renderedPointer.x += (pointer.x - renderedPointer.x) * 0.1;
    renderedPointer.y += (pointer.y - renderedPointer.y) * 0.1;
  }
  for (let y = lineHeight / 2, row = 0; y < height; y += lineHeight, row += 1) {
    for (let x = characterWidth / 2, column = 0; x < width; x += characterWidth, column += 1) {
      const normalizedX = (x - centerX) / radiusX;
      const normalizedY = (y - centerY) / radiusY;
      const radius = Math.hypot(normalizedX, normalizedY);
      const texture = (Math.sin(normalizedX * 8 + normalizedY * 5 + frame * .018) + 1) / 2;
      const contour = Math.max(0, 1 - Math.abs(radius - .7) * 5);
      const noise = ((column * 17 + row * 31) % 101) / 100;
      let density = radius < 1 ? .12 + texture * .3 + contour * .48 : noise > .975 ? .12 : 0;
      const distance = Math.hypot(renderedPointer.x - x, renderedPointer.y - y);
      const influence = Math.max(0, 1 - distance / 150);
      density = Math.min(1, density + influence * .72);
      const character = asciiRamp[Math.floor(density * (asciiRamp.length - 1))];
      if (character === ' ') continue;
      const offsetX = influence ? (x - renderedPointer.x) * influence * .035 : 0;
      const alpha = .18 + density * .62;
      context.fillStyle = dark ? `rgba(234,246,248,${alpha})` : `rgba(9,11,12,${alpha})`;
      context.fillText(character, x + offsetX, y);
    }
  }
  frame += 1;
  requestAnimationFrame(drawAsciiField);
};

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('pointermove', (event) => {
    pointer = { x: event.clientX, y: event.clientY };
    movePointerLens(event);
  });
  window.addEventListener('pointerleave', () => {
    pointer = { x: -1000, y: -1000 };
    renderedPointer = { x: -1000, y: -1000 };
    pointerLens?.classList.remove('active');
  });
}
drawAsciiField();
