requestAnimationFrame(function() {
setTimeout(function() {
(function() {
'use strict';
var hamburger = document.querySelector('.hamburger') || document.querySelector('.header__hamburger');
var mobileMenu = document.getElementById('mobile-menu') || document.querySelector('.header__mobile-menu');
if (hamburger && mobileMenu) {
hamburger.addEventListener('click', function() {
var isOpen = hamburger.classList.toggle('is-open');
hamburger.setAttribute('aria-expanded', isOpen);
if (mobileMenu.hidden !== undefined) mobileMenu.hidden = !isOpen;
else mobileMenu.classList.toggle('is-open');
});
mobileMenu.querySelectorAll('a').forEach(function(link) {
link.addEventListener('click', function() {
hamburger.classList.remove('is-open');
hamburger.setAttribute('aria-expanded', 'false');
if (mobileMenu.hidden !== undefined) mobileMenu.hidden = true;
else mobileMenu.classList.remove('is-open');
});
});
}
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
anchor.addEventListener('click', function(e) {
var id = this.getAttribute('href');
if (id === '#') return;
var el = document.querySelector(id);
if (el) {
e.preventDefault();
var hdr = document.querySelector('.site-header') || document.querySelector('.header-wrapper');
var offset = hdr ? hdr.offsetHeight + 16 : 80;
window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - offset, behavior: 'smooth' });
}
});
});
(function() {
var current = window.pageYOffset;
var target = current;
var active = false;
function lerp() {
if (!active) return;
var diff = target - current;
if (Math.abs(diff) > 0.5) {
current += diff * 0.04;
window.scrollTo(0, Math.round(current));
}
requestAnimationFrame(lerp);
}
window.addEventListener('wheel', function(e) {
e.preventDefault();
if (!active) {
active = true;
current = window.pageYOffset;
target = current;
requestAnimationFrame(lerp);
}
target += e.deltaY;
var max = document.body.scrollHeight - window.innerHeight;
target = Math.max(0, Math.min(target, max));
}, { passive: false });
window.addEventListener('keydown', function(e) {
var tag = document.activeElement && document.activeElement.tagName;
if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement.isContentEditable) return;
if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
target = Math.min(target + window.innerHeight * 0.8, document.body.scrollHeight - window.innerHeight);
e.preventDefault();
}
if (e.key === 'ArrowUp' || e.key === 'PageUp') {
target = Math.max(target - window.innerHeight * 0.8, 0);
e.preventDefault();
}
if (e.key === 'Home') { target = 0; e.preventDefault(); }
if (e.key === 'End') { target = document.body.scrollHeight - window.innerHeight; e.preventDefault(); }
});
window._smoothScrollTo = function(y) { target = y; };
})();
var progressBar = document.querySelector('.scroll-progress');
var backToTop = document.querySelector('.back-to-top');
if (backToTop) {
backToTop.addEventListener('click', function() {
if (window._smoothScrollTo) window._smoothScrollTo(0);
else window.scrollTo({ top: 0, behavior: 'smooth' });
});
}
var stickyCta = document.querySelector('.sticky-cta');
var stickyDismissed = false;
var stickyClose = document.querySelector('.sticky-cta__close');
if (stickyClose) {
stickyClose.addEventListener('click', function() {
stickyDismissed = true;
stickyCta.classList.remove('is-visible');
});
}
var heroMedia = document.querySelector('.hero-media');
var ticking = false;
window.addEventListener('scroll', function() {
if (!ticking) {
requestAnimationFrame(function() {
var sy = window.pageYOffset;
var dh = document.documentElement.scrollHeight - window.innerHeight;
if (progressBar && dh > 0) progressBar.style.width = (sy / dh * 100) + '%';
if (heroMedia && sy < window.innerHeight) heroMedia.style.transform = 'translateY(' + (sy * 0.35) + 'px) scale(1.05)';
if (backToTop) backToTop.classList.toggle('is-visible', sy > 600);
if (stickyCta && !stickyDismissed) stickyCta.classList.toggle('is-visible', sy > 800);
ticking = false;
});
ticking = true;
}
}, { passive: true });
document.querySelectorAll('.project-card').forEach(function(card) {
card.addEventListener('mousemove', function(e) {
var r = card.getBoundingClientRect();
var x = (e.clientX - r.left) / r.width - 0.5;
var y = (e.clientY - r.top) / r.height - 0.5;
card.style.transform = 'perspective(800px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg) translateY(-4px)';
});
card.addEventListener('mouseleave', function() { card.style.transform = ''; });
});
document.querySelectorAll('.btn-primary, .btn-lg, .nav-cta').forEach(function(btn) {
btn.addEventListener('mousemove', function(e) {
var r = btn.getBoundingClientRect();
btn.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.12) + 'px)';
});
btn.addEventListener('mouseleave', function() { btn.style.transform = ''; });
});
document.querySelectorAll('.service-link[data-expand]').forEach(function(btn) {
btn.addEventListener('click', function(e) {
e.preventDefault();
var card = btn.closest('.service-card');
var isExpanded = card.classList.toggle('is-expanded');
var arrow = btn.querySelector('span');
if (arrow) arrow.innerHTML = isExpanded ? '&#8593;' : '&#8595;';
});
});
var cd = document.querySelector('.custom-cursor');
var cr = document.querySelector('.custom-cursor-ring');
if (cd && cr && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
var mx = 0, my = 0, cursorActive = false;
function startCursorLoop() {
if (cursorActive) return;
cursorActive = true;
(function aR() {
var rx = parseFloat(cr.style.left) || mx, ry = parseFloat(cr.style.top) || my;
cr.style.left = (rx + (mx - rx) * 0.15) + 'px';
cr.style.top = (ry + (my - ry) * 0.15) + 'px';
requestAnimationFrame(aR);
})();
}
document.addEventListener('mousemove', function(e) {
mx = e.clientX; my = e.clientY;
cd.style.left = mx - 4 + 'px'; cd.style.top = my - 4 + 'px';
cd.classList.add('is-visible'); cr.classList.add('is-visible');
startCursorLoop();
});
document.querySelectorAll('a, button, .service-card, .project-card').forEach(function(el) {
el.addEventListener('mouseenter', function() { cr.classList.add('is-hovering'); });
el.addEventListener('mouseleave', function() { cr.classList.remove('is-hovering'); });
});
}
})();
}, 0);
});