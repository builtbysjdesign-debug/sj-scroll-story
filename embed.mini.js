(function(){
  if (window.__sjxSideScrollInit) return;
  window.__sjxSideScrollInit = true;

  var STYLE_ATTR = 'data-sjx';
  var STYLE_VALUE = 'side-scroll';
  var DEFAULTS = { gap: 16, pad: 0, buttons: true, wheel: true, step: 0.9 };

  var toNumber = function (value, fallback) {
    var n = typeof value === 'string' ? parseFloat(value) : Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  var injectCssOnce = function () {
    if (document.querySelector('style[' + STYLE_ATTR + '="' + STYLE_VALUE + '"]')) return;
    var style = document.createElement('style');
    style.setAttribute(STYLE_ATTR, STYLE_VALUE);
    style.textContent =
      '.sjx-side-scroll{position:relative;width:100%;}' +
      '.sjx-side-scroll__viewport{overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none;}' +
      '.sjx-side-scroll__viewport::-webkit-scrollbar{display:none;}' +
      '.sjx-side-scroll__track{display:flex;gap:var(--sjx-gap,16px);padding:0 var(--sjx-pad,0px);width:max-content;}' +
      '.sjx-side-scroll__track>*{flex:0 0 auto;scroll-snap-align:start;}' +
      '.sjx-side-scroll__btn{position:absolute;top:50%;transform:translateY(-50%);z-index:2;border:0;background:rgba(0,0,0,0.55);color:#fff;width:36px;height:36px;border-radius:999px;display:flex;align-items:center;justify-content:center;cursor:pointer;}' +
      '.sjx-side-scroll__btn--prev{left:8px;}' +
      '.sjx-side-scroll__btn--next{right:8px;}' +
      '.sjx-side-scroll__btn:focus-visible{outline:2px solid #fff;outline-offset:2px;}' +
      '@media (pointer:coarse){.sjx-side-scroll__btn{display:none;}}';
    document.head.appendChild(style);
  };

  var parseOptions = function (hook) {
    var raw = hook.getAttribute('data-sj-options');
    var data = {};
    if (raw) {
      try { data = JSON.parse(raw); } catch (e) { data = {}; }
    }
    var opts = {
      gap: toNumber(data.gap, DEFAULTS.gap),
      pad: toNumber(data.pad, DEFAULTS.pad),
      buttons: data.buttons === false ? false : DEFAULTS.buttons,
      wheel: data.wheel === false ? false : DEFAULTS.wheel,
      step: toNumber(data.step, DEFAULTS.step)
    };
    if (opts.gap < 0) opts.gap = DEFAULTS.gap;
    if (opts.pad < 0) opts.pad = DEFAULTS.pad;
    if (!(opts.step > 0)) opts.step = DEFAULTS.step;
    return opts;
  };

  var moveNodes = function (target, track, hook) {
    var nodes = Array.prototype.slice.call(target.children);
    nodes.forEach(function (node) {
      if (node === hook && target !== hook) {
        target.removeChild(node);
        return;
      }
      track.appendChild(node);
    });
  };

  var initInstance = function (hook) {
    var targetSelector = hook.getAttribute('data-sj-target');
    var target = targetSelector ? document.querySelector(targetSelector) : hook;
    if (!target) return;
    if (target.dataset.sjxSideScrollInit === '1') return;
    if (Array.prototype.some.call(target.children, function (child) {
      return child.classList && child.classList.contains('sjx-side-scroll');
    })) {
      target.dataset.sjxSideScrollInit = '1';
      return;
    }

    var opts = parseOptions(hook);

    var wrapper = document.createElement('div');
    wrapper.className = 'sjx-side-scroll';
    wrapper.style.setProperty('--sjx-gap', opts.gap + 'px');
    wrapper.style.setProperty('--sjx-pad', opts.pad + 'px');

    var viewport = document.createElement('div');
    viewport.className = 'sjx-side-scroll__viewport';

    var track = document.createElement('div');
    track.className = 'sjx-side-scroll__track';

    moveNodes(target, track, hook);

    viewport.appendChild(track);
    wrapper.appendChild(viewport);

    if (opts.buttons) {
      var prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'sjx-side-scroll__btn sjx-side-scroll__btn--prev';
      prev.setAttribute('aria-label', 'Scroll previous');
      prev.textContent = '<';

      var next = document.createElement('button');
      next.type = 'button';
      next.className = 'sjx-side-scroll__btn sjx-side-scroll__btn--next';
      next.setAttribute('aria-label', 'Scroll next');
      next.textContent = '>';

      prev.addEventListener('click', function () {
        viewport.scrollBy({ left: -viewport.clientWidth * opts.step, behavior: 'smooth' });
      });
      next.addEventListener('click', function () {
        viewport.scrollBy({ left: viewport.clientWidth * opts.step, behavior: 'smooth' });
      });

      wrapper.appendChild(prev);
      wrapper.appendChild(next);
    }

    if (opts.wheel) {
      viewport.addEventListener('wheel', function (e) {
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        e.preventDefault();
        viewport.scrollLeft += e.deltaY;
      }, { passive: false });
    }

    target.appendChild(wrapper);
    target.dataset.sjxSideScrollInit = '1';
  };

  var initAll = function () {
    injectCssOnce();
    var hooks = document.querySelectorAll('[data-sj-side-scroll]');
    if (!hooks.length) return;
    hooks.forEach(initInstance);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll, { once: true });
  } else {
    initAll();
  }
})();
