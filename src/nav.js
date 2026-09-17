// The concept list is rendered once, in the sidebar. Below the mobile
// breakpoint that sidebar becomes an off-canvas drawer this toggle opens,
// so the 35 links never need a second copy in the markup.
const toggle = document.querySelector('.nav-toggle');
const sidebar = document.getElementById('concept-sidebar');
const backdrop = document.querySelector('.nav-backdrop');

if (toggle && sidebar) {
  const isOpen = () => document.body.hasAttribute('data-nav-open');

  const setOpen = (open) => {
    document.body.toggleAttribute('data-nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (backdrop) backdrop.hidden = !open;
  };

  toggle.addEventListener('click', () => {
    const opening = !isOpen();
    setOpen(opening);
    if (opening) sidebar.querySelector('a, summary')?.focus();
  });

  if (backdrop) backdrop.addEventListener('click', () => setOpen(false));

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !isOpen()) return;
    setOpen(false);
    toggle.focus();
  });

  // Following a link inside the drawer navigates away, but closing keeps the
  // state clean for same-page anchors and back-forward cache restores.
  sidebar.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
}
