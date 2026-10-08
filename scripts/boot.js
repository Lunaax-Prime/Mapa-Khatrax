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
      line: "The flesh is weak.",
      source: "TRADITIONAL ADEPTUS MECHANICUS LITANY"
    },
    {
      line: "The eyes of the Omnissiah are ever upon us.",
      source: "MECHANICUS ARCHIVES"
    },
    {
      line: "The Omnissiah directs our footsteps along the path of knowledge.",
      source: "SOYLENS VIRIDIANS // FOR THE MACHINE-SPIRIT"
    },
    {
      line: "Awaken, machine-spirit. Guide our sacred sight.",
      source: "KHATRAX // INVOCATION OF THE AUSPEX"
    },
    {
      line: "Steel endures. The blessed circuits remember.",
      source: "KHATRAX // ORIGINAL DATA-PSALM"
    }
  ];

  const phaseData = [
    { at: 0, text: "01001001 // INVOKING THE MACHINE-GOD" },
    { at: 21, text: "RECITING THE BINARY LITANIES" },
    { at: 44, text: "AWAKENING THE MACHINE-SPIRIT" },
    { at: 71, text: "CONSECRATING NAVIGATION MATRICES" },
    { at: 91, text: "AUSPEX SANCTIFIED // COORDINATES ONLINE" }
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
    status.textContent = "ACCESS GRANTED // PRAISE THE OMNISSIAH";
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
