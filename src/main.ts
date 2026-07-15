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

const canvas = select<HTMLCanvasElement>('#dot-field');
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

const drawDots = () => {
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
  const spacing = width < 600 ? 18 : 22;
  const drift = Math.sin(frame * 0.012) * 2;
  if (pointer.x > -500 && renderedPointer.x < -500) renderedPointer = { ...pointer };
  if (pointer.x > -500) {
    renderedPointer.x += (pointer.x - renderedPointer.x) * 0.1;
    renderedPointer.y += (pointer.y - renderedPointer.y) * 0.1;
  }
  for (let y = spacing / 2; y < height; y += spacing) {
    for (let x = spacing / 2; x < width; x += spacing) {
      const distance = Math.hypot(renderedPointer.x - x, renderedPointer.y - y);
      const influence = Math.max(0, 1 - distance / 150);
      const radius = .65 + influence * 1.5;
      const offsetX = influence ? (x - renderedPointer.x) * influence * .025 : drift;
      context.beginPath();
      context.arc(x + offsetX, y, radius, 0, Math.PI * 2);
      context.fillStyle = dark ? `rgba(234,246,248,${.14 + influence * .45})` : `rgba(9,11,12,${.12 + influence * .48})`;
      context.fill();
    }
  }
  frame += 1;
  requestAnimationFrame(drawDots);
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
drawDots();
