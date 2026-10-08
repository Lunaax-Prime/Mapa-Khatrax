/* Mapa Auspex do Sistema Khatrax - cartografia verde interativa */
(function () {
  "use strict";

  var layer = document.getElementById("map-layer");
  if (!layer) return;

  var bodies = [
    { id: "star", name: "Estrela do Sistema Khatrax",
      type: "ASTRUM PRIMARIS / ÂNCORA GRAVÍTICA",
      faction: "Divisio Cartographica / Adeptus Mechanicus",
      text: "No coração de Khatrax arde o astro primordial. Sua luz e sua gravidade alimentam os cálculos sagrados dos cogitadores, guiando as rotas cartográficas consagradas ao Omnissiah." },
    { id: "primus", name: "Khatrax Primus",
      type: "MUNDUS FORMICARIUS / TRONO DO SISTEMA",
      faction: "Astra Militarum / Guarda Imperial",
      text: "Trono administrativo e militar de Khatrax. Sob incontáveis espiras de ferro, multidões de súditos do Imperador vivem à sombra das colmeias; nelas, a Guarda Imperial vigia a ordem e recolhe os dízimos da Coroa." },
    { id: "secundus", name: "Khatrax Secundus",
      type: "GIGANTE GASOSO / ALTARES DE REFINO",
      faction: "Ministorum Industria / Logística Imperial",
      text: "Nos abismos gasosos de Secundus operam santuários de refino, onde o combustível é extraído em perpétua penitência mecânica. Duas luas sustentam seu tributo: Heliphant I, a mina, e Heliophant II, a forja." },
    { id: "heliphant-i", name: "Heliphant I",
      type: "SATELLITA FERRUM / MUNDO DE EXTRAÇÃO",
      faction: "Corporação Mineira / Ofícios de Extração",
      text: "Sob uma crosta de rocha e cinzas, a primeira lua de Secundus entrega seus minérios em dízimos sem fim. Cada veio rompido alimenta os fornos, docas e máquinas sacras do sistema." },
    { id: "heliophant-ii", name: "Heliophant II",
      type: "FORGIA SATELLITA / DOMÍNIO DE MARTE",
      faction: "Adeptus Mechanicus / Sacerdócio de Marte",
      text: "Heliophant II ressoa com hinos bináricos e martelos litúrgicos. Sob a custódia do Adeptus Mechanicus, seus complexos-forja preservam os ritos de produção e a veneração de cada espírito da máquina." },
    { id: "tetrius", name: "Khatrax Tetrius",
      type: "GLACIES MUNDUS / TEMPLOS-ARQUIVO",
      faction: "Adeptus Mechanicus / Crimson Prowlers",
      text: "Além de seus desertos congelados, Tetrius guarda cidades austeras e templos de pesquisa do Mechanicus. Na vastidão glacial ergue-se a fortaleza-monastério dos Crimson Prowlers, capítulo herdeiro dos Space Wolves." },
    { id: "galgans", name: "Galgan's Reach",
      type: "ARSENAL NAVAL / ANCORADOURO SAGRADO",
      faction: "Frotas Imperiais / Imperium Nihilus",
      text: "Bastião de aço e docas intermináveis, Galgan's Reach recebe barcaças imperiais todas as semanas. Seus estaleiros sustentam a guerra e o trânsito de frotas; perdê-los seria um golpe terrível para o Imperium Nihilus." }
  ];
  var entries = Object.create(null);
  bodies.forEach(function (body) { entries[body.id] = body; });

  var center = { x: 460, y: 302 };
  var primus = { x: 346, y: 248 };
  var secundus = { x: 675, y: 397 };
  var tetrius = { x: 670, y: 110 };
  var reach = { x: 815, y: 460 };
  var heliphant = {
    x: +(secundus.x + 63 * Math.cos(3.72)).toFixed(1),
    y: +(secundus.y + 44 * Math.sin(3.72)).toFixed(1)
  };
  var heliophant = {
    x: +(secundus.x + 99 * Math.cos(-.85)).toFixed(1),
    y: +(secundus.y + 69 * Math.sin(-.85)).toFixed(1)
  };

  function label(x, y, title, detail, small, alt) {
    return '<text class="map-label' + (small ? ' small' : '') + (alt ? ' alt' : '') +
           '" x="' + x + '" y="' + y + '">' + title + '</text>' +
           '<text class="map-label-sub" x="' + x + '" y="' + (y+14) + '">' + detail + '</text>';
  }
  function nodeStart(id, name, x, y, radius) {
    return '<g class="map-node" data-world="' + id + '" role="button" tabindex="0" ' +
      'aria-pressed="false" aria-label="Ver arquivo: ' + name + '">' +
      '<circle class="map-hit" cx="' + x + '" cy="' + y + '" r="' + radius + '"/>' +
      '<circle class="map-selection" cx="' + x + '" cy="' + y + '" r="' + (radius-3) + '"/>';
  }
  function nodeEnd() { return '</g>'; }

  function sphere(x, y, radius, kind) {
    var r = radius;
    var shapes = '<g transform="translate(' + x + ' ' + y + ')">' +
      '<circle class="map-world-fill" r="' + r + '"/>' +
      '<ellipse class="map-world-wire" rx="' + (r*.36).toFixed(1) + '" ry="' + r + '"/>' +
      '<ellipse class="map-world-wire" rx="' + r + '" ry="' + (r*.34).toFixed(1) + '"/>' +
      '<path class="map-world-wire" d="M0 ' + (-r) + 'V' + r + 'M' + (-r) + ' 0H' + r + '"/>';
    if (kind === "hive") shapes += '<path class="map-world-wire" d="M-13 14v-9h7v-7h7v-9h5v13h7v12"/>';
    if (kind === "ice") shapes += '<path class="map-world-wire" d="M-19-10l12 9 9-17 8 9 8-3M-10 15l9-8 12 8"/>';
    return shapes + '</g>';
  }
  function moon(x, y, r, forge) {
    var marking = forge
      ? '<path class="map-moon-line" d="M-7-2H7M-4-6V7M4-6V7M-7 4H7"/>'
      : '<path class="map-moon-line" d="M-7-4L-2-8 2 0 8 3M-8 5L-2 3 3 9"/>';
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<circle class="map-moon-fill" r="' + r + '"/>' + marking + '</g>';
  }
  function gas(x, y) {
    var stripes = '';
    for (var k=-2;k<=2;k++) {
      var v=k*11;
      stripes += '<path class="map-gas-band" d="M-38 ' + v +
        ' Q0 ' + (v+((k%2)*6)) + ' 38 ' + (v+4) + '"/>';
    }
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<circle class="map-gas-fill" r="32"/>' +
      '<g clip-path="url(#khatrax-gas-mask)">' + stripes + '</g>' +
      '<ellipse class="map-world-wire" rx="14" ry="32" opacity=".4"/>' +
      '</g>';
  }
  function shipyard(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<circle class="map-station-line" r="30"/>' +
      '<circle class="map-station-line" r="19" stroke-dasharray="7 4"/>' +
      '<rect class="map-station-fill" x="-39" y="-10" width="78" height="20"/>' +
      '<rect class="map-station-fill" x="-15" y="-22" width="30" height="44"/>' +
      '<path class="map-station-line" d="M-49-18h20v36h-20ZM29-18h20v36H29ZM-30 0h60M0-37v74"/>' +
      '<circle class="map-station-fill" r="9"/><circle r="3.5" fill="#bdffc3"/>' +
      '<path class="map-station-line" d="M-18-35l-9-17m45 17 9-17M-18 35l-9 17m45-17 9 17"/>' +
      '</g>';
  }

  var background = [];
  for (var a=0;a<16;a++) background.push('<line x1="' + (28+a*74) + '" x2="' + (28+a*74) + '" y1="77" y2="537"/>');
  for (var b=0;b<7;b++) background.push('<line x1="24" x2="1176" y1="' + (110+b*66) + '" y2="' + (110+b*66) + '"/>');
  for (var d=0;d<310;d++) {
    var px=26+((d*137+(d*d)%127)%1137);
    var py=85+((d*83+(d*d)%71)%448);
    var pr=d%13===0?1.75:d%5===0?1.1:.65;
    var op=d%11===0?.42:.13;
    background.push('<circle cx="' + px + '" cy="' + py + '" r="' + pr +
      '" fill="#42ef61" opacity="' + op + '"/>');
  }

  var geometry = [
    '<g aria-hidden="true">',
    '<ellipse class="map-orbit" cx="460" cy="302" rx="145" ry="89"/>',
    '<ellipse class="map-orbit" cx="460" cy="302" rx="270" ry="156"/>',
    '<ellipse class="map-orbit" cx="460" cy="302" rx="382" ry="230"/>',
    '<ellipse class="map-orbit outer" cx="460" cy="302" rx="440" ry="267"/>',
    '<ellipse class="map-ring-secondary" cx="460" cy="302" rx="181" ry="105"/>',
    '<ellipse class="map-ring-secondary" cx="460" cy="302" rx="318" ry="185"/>',
    '<ellipse class="map-moon-orbit" cx="675" cy="397" rx="63" ry="44"/>',
    '<ellipse class="map-moon-orbit" cx="675" cy="397" rx="99" ry="69"/>',
    '<path class="map-path" d="M837 463l105-35 78-61" />',
    '<path class="map-axis" d="M460 76v455M44 302h871" opacity=".2"/>',
    '</g>'
  ].join('');

  var nodes = [];
  nodes.push(
    nodeStart("star", "Estrela do Sistema Khatrax", center.x, center.y, 57) +
    '<g class="map-star-pulse"><circle class="map-star-halo" cx="460" cy="302" r="33"/>' +
    '<circle class="map-star-halo" cx="460" cy="302" r="46" stroke-dasharray="3 9"/>' +
    '<circle class="map-star-fill" cx="460" cy="302" r="23"/></g>' +
    '<path class="map-star-spike" d="M460 256v19m0 53v19m-46-45h19m53 0h19M424 266l15 15m42 42 15 15m-72 0 15-15m42-42 15-15"/>' +
    '<path class="map-leader" d="M435 330L396 361h-43"/>' +
    label(355,375,"KHATRAX SOLARIS","STELLAR SANCTUM") + nodeEnd()
  );
  nodes.push(
    nodeStart("primus","Khatrax Primus",primus.x,primus.y,35) +
    sphere(primus.x,primus.y,21,"hive") +
    '<path class="map-leader" d="M331 230l-34-35h-53"/>' +
    label(181,186,"KHATRAX PRIMUS","HIVE WORLD / THRONE OF KHATRAX") + nodeEnd()
  );
  nodes.push(
    nodeStart("secundus","Khatrax Secundus",secundus.x,secundus.y,45) +
    gas(secundus.x,secundus.y) +
    '<path class="map-leader" d="M667 430l-18 42h-66"/>' +
    label(548,488,"KHATRAX SECUNDUS","GAS GIANT / SACRED REFINERIES") + nodeEnd()
  );
  nodes.push(
    nodeStart("heliphant-i","Heliphant I",heliphant.x,heliphant.y,21) +
    moon(heliphant.x,heliphant.y,10,false) +
    '<path class="map-leader" d="M' + (heliphant.x-9) + ' ' + (heliphant.y-8) + 'l-17-21h-50"/>' +
    label(506,333,"HELIPHANT I","MINING MOON / ORE TITHES",true) + nodeEnd()
  );
  nodes.push(
    nodeStart("heliophant-ii","Heliophant II",heliophant.x,heliophant.y,21) +
    moon(heliophant.x,heliophant.y,12,true) +
    '<path class="map-leader" d="M' + (heliophant.x+9) + ' ' + (heliophant.y-8) + 'l16-20h22"/>' +
    label(779,305,"HELIOPHANT II","FORGE MOON / CULT MECHANICUS",true) + nodeEnd()
  );
  nodes.push(
    nodeStart("tetrius","Khatrax Tetrius",tetrius.x,tetrius.y,38) +
    sphere(tetrius.x,tetrius.y,25,"ice") +
    '<path class="map-leader" d="M671 83l25-25h84"/>' +
    label(788,53,"KHATRAX TETRIUS","ICE WORLD / ASTARTES SANCTUM") + nodeEnd()
  );
  nodes.push(
    nodeStart("galgans","Galgan's Reach",reach.x,reach.y,63) +
    shipyard(reach.x,reach.y) +
    '<path class="map-leader" d="M849 482l35 31h57"/>' +
    label(950,509,"GALGAN'S REACH","GRAND NAVAL FORGE") + nodeEnd()
  );

  var title = [
    '<path class="map-bracket" d="M17 76V19H74M1127 19h56v57M17 522v56h57M1127 578h56v-56"/>',
    '<text class="map-viewport-title" x="35" y="39">KHATRAX SYSTEMA</text>',
    '<text class="map-viewport-subtitle" x="35" y="56">DIVISIO CARTOGRAPHICA // NOOSPHERIC AUSPEX // IMPERIUM NIHILUS</text>',
    '<path class="map-axis" d="M35 67H320M855 67H1166M35 562H1166"/>',
    '<circle class="map-status-blink" cx="1165" cy="35" r="3.6" fill="#95ffa8"/>',
    '<text class="map-status-value" x="1149" y="39" text-anchor="end">NOOSPHERE / SANCTIFIED</text>',
    '<text class="map-status" x="36" y="581">ARCHIVUM KHX-001 // SACRED ORBITAL VECTORS // NOT TO SCALE</text>',
    '<text class="map-status-value" x="1165" y="581" text-anchor="end">VII DESIGNATIONS VERIFIED</text>',
    '<text class="map-status" x="1134" y="548" text-anchor="end">SELECT DESIGNATION // INVOKE ARCHIVE</text>'
  ].join('');

  var svg = [
    '<svg class="map-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" role="group" aria-label="Cartographica sanctificada do Sistema Khatrax">',
    '<defs>',
    '<radialGradient id="khatrax-star-fill"><stop offset="0" stop-color="#d9ffda"/><stop offset=".38" stop-color="#97ff9e"/><stop offset="1" stop-color="#189536"/></radialGradient>',
    '<radialGradient id="khatrax-gas-fill"><stop offset="0" stop-color="#2a7f3d"/><stop offset=".55" stop-color="#134f24"/><stop offset="1" stop-color="#041c0b"/></radialGradient>',
    '<linearGradient id="khatrax-scan-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#40ff62" stop-opacity="0"/><stop offset=".45" stop-color="#40ff62" stop-opacity=".035"/><stop offset=".85" stop-color="#8aff9d" stop-opacity=".09"/><stop offset="1" stop-color="#40ff62" stop-opacity="0"/></linearGradient>',
    '<clipPath id="khatrax-gas-mask"><circle r="31"/></clipPath>',
    '</defs>',
    '<g class="map-background-grid" aria-hidden="true">' + background.join('') + '</g>',
    '<rect class="map-scan-bar" x="0" y="-100" width="1200" height="170" aria-hidden="true"/>',
    geometry,
    nodes.join(''),
    title,
    '</svg>'
  ].join('');

  var detail = [
    '<aside class="map-dossier" id="map-dossier" hidden aria-label="Arquivo do corpo celeste">',
    '<div class="map-dossier-top">',
    '<p class="map-dossier-eyebrow">ARCHIVUM MECHANICUS / ACCESS SANCTIFIED</p>',
    '<button type="button" class="map-dossier-close" id="map-dossier-close" aria-label="Fechar arquivo e voltar ao mapa" title="Voltar ao mapa (Esc)"><span aria-hidden="true">×</span><span>FECHAR</span></button>',
    '</div>',
    '<div class="map-dossier-content" id="map-dossier-content">',
    '<h2 class="map-dossier-title" id="map-dossier-title"></h2>',
    '<p class="map-dossier-kind" id="map-dossier-kind"></p>',
    '<p class="map-dossier-body" id="map-dossier-body"></p>',
    '<p class="map-dossier-faction" id="map-dossier-faction"></p>',
    '</div>',
    '</aside>'
  ].join('');

  layer.innerHTML = svg + detail;
  layer.removeAttribute("aria-hidden");
  layer.setAttribute("aria-label","Cartographica sanctificada do Sistema Khatrax");

  var svgRoot = layer.querySelector(".map-svg");
  var dossier = document.getElementById("map-dossier");
  var dossierContent = document.getElementById("map-dossier-content");
  var titleNode = document.getElementById("map-dossier-title");
  var kindNode = document.getElementById("map-dossier-kind");
  var bodyNode = document.getElementById("map-dossier-body");
  var factionNode = document.getElementById("map-dossier-faction");
  var closeButton = document.getElementById("map-dossier-close");
  var selected = null;

  function closePanel(restoreFocus) {
    var last = selected;
    selected = null;
    dossier.hidden = true;
    svgRoot.querySelectorAll("[data-world]").forEach(function(node) {
      node.classList.remove("is-selected");
      node.setAttribute("aria-pressed","false");
    });
    if (restoreFocus && last) {
      var focusTarget = svgRoot.querySelector('[data-world="' + last + '"]');
      if (focusTarget) focusTarget.focus();
    }
  }

  function openPanel(id) {
    var info = entries[id];
    if (!info) return;
    if (id === selected && !dossier.hidden) {
      closePanel(false);
      return;
    }
    selected = id;
    titleNode.textContent = info.name;
    kindNode.textContent = info.type;
    bodyNode.textContent = info.text;
    factionNode.replaceChildren();
    var field = document.createElement("strong");
    field.textContent = "DOMÍNIO / CUSTÓDIA: ";
    factionNode.append(field, document.createTextNode(info.faction));
    svgRoot.querySelectorAll("[data-world]").forEach(function(node) {
      var isActive = node.getAttribute("data-world") === id;
      node.classList.toggle("is-selected",isActive);
      node.setAttribute("aria-pressed",String(isActive));
    });
    dossier.hidden = false;
    // Always reveal the title and the closing control when a new file opens.
    dossierContent.scrollTop = 0;
  }

  svgRoot.addEventListener("click", function(event) {
    var target = event.target.closest("[data-world]");
    if (target) openPanel(target.getAttribute("data-world"));
  });
  svgRoot.addEventListener("keydown", function(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    var target = event.target.closest("[data-world]");
    if (!target) return;
    event.preventDefault();
    openPanel(target.getAttribute("data-world"));
  });
  closeButton.addEventListener("click", function() { closePanel(true); });

  // Clicking empty cartographic space dismisses the dossier. Clicking a
  // visible world still opens its archive, even while another is selected.
  document.addEventListener("pointerdown", function(event) {
    if (dossier.hidden || dossier.contains(event.target)) return;
    if (event.target.closest && event.target.closest("[data-world]")) return;
    closePanel(false);
  });

  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && !dossier.hidden) closePanel(true);
  });
}());
