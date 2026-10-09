/* Efeitos sonoros discretos do cogitador, sintetizados sem arquivos externos. */
(function () {
  "use strict";
  var Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;
  var context = null;
  var lastHover = 0;
  var master = null;
  var selector = 'button:not(:disabled), [data-world], a[href], input[type="range"]';
  function unlock() {
    if (!context) {
      try {
        context = new Context();
        master = context.createGain();
        master.gain.value = 0.85;
        master.connect(context.destination);
      } catch (_) { return; }
    }
    if (context.state === "suspended") context.resume().catch(function () {});
  }
  function beep(type) {
    if (!context || !master) return;
    var now = context.currentTime;
    var hover = type === "hover";
    var duration = hover ? 0.048 : 0.105;
    // Pulsos quadrados e frequencias em degraus: interface binaria industrial.
    var oscillator = context.createOscillator();
    var gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(hover ? 1250 : 780, now);
    oscillator.frequency.setValueAtTime(hover ? 1680 : 540, now + (hover ? .019 : .035));
    if (!hover) oscillator.frequency.setValueAtTime(390, now + .072);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.linearRampToValueAtTime(hover ? .105 : .175, now + .002);
    gain.gain.setValueAtTime(hover ? .105 : .175, now + (hover ? .028 : .072));
    gain.gain.linearRampToValueAtTime(.0001, now + duration);
    var filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = hover ? 2700 : 1950;
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    oscillator.start(now);
    oscillator.stop(now + duration + .005);
    oscillator.onended = function () {
      oscillator.disconnect(); filter.disconnect(); gain.disconnect();
    };
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
      beep("click");
    }
  }, { capture: true });
  document.addEventListener("keydown", function (event) {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    var target = event.target.closest && event.target.closest(selector);
    if (!target) return;
    unlock();
    beep("click");
  }, { capture: true });
}());
