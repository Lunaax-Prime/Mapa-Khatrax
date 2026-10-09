/* Efeitos sonoros discretos do cogitador, sintetizados sem arquivos externos. */
(function () {
  "use strict";
  var Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;
  var context = null;
  var lastHover = 0;
  var selector = 'button:not(:disabled), [data-world], a[href], input[type="range"]';
  function unlock() {
    if (!context) {
      try { context = new Context(); } catch (_) { return; }
    }
    if (context.state === "suspended") context.resume().catch(function () {});
  }
  function beep(type) {
    if (!context || context.state !== "running") return;
    var now = context.currentTime;
    var oscillator = context.createOscillator();
    var gain = context.createGain();
    oscillator.type = type === "hover" ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(type === "hover" ? 720 : 470, now);
    oscillator.frequency.exponentialRampToValueAtTime(type === "hover" ? 920 : 260, now + (type === "hover" ? .045 : .095));
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(type === "hover" ? .018 : .038, now + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, now + (type === "hover" ? .065 : .13));
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + (type === "hover" ? .07 : .14));
    oscillator.onended = function () { oscillator.disconnect(); gain.disconnect(); };
  }
  document.addEventListener("pointerover", function (event) {
    if (event.pointerType === "touch") return;
    var target = event.target.closest && event.target.closest(selector);
    if (!target || (event.relatedTarget && target.contains(event.relatedTarget))) return;
    var now = performance.now();
    if (now - lastHover < 95) return;
    lastHover = now;
    beep("hover");
  });
  document.addEventListener("pointerdown", function (event) {
    unlock();
    if (event.target.closest && event.target.closest(selector)) {
      if (context && context.state === "running") beep("click");
      else if (context) context.resume().then(function () { beep("click"); }).catch(function () {});
    }
  }, { capture: true });
  document.addEventListener("keydown", function (event) {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    var target = event.target.closest && event.target.closest(selector);
    if (!target) return;
    unlock();
    if (context && context.state === "running") beep("click");
  }, { capture: true });
}());
