/* On-screen controls for phones and tablets: a D-pad (hold to walk) and an action button. */
'use strict';

const Touch = {
  active: false,
  init() {
    const coarse = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || ('ontouchstart' in window);
    if (!coarse) return;
    this.active = true;
    document.body.classList.add('touch');
    const layer = document.getElementById('touch');
    layer.classList.remove('hidden');
    const held = new Set();
    const apply = () => {
      let x = 0, y = 0;
      if (held.has('left')) x -= 1; if (held.has('right')) x += 1;
      if (held.has('up')) y -= 1; if (held.has('down')) y += 1;
      Input.touch = { x, y };
    };
    for (const b of layer.querySelectorAll('#dpad button')) {
      const d = b.dataset.d;
      const on = (e) => { e.preventDefault(); held.add(d); b.classList.add('on'); apply(); };
      const off = (e) => { e.preventDefault(); held.delete(d); b.classList.remove('on'); apply(); };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off);
      b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off);
      b.addEventListener('contextmenu', e => e.preventDefault());
    }
    // sliding a thumb across the pad: track which button is under the pointer
    layer.querySelector('#dpad').addEventListener('pointermove', (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || !el.dataset || !el.dataset.d) return;
      if (e.buttons && !held.has(el.dataset.d)) { held.clear(); for (const b of layer.querySelectorAll('#dpad button')) b.classList.remove('on'); held.add(el.dataset.d); el.classList.add('on'); apply(); }
    });
    const a = document.getElementById('btn-a');
    a.addEventListener('pointerdown', (e) => { e.preventDefault(); Input.pressedKeys[' '] = true; a.classList.add('on'); });
    a.addEventListener('pointerup', (e) => { e.preventDefault(); a.classList.remove('on'); });
    a.addEventListener('contextmenu', e => e.preventDefault());
    // hide the pad while a dialogue or panel is open
    const obs = new MutationObserver(() => {
      const busy = !document.getElementById('dialogue').classList.contains('hidden') || !document.getElementById('tray').classList.contains('hidden')
        || !document.getElementById('fullscreen').classList.contains('hidden') || !document.getElementById('card-pop').classList.contains('hidden');
      layer.style.visibility = busy ? 'hidden' : 'visible';
      if (busy) { held.clear(); Input.touch = { x: 0, y: 0 }; }
    });
    for (const id of ['dialogue', 'tray', 'fullscreen', 'card-pop']) obs.observe(document.getElementById(id), { attributes: true, attributeFilter: ['class'] });
    const rotate = () => document.getElementById('rotate').classList.toggle('hidden', window.innerWidth >= window.innerHeight || window.innerWidth >= 900);
    window.addEventListener('resize', rotate); rotate();
  },
};
