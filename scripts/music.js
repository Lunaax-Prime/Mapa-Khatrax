/* Noosphere: audio fornecido pelo administrador, em assets/noosphere.mp3.
   Navegadores podem bloquear som sem um gesto do visitante. */
(function () {
  "use strict";
  var audio = document.getElementById("khatrax-soundtrack");
  var control = document.getElementById("music-toggle");
  var controlLabel = document.getElementById("music-toggle-symbol");
  var bootControl = document.getElementById("boot-music-toggle");
  var bootLabel = document.getElementById("boot-music-label");
  var status = document.getElementById("music-status");
  var volume = document.getElementById("music-volume");
  if (!audio || !control || !bootControl || !status || !volume) return;

  var manuallyPaused = false;
  var missingAsset = false;
  var blockedByBrowser = false;
  var audioErrorDetail = "";

  audio.volume = 0.38;
  audio.loop = true;

  function refresh() {
    var playing = !audio.paused && !audio.ended;
    control.setAttribute("aria-pressed", String(playing));
    bootControl.setAttribute("aria-pressed", String(playing));
    control.setAttribute("aria-label", playing ? "Pausar Noosphere" : "Reproduzir Noosphere");
    bootControl.setAttribute("aria-label", playing ? "Silenciar o cântico" : "Ativar o cântico");
    controlLabel.textContent = playing ? "❚❚" : "▶";
    bootLabel.textContent = playing ? "SILENCIAR CÂNTICO" : "ATIVAR CÂNTICO";
    if (missingAsset) {
      control.disabled = true;
      bootControl.disabled = true;
      status.textContent = "MP3 NÃO ENCONTRADO";
      bootLabel.textContent = "ÁUDIO INDISPONÍVEL";
      return;
    }
    control.disabled = false;
    bootControl.disabled = false;
    if (playing) {
      status.textContent = audio.muted || audio.volume === 0
        ? "TRANSMISSÃO SILENCIADA"
        : "CÂNTICO // ATIVO";
    } else if (manuallyPaused) {
      status.textContent = "TRANSMISSÃO PAUSADA";
    } else if (blockedByBrowser) {
      status.textContent = "CLIQUE PARA DESPERTAR";
    } else {
      status.textContent = "AGUARDANDO INVOCAÇÃO";
    }
  }

  function awaken() {
    if (missingAsset || manuallyPaused || !audio.paused) return;
    var playPromise;
    try {
      playPromise = audio.play();
    } catch (error) {
      blockedByBrowser = true;
      refresh();
      return;
    }
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.then(function () {
        blockedByBrowser = false;
        refresh();
      }).catch(function (error) {
        if (error && error.name === "NotAllowedError") blockedByBrowser = true;
        if (error && error.name === "NotSupportedError") missingAsset = true;
        refresh();
      });
    }
  }

  function toggle() {
    if (missingAsset) return;
    if (!audio.paused) {
      manuallyPaused = true;
      audio.pause();
    } else {
      manuallyPaused = false;
      blockedByBrowser = false;
      awaken();
    }
    refresh();
  }

  control.addEventListener("click", toggle);
  bootControl.addEventListener("click", toggle);
  volume.addEventListener("input", function () {
    var value = Number(volume.value);
    if (!Number.isFinite(value)) value = 38;
    audio.volume = Math.max(0, Math.min(1, value / 100));
    audio.muted = value <= 0;
    refresh();
  });

  ["playing", "pause", "volumechange", "canplay"].forEach(function (name) {
    audio.addEventListener(name, refresh);
  });
  audio.addEventListener("error", function () {
    missingAsset = true;
    audioErrorDetail = audio.error ? String(audio.error.code) : "unknown";
    refresh();
    console.warn("Noosphere nao foi carregada. Confirme assets/noosphere.mp3 (erro " + audioErrorDetail + ").");
  });

  // Autoplay pode ser permitido pelo navegador. Se for bloqueado, toca
  // ao primeiro gesto no site, sem interceptar os botoes de audio.
  function isMusicControl(target) {
    return target && target.closest &&
      target.closest("#music-toggle, #boot-music-toggle, #music-volume");
  }
  function firstGesture(event) {
    if (isMusicControl(event.target)) return;
    if (missingAsset || manuallyPaused || !audio.paused) return;
    awaken();
  }
  document.addEventListener("pointerdown", firstGesture, { capture: true });
  document.addEventListener("keydown", function (event) {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    if (isMusicControl(event.target)) return;
    firstGesture(event);
  }, { capture: true });

  refresh();
  awaken();
}());
