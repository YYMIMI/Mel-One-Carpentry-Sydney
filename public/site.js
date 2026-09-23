window.dataLayer ||= [];
const menu = document.getElementById('menu-toggle');
const nav = document.getElementById('primary-nav');
if (menu && nav) {
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (!open) nav.querySelectorAll('details[open]').forEach(item => item.open=false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const expanded=nav.querySelector('details[open]');
    if (expanded) { expanded.open=false; expanded.querySelector('summary').focus(); }
    else if (nav.classList.contains('is-open')) { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded','false'); menu.focus(); }
  });
  document.addEventListener('click',event=>{
    if (!nav.contains(event.target) && event.target!==menu) nav.querySelectorAll('details[open]').forEach(item=>item.open=false);
  });
  nav.addEventListener('click',event=>{
    if (!event.target.closest('a')) return;
    nav.querySelectorAll('details[open]').forEach(item=>item.open=false);
    nav.classList.remove('is-open'); menu.setAttribute('aria-expanded','false');
  });
}
document.querySelectorAll('a[data-event="phone_click"],a[data-event="email_click"]').forEach(link => {
  link.addEventListener('click', () => {
    window.dataLayer?.push({ event: link.dataset.event, page_path: location.pathname, locale: document.documentElement.lang });
  });
});
const workGallery = document.querySelector('#selected-work .case-grid');
if (workGallery) {
  document.querySelectorAll('#selected-work .case-scroll-control').forEach(button => {
    button.addEventListener('click', () => {
      const card = workGallery.querySelector('.case-card');
      if (!card) return;
      const distance = card.getBoundingClientRect().width + 16;
      const direction = button.dataset.direction === 'previous' ? -1 : 1;
      workGallery.scrollBy({ left: direction * distance, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  });
}
