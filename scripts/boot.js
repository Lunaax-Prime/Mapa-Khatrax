/* Sequencia cenografica de abertura: nao representa uma carga real do servidor. */
(function () {
  "use strict";

  const overlay = document.getElementById("boot-screen");
  const skip = document.getElementById("boot-skip");
  const quote = document.getElementById("boot-quote");
  const source = document.getElementById("boot-verse");
  const status = document.getElementById("boot-status");
  const progress = document.getElementById("boot-progress");
  const fill = document.getElementById("boot-progress-fill");
  const percent = document.getElementById("boot-percent");

  if (!overlay || !skip || !quote || !source || !status || !fill || !percent) {
    document.body.classList.remove("booting");
    return;
  }

  const reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reducedMotion ? 650 : 4900;

  // Trechos curtos reconheciveis e novas litanias originais para o Mapa Khatrax.
  // Referencias: Lexicanum (Adeptus Mechanicus Quotes e Portal:Quotes).
  const litanies = [
    {
      line: "The flesh is weak. The Machine endures.",
      source: "MECHANICUS CREED // LITANY OF STEEL"
    },
    {
      line: "The Omnissiah beholds all circuits, seen and unseen.",
      source: "KHATRAX // CANTICLE OF THE WATCHFUL MACHINE"
    },
    {
      line: "By sacred calculus, the Omnissiah reveals the path.",
      source: "KHATRAX // RITE OF NOOSPHERIC GUIDANCE"
    },
    {
      line: "Awaken, O Machine-Spirit, and reveal thy holy purpose.",
      source: "KHATRAX // THE INVOCATION OF AUSPEX"
    },
    {
      line: "Blessed be the Motive Force, for the Machine knows no death.",
      source: "KHATRAX // DATA-PSALM OF THE ENDLESS GEAR"
    }
  ];

  const phaseData = [
    { at: 0, text: "01001001 // CHANTING THE RITE OF IGNITION" },
    { at: 21, text: "RECITING THE SACRED BINHARIC LITANIES" },
    { at: 44, text: "ENTREATING THE MACHINE-SPIRIT" },
    { at: 71, text: "SANCTIFYING NOOSPHERIC CARTOGRAPHICA" },
    { at: 91, text: "AUSPEX CONSECRATED // STELLAR VECTORS RECEIVED" }
  ];

  let finished = false;
  let start = null;
  let raf = 0;
  let lastPhase = -1;
  let quoteTimeout = 0;
  let revealTimeout = 0;

  function drawProgress(value) {
    const val = Math.max(0, Math.min(100, Math.floor(value)));
    fill.style.width = val + "%";
    percent.textContent = String(val).padStart(3, "0") + "%";
    if (progress) progress.setAttribute("aria-valuenow", String(val));
    for (let i = phaseData.length - 1; i >= 0; i--) {
      if (val >= phaseData[i].at) {
        if (lastPhase !== i) {
          status.textContent = phaseData[i].text;
          lastPhase = i;
        }
        break;
      }
    }
  }

  function complete() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    clearTimeout(quoteTimeout);
    clearTimeout(revealTimeout);
    drawProgress(100);
    status.textContent = "ACCESS SANCTIONED // OMNISSIAH BE PRAISED";
    skip.disabled = true;
    document.body.classList.remove("booting");
    overlay.classList.add("is-leaving");
    window.setTimeout(function () {
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden", "true");
    }, reducedMotion ? 0 : 830);
  }

  function animate(now) {
    if (finished) return;
    if (start === null) start = now;
    const elapsed = now - start;
    const ratio = Math.min(1, elapsed / duration);
    // Progresso visual nao indica carregamento de dados reais.
    drawProgress(100 * ratio);
    if (ratio >= 1) {
      complete();
    } else {
      raf = requestAnimationFrame(animate);
    }
  }

  function secondLitany() {
    if (finished) return;
    const selected = litanies[Math.floor(Math.random() * litanies.length)];
    quote.classList.add("is-changing");
    quoteTimeout = window.setTimeout(function () {
      if (finished) return;
      quote.textContent = selected.line;
      source.textContent = selected.source;
      quote.classList.remove("is-changing");
    }, 360);
  }

  skip.addEventListener("click", complete);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !finished) {
      event.preventDefault();
      complete();
    }
  });

  if (reducedMotion) {
    drawProgress(100);
    revealTimeout = window.setTimeout(complete, duration);
  } else {
    drawProgress(0);
    quoteTimeout = window.setTimeout(secondLitany, 2500);
    raf = requestAnimationFrame(animate);
    revealTimeout = window.setTimeout(complete, duration + 600);
  }
}());
