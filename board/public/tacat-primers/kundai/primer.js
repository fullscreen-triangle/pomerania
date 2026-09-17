/* ==========================================================================
   tacat primer — behaviour
   Syntax highlighting · inline SVG figures · interactive widgets ·
   deck mode · progress tracking · resume · theme · TOC.
   No dependencies. Works from file:// with no server.
   ========================================================================== */

(function () {
  "use strict";

  /* ======================================================================
     0. Small helpers
     ====================================================================== */

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem("tacat:" + k); return v === null ? d : JSON.parse(v); }
      catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem("tacat:" + k, JSON.stringify(v)); } catch (e) { /* file:// */ }
    }
  };

  var PAGES = [
    ["index.html", "Start here"],
    ["01-data.html", "Facts as data"],
    ["02-meaning.html", "Meaning & inference"],
    ["03-questions.html", "Asking questions"],
    ["04-checking.html", "Checking the data"],
    ["05-serving.html", "Serving it"],
    ["06-shipping.html", "Shipping it"],
    ["07-biology.html", "The chemistry"],
    ["08-defending.html", "Defending it"]
  ];

  function pageName() {
    var p = location.pathname.split("/").pop();
    return p || "index.html";
  }

  /* ======================================================================
     1. Syntax highlighter
     One combined alternation per language, scanned once, so a match can never
     be re-processed inside another. All inner groups are non-capturing.
     ====================================================================== */

  var RULES = {
    turtle: [
      ["comment", "#[^\\n]*"],
      ["iri", "<[^>\\s]*>"],
      ["string", '"""[\\s\\S]*?"""|"(?:[^"\\\\]|\\\\.)*"'],
      ["kw", "@prefix|@base|\\ba\\b"],
      ["fn", "[A-Za-z][\\w.-]*:[\\w.-]*"],
      ["num", "\\b\\d+(?:\\.\\d+)?\\b"]
    ],
    sparql: [
      ["comment", "#[^\\n]*"],
      ["iri", "<[^>\\s]*>"],
      ["string", '"(?:[^"\\\\]|\\\\.)*"'],
      ["kw", "\\b(?:PREFIX|SELECT|DISTINCT|REDUCED|WHERE|FILTER|OPTIONAL|SERVICE|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|ASK|CONSTRUCT|DESCRIBE|UNION|MINUS|BIND|VALUES|AS|COUNT|SUM|NOT|EXISTS|IN|a)\\b"],
      ["fn", "\\?[A-Za-z_]\\w*"],
      ["num", "\\b\\d+\\b"]
    ],
    python: [
      ["comment", "#[^\\n]*"],
      ["string", '"""[\\s\\S]*?"""|"(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\''],
      ["kw", "\\b(?:def|class|return|import|from|with|for|in|if|elif|else|not|and|or|None|True|False|assert|raise|try|except|yield|lambda|async|await)\\b"],
      ["fn", "\\b[A-Za-z_]\\w*(?=\\()"],
      ["num", "\\b\\d+(?:\\.\\d+)?\\b"]
    ],
    bash: [
      ["comment", "#[^\\n]*"],
      ["string", '"(?:[^"\\\\]|\\\\.)*"|\'[^\']*\''],
      ["kw", "\\b(?:uv|docker|curl|pytest|cmp|git|test|run|build|sync|compose|pull|serve|infer|questions)\\b"],
      ["num", "\\b\\d+\\b"]
    ],
    docker: [
      ["comment", "#[^\\n]*"],
      ["string", '"(?:[^"\\\\]|\\\\.)*"'],
      ["kw", "^\\s*(?:FROM|RUN|COPY|ENV|WORKDIR|USER|EXPOSE|CMD|ENTRYPOINT|HEALTHCHECK|ARG|AS)\\b"],
      ["num", "\\b\\d+\\b"]
    ],
    yaml: [
      ["comment", "#[^\\n]*"],
      ["string", '"(?:[^"\\\\]|\\\\.)*"|\'[^\']*\''],
      ["fn", "^\\s*[A-Za-z_][\\w-]*(?=:)"],
      ["num", "\\b\\d+\\b"]
    ]
  };

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function highlight(text, lang) {
    var rules = RULES[lang];
    if (!rules) return esc(text);
    var re;
    try { re = new RegExp(rules.map(function (r) { return "(" + r[1] + ")"; }).join("|"), "gm"); }
    catch (e) { return esc(text); }

    var out = "", last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      if (m.index > last) out += esc(text.slice(last, m.index));
      var cls = null;
      for (var i = 0; i < rules.length; i++) { if (m[i + 1] !== undefined) { cls = rules[i][0]; break; } }
      out += cls ? '<span class="tok-' + cls + '">' + esc(m[0]) + "</span>" : esc(m[0]);
      last = m.index + m[0].length;
    }
    return out + esc(text.slice(last));
  }

  function paintCode(root) {
    $$("pre code[data-lang]", root).forEach(function (n) {
      if (n.dataset.painted) return;
      n.innerHTML = highlight(n.textContent, n.getAttribute("data-lang"));
      n.dataset.painted = "1";
    });
  }

  /* ======================================================================
     2. Inline SVG figures — <figure class="fig" data-figure="name">
     Colours come from CSS classes, so figures follow the theme.
     ====================================================================== */

  var FIGURES = {

    triple:
      '<svg viewBox="0 0 620 150" role="img" aria-label="Anatomy of a triple">' +
      '<rect x="10" y="34" width="170" height="44" rx="8" class="fig-sf"/>' +
      '<rect x="10" y="34" width="170" height="44" rx="8" class="fig-str-a"/>' +
      '<text x="95" y="61" text-anchor="middle" class="fig-mono fig-a">REACT_0000002</text>' +
      '<rect x="225" y="34" width="150" height="44" rx="8" class="fig-s2"/>' +
      '<rect x="225" y="34" width="150" height="44" rx="8" class="fig-str-b"/>' +
      '<text x="300" y="61" text-anchor="middle" class="fig-mono fig-t">catalysedBy</text>' +
      '<rect x="420" y="34" width="170" height="44" rx="8" class="fig-sf"/>' +
      '<rect x="420" y="34" width="170" height="44" rx="8" class="fig-str-a"/>' +
      '<text x="505" y="61" text-anchor="middle" class="fig-mono fig-a">EC_2_6_1_2</text>' +
      '<path d="M180 56 L222 56" class="fig-str-m" stroke-width="1.5" marker-end="url(#ah)"/>' +
      '<path d="M375 56 L417 56" class="fig-str-m" stroke-width="1.5" marker-end="url(#ah)"/>' +
      '<text x="95" y="100" text-anchor="middle" class="fig-small fig-m">SUBJECT</text>' +
      '<text x="300" y="100" text-anchor="middle" class="fig-small fig-m">PREDICATE</text>' +
      '<text x="505" y="100" text-anchor="middle" class="fig-small fig-m">OBJECT</text>' +
      '<text x="95" y="118" text-anchor="middle" class="fig-small fig-m">what we mean</text>' +
      '<text x="300" y="118" text-anchor="middle" class="fig-small fig-m">what we say</text>' +
      '<text x="505" y="118" text-anchor="middle" class="fig-small fig-m">the value</text>' +
      '<text x="310" y="20" text-anchor="middle" class="fig-label fig-a">every fact in the system is one of these</text>' +
      arrowDefs() + "</svg>",

    merge:
      '<svg viewBox="0 0 620 250" role="img" aria-label="Spreadsheets cannot merge, graphs merge on shared IRIs">' +
      '<text x="12" y="18" class="fig-label fig-no">two spreadsheets</text>' +
      '<rect x="12" y="28" width="130" height="62" rx="5" class="fig-s2"/><rect x="12" y="28" width="130" height="62" rx="5" class="fig-str-b"/>' +
      '<text x="22" y="47" class="fig-small fig-t">substrate</text><text x="22" y="65" class="fig-small fig-m">L-glutamate</text>' +
      '<rect x="192" y="28" width="130" height="62" rx="5" class="fig-s2"/><rect x="192" y="28" width="130" height="62" rx="5" class="fig-str-b"/>' +
      '<text x="202" y="47" class="fig-small fig-t">participant</text><text x="202" y="65" class="fig-small fig-m">L-glutamate(1−)</text>' +
      '<text x="167" y="64" text-anchor="middle" class="fig-label fig-no">✕</text>' +
      '<text x="340" y="52" class="fig-small fig-no">different column names,</text>' +
      '<text x="340" y="68" class="fig-small fig-no">different strings — a human</text>' +
      '<text x="340" y="84" class="fig-small fig-no">must map them, every time</text>' +
      '<line x1="12" y1="112" x2="608" y2="112" class="fig-str-b" stroke-dasharray="3 3"/>' +
      '<text x="12" y="140" class="fig-label fig-ok">two graphs</text>' +
      '<circle cx="70" cy="185" r="26" class="fig-sf"/><circle cx="70" cy="185" r="26" class="fig-str-a"/>' +
      '<text x="70" y="189" text-anchor="middle" class="fig-small fig-a">yours</text>' +
      '<circle cx="290" cy="185" r="26" class="fig-sf"/><circle cx="290" cy="185" r="26" class="fig-str-a"/>' +
      '<text x="290" y="189" text-anchor="middle" class="fig-small fig-a">UniProt</text>' +
      '<rect x="128" y="168" width="104" height="34" rx="17" class="fig-ok" opacity="0.16"/>' +
      '<rect x="128" y="168" width="104" height="34" rx="17" class="fig-str-ok"/>' +
      '<text x="180" y="189" text-anchor="middle" class="fig-small fig-ok">CHEBI_29985</text>' +
      '<path d="M96 185 L126 185" class="fig-str-ok" stroke-width="1.5" marker-end="url(#ahok)"/>' +
      '<path d="M264 185 L234 185" class="fig-str-ok" stroke-width="1.5" marker-end="url(#ahok)"/>' +
      '<text x="340" y="175" class="fig-small fig-ok">the same IRI in both,</text>' +
      '<text x="340" y="191" class="fig-small fig-ok">so they join by construction —</text>' +
      '<text x="340" y="207" class="fig-small fig-ok">no agreement needed</text>' +
      arrowDefs() + "</svg>",

    necsuf:
      '<svg viewBox="0 0 620 210" role="img" aria-label="Necessary versus necessary and sufficient">' +
      '<text x="12" y="18" class="fig-label fig-m">NECESSARY ONLY — subClassOf</text>' +
      '<rect x="12" y="30" width="200" height="46" rx="8" class="fig-s2"/><rect x="12" y="30" width="200" height="46" rx="8" class="fig-str-b"/>' +
      '<text x="112" y="58" text-anchor="middle" class="fig-small fig-t">a transamination</text>' +
      '<rect x="330" y="30" width="200" height="46" rx="8" class="fig-s2"/><rect x="330" y="30" width="200" height="46" rx="8" class="fig-str-b"/>' +
      '<text x="430" y="58" text-anchor="middle" class="fig-small fig-t">has these four features</text>' +
      '<path d="M216 53 L326 53" class="fig-str-m" stroke-width="2" marker-end="url(#ah)"/>' +
      '<text x="271" y="44" text-anchor="middle" class="fig-small fig-m">implies</text>' +
      '<text x="545" y="50" class="fig-small fig-no">one way only:</text>' +
      '<text x="545" y="66" class="fig-small fig-no">you can check,</text>' +
      '<text x="545" y="82" class="fig-small fig-no">never derive</text>' +
      '<line x1="12" y1="106" x2="608" y2="106" class="fig-str-b" stroke-dasharray="3 3"/>' +
      '<text x="12" y="132" class="fig-label fig-a">NECESSARY + SUFFICIENT — equivalentClass</text>' +
      '<rect x="12" y="144" width="200" height="46" rx="8" class="fig-sf"/><rect x="12" y="144" width="200" height="46" rx="8" class="fig-str-a"/>' +
      '<text x="112" y="172" text-anchor="middle" class="fig-small fig-a">a transamination</text>' +
      '<rect x="330" y="144" width="200" height="46" rx="8" class="fig-sf"/><rect x="330" y="144" width="200" height="46" rx="8" class="fig-str-a"/>' +
      '<text x="430" y="172" text-anchor="middle" class="fig-small fig-a">has these four features</text>' +
      '<path d="M222 167 L320 167" class="fig-str-a" stroke-width="2" marker-end="url(#aha)" marker-start="url(#ahas)"/>' +
      '<text x="271" y="158" text-anchor="middle" class="fig-small fig-a">iff</text>' +
      '<text x="545" y="164" class="fig-small fig-ok">both ways:</text>' +
      '<text x="545" y="180" class="fig-small fig-ok">the reasoner</text>' +
      '<text x="545" y="196" class="fig-small fig-ok">can classify</text>' +
      arrowDefs() + "</svg>",

    nary:
      '<svg viewBox="0 0 620 260" role="img" aria-label="Binary property versus n-ary bridge node">' +
      '<text x="12" y="18" class="fig-label fig-no">BINARY — nowhere to put the coefficient</text>' +
      '<rect x="12" y="30" width="150" height="40" rx="8" class="fig-s2"/><rect x="12" y="30" width="150" height="40" rx="8" class="fig-str-b"/>' +
      '<text x="87" y="55" text-anchor="middle" class="fig-mono fig-t">REACT_2</text>' +
      '<rect x="330" y="30" width="150" height="40" rx="8" class="fig-s2"/><rect x="330" y="30" width="150" height="40" rx="8" class="fig-str-b"/>' +
      '<text x="405" y="55" text-anchor="middle" class="fig-mono fig-t">CHEBI_57972</text>' +
      '<path d="M166 50 L326 50" class="fig-str-m" stroke-width="1.5" marker-end="url(#ah)"/>' +
      '<text x="246" y="42" text-anchor="middle" class="fig-mono fig-m">hasSubstrate</text>' +
      '<text x="246" y="70" text-anchor="middle" class="fig-small fig-no">↑ role is baked into the name</text>' +
      '<text x="500" y="45" class="fig-small fig-no">coefficient?</text>' +
      '<text x="500" y="61" class="fig-small fig-no">no slot left.</text>' +
      '<line x1="12" y1="96" x2="608" y2="96" class="fig-str-b" stroke-dasharray="3 3"/>' +
      '<text x="12" y="122" class="fig-label fig-ok">N-ARY BRIDGE — the participation gets its own identity</text>' +
      '<rect x="12" y="134" width="130" height="40" rx="8" class="fig-sf"/><rect x="12" y="134" width="130" height="40" rx="8" class="fig-str-a"/>' +
      '<text x="77" y="159" text-anchor="middle" class="fig-mono fig-a">REACT_2</text>' +
      '<rect x="205" y="134" width="150" height="40" rx="8" class="fig-ok" opacity="0.14"/>' +
      '<rect x="205" y="134" width="150" height="40" rx="8" class="fig-str-ok"/>' +
      '<text x="280" y="159" text-anchor="middle" class="fig-mono fig-ok">PART_2_01</text>' +
      '<path d="M146 154 L201 154" class="fig-str-m" stroke-width="1.5" marker-end="url(#ah)"/>' +
      '<text x="173" y="146" text-anchor="middle" class="fig-small fig-m">hasParticipant</text>' +
      '<path d="M280 178 L280 196 L400 196" class="fig-str-ok" stroke-width="1.5" marker-end="url(#ahok)"/>' +
      '<path d="M280 178 L280 220 L400 220" class="fig-str-ok" stroke-width="1.5" marker-end="url(#ahok)"/>' +
      '<path d="M280 178 L280 244 L400 244" class="fig-str-ok" stroke-width="1.5" marker-end="url(#ahok)"/>' +
      '<text x="408" y="200" class="fig-mono fig-t">CHEBI_57972</text>' +
      '<text x="408" y="224" class="fig-mono fig-t">Reactant</text>' +
      '<text x="408" y="248" class="fig-mono fig-t">1.0</text>' +
      '<text x="300" y="200" class="fig-small fig-m">entity</text>' +
      '<text x="308" y="224" class="fig-small fig-m">role</text>' +
      '<text x="296" y="248" class="fig-small fig-m">coeff.</text>' +
      arrowDefs() + "</svg>",

    plp:
      '<svg viewBox="0 0 620 220" role="img" aria-label="PLP sits on the enzyme, outside the balanced equation">' +
      '<rect x="20" y="96" width="450" height="58" rx="10" class="fig-s2"/>' +
      '<rect x="20" y="96" width="450" height="58" rx="10" class="fig-str-b" stroke-dasharray="4 3"/>' +
      '<text x="245" y="88" text-anchor="middle" class="fig-small fig-m">the balanced equation — exactly four participants</text>' +
      '<text x="42" y="131" class="fig-small fig-t">L-alanine</text>' +
      '<text x="130" y="131" class="fig-small fig-m">+</text>' +
      '<text x="146" y="131" class="fig-small fig-t">2-oxoglutarate</text>' +
      '<text x="255" y="131" class="fig-small fig-a">⇌</text>' +
      '<text x="277" y="131" class="fig-small fig-t">pyruvate</text>' +
      '<text x="345" y="131" class="fig-small fig-m">+</text>' +
      '<text x="361" y="131" class="fig-small fig-t">L-glutamate</text>' +
      '<ellipse cx="545" cy="70" rx="62" ry="40" class="fig-sf"/>' +
      '<ellipse cx="545" cy="70" rx="62" ry="40" class="fig-str-a"/>' +
      '<text x="545" y="58" text-anchor="middle" class="fig-small fig-a">enzyme</text>' +
      '<text x="545" y="76" text-anchor="middle" class="fig-small fig-m">active-site Lys</text>' +
      '<text x="545" y="94" text-anchor="middle" class="fig-mono fig-a">— PLP</text>' +
      '<path d="M500 132 a 46 30 0 1 0 90 0 a 46 30 0 1 0 -90 0" class="fig-str-a" stroke-width="1.4" stroke-dasharray="3 3" marker-end="url(#aha)"/>' +
      '<text x="545" y="176" text-anchor="middle" class="fig-small fig-a">PLP → PMP → PLP</text>' +
      '<text x="545" y="192" text-anchor="middle" class="fig-small fig-m">regenerated, never consumed</text>' +
      '<path d="M470 125 L487 105" class="fig-str-b" stroke-width="1.2"/>' +
      '<text x="245" y="176" text-anchor="middle" class="fig-small fig-no">PLP is not in here — and UniProt agrees:</text>' +
      '<text x="245" y="192" text-anchor="middle" class="fig-small fig-no">COFACTOR on the protein, CHEBI:597326</text>' +
      arrowDefs() + "</svg>",

    ssrf:
      '<svg viewBox="0 0 620 190" role="img" aria-label="SSRF: the server makes the attacker request">' +
      '<rect x="10" y="60" width="120" height="52" rx="9" class="fig-s2"/><rect x="10" y="60" width="120" height="52" rx="9" class="fig-str-no"/>' +
      '<text x="70" y="83" text-anchor="middle" class="fig-small fig-no">anonymous</text>' +
      '<text x="70" y="99" text-anchor="middle" class="fig-small fig-no">caller</text>' +
      '<rect x="230" y="60" width="130" height="52" rx="9" class="fig-sf"/><rect x="230" y="60" width="130" height="52" rx="9" class="fig-str-a"/>' +
      '<text x="295" y="83" text-anchor="middle" class="fig-small fig-a">your SPARQL</text>' +
      '<text x="295" y="99" text-anchor="middle" class="fig-small fig-a">endpoint</text>' +
      '<rect x="452" y="30" width="158" height="112" rx="9" class="fig-s2" opacity="0.7"/>' +
      '<rect x="452" y="30" width="158" height="112" rx="9" class="fig-str-b" stroke-dasharray="4 3"/>' +
      '<text x="531" y="50" text-anchor="middle" class="fig-small fig-m">your internal network</text>' +
      '<rect x="472" y="62" width="118" height="30" rx="6" class="fig-su"/><rect x="472" y="62" width="118" height="30" rx="6" class="fig-str-no"/>' +
      '<text x="531" y="82" text-anchor="middle" class="fig-mono fig-no">192.168.1.50</text>' +
      '<text x="531" y="118" text-anchor="middle" class="fig-small fig-m">not exposed to the internet</text>' +
      '<path d="M134 86 L226 86" class="fig-str-no" stroke-width="1.6" marker-end="url(#ahno)"/>' +
      '<text x="180" y="78" text-anchor="middle" class="fig-small fig-no">SERVICE &lt;…&gt;</text>' +
      '<path d="M364 82 L468 78" class="fig-str-no" stroke-width="1.6" marker-end="url(#ahno)"/>' +
      '<text x="416" y="70" text-anchor="middle" class="fig-small fig-no">…with your</text>' +
      '<text x="416" y="104" text-anchor="middle" class="fig-small fig-no">network’s trust</text>' +
      '<text x="310" y="168" text-anchor="middle" class="fig-small fig-m">the caller never touches the internal host — the server does it for them</text>' +
      arrowDefs() + "</svg>",

    statustree:
      '<svg viewBox="0 0 620 200" role="img" aria-label="Which status code">' +
      '<rect x="215" y="8" width="190" height="36" rx="8" class="fig-s2"/><rect x="215" y="8" width="190" height="36" rx="8" class="fig-str-b"/>' +
      '<text x="310" y="31" text-anchor="middle" class="fig-small fig-t">the request failed. whose fault?</text>' +
      '<path d="M270 46 L150 78" class="fig-str-m" stroke-width="1.4" marker-end="url(#ah)"/>' +
      '<path d="M350 46 L470 78" class="fig-str-m" stroke-width="1.4" marker-end="url(#ah)"/>' +
      '<text x="196" y="64" text-anchor="middle" class="fig-small fig-m">caller’s</text>' +
      '<text x="428" y="64" text-anchor="middle" class="fig-small fig-m">server’s</text>' +
      '<rect x="40" y="82" width="220" height="98" rx="9" class="fig-s2"/><rect x="40" y="82" width="220" height="98" rx="9" class="fig-str-b"/>' +
      '<text x="150" y="104" text-anchor="middle" class="fig-label fig-t">4xx</text>' +
      '<text x="58" y="126" class="fig-small fig-t">400  the query does not parse</text>' +
      '<text x="58" y="146" class="fig-small fig-t">404  no such path</text>' +
      '<text x="58" y="166" class="fig-small fig-t">406  cannot give that format</text>' +
      '<rect x="360" y="82" width="220" height="98" rx="9" class="fig-no" opacity="0.1"/><rect x="360" y="82" width="220" height="98" rx="9" class="fig-str-no"/>' +
      '<text x="470" y="104" text-anchor="middle" class="fig-label fig-no">5xx</text>' +
      '<text x="378" y="126" class="fig-small fig-no">500  the server broke</text>' +
      '<text x="378" y="150" class="fig-small fig-m">wakes someone at 3am</text>' +
      '<text x="378" y="168" class="fig-small fig-m">— so do not use it for a typo</text>' +
      arrowDefs() + "</svg>",

    imagecontainer:
      '<svg viewBox="0 0 620 170" role="img" aria-label="Image is the frozen stock, containers are the cultures">' +
      '<rect x="30" y="40" width="90" height="90" rx="10" class="fig-sf"/><rect x="30" y="40" width="90" height="90" rx="10" class="fig-str-a"/>' +
      '<text x="75" y="78" text-anchor="middle" class="fig-label fig-a">IMAGE</text>' +
      '<text x="75" y="98" text-anchor="middle" class="fig-small fig-m">frozen stock</text>' +
      '<text x="75" y="114" text-anchor="middle" class="fig-small fig-m">inert, exact</text>' +
      '<path d="M126 85 L196 55" class="fig-str-a" stroke-width="1.5" marker-end="url(#aha)"/>' +
      '<path d="M126 85 L196 85" class="fig-str-a" stroke-width="1.5" marker-end="url(#aha)"/>' +
      '<path d="M126 85 L196 115" class="fig-str-a" stroke-width="1.5" marker-end="url(#aha)"/>' +
      '<rect x="202" y="34" width="118" height="42" rx="8" class="fig-s2"/><rect x="202" y="34" width="118" height="42" rx="8" class="fig-str-b"/>' +
      '<text x="261" y="60" text-anchor="middle" class="fig-small fig-t">container</text>' +
      '<rect x="202" y="64" width="118" height="42" rx="8" class="fig-s2"/><rect x="202" y="64" width="118" height="42" rx="8" class="fig-str-b"/>' +
      '<text x="261" y="90" text-anchor="middle" class="fig-small fig-t">container</text>' +
      '<rect x="202" y="94" width="118" height="42" rx="8" class="fig-s2"/><rect x="202" y="94" width="118" height="42" rx="8" class="fig-str-b"/>' +
      '<text x="261" y="120" text-anchor="middle" class="fig-small fig-t">container</text>' +
      '<text x="350" y="70" class="fig-small fig-m">every culture grown from that stock</text>' +
      '<text x="350" y="90" class="fig-small fig-m">is the same strain. kill one, grow</text>' +
      '<text x="350" y="110" class="fig-small fig-m">another — identical.</text>' +
      '<text x="350" y="40" class="fig-small fig-a">the Dockerfile is the protocol</text>' +
      arrowDefs() + "</svg>",

    cipipeline:
      '<svg viewBox="0 0 620 150" role="img" aria-label="Three CI stages, gated">' +
      '<rect x="10" y="40" width="160" height="62" rx="9" class="fig-s2"/><rect x="10" y="40" width="160" height="62" rx="9" class="fig-str-b"/>' +
      '<text x="90" y="62" text-anchor="middle" class="fig-label fig-t">quality</text>' +
      '<text x="90" y="80" text-anchor="middle" class="fig-small fig-m">ruff · mypy · bandit</text>' +
      '<text x="90" y="95" text-anchor="middle" class="fig-small fig-m">code gates</text>' +
      '<rect x="196" y="34" width="190" height="74" rx="9" class="fig-sf"/><rect x="196" y="34" width="190" height="74" rx="9" class="fig-str-a" stroke-width="2"/>' +
      '<text x="291" y="56" text-anchor="middle" class="fig-label fig-a">verify</text>' +
      '<text x="291" y="74" text-anchor="middle" class="fig-small fig-a">tests · consistency ·</text>' +
      '<text x="291" y="89" text-anchor="middle" class="fig-small fig-a">inference fired · SHACL</text>' +
      '<text x="291" y="103" text-anchor="middle" class="fig-small fig-a">DATA gates</text>' +
      '<rect x="412" y="40" width="160" height="62" rx="9" class="fig-s2"/><rect x="412" y="40" width="160" height="62" rx="9" class="fig-str-b"/>' +
      '<text x="492" y="62" text-anchor="middle" class="fig-label fig-t">build</text>' +
      '<text x="492" y="80" text-anchor="middle" class="fig-small fig-m">image → registry</text>' +
      '<text x="492" y="95" text-anchor="middle" class="fig-small fig-m">tagged by commit</text>' +
      '<path d="M174 71 L192 71" class="fig-str-m" stroke-width="1.6" marker-end="url(#ah)"/>' +
      '<path d="M390 71 L408 71" class="fig-str-m" stroke-width="1.6" marker-end="url(#ah)"/>' +
      '<text x="291" y="24" text-anchor="middle" class="fig-small fig-a">↓ the middle stage is the differentiator</text>' +
      '<text x="310" y="132" text-anchor="middle" class="fig-small fig-m">any gate fails → nothing downstream runs → no image</text>' +
      arrowDefs() + "</svg>",

    openclosed:
      '<svg viewBox="0 0 620 160" role="img" aria-label="Open world versus closed world">' +
      '<rect x="10" y="30" width="288" height="112" rx="10" class="fig-s2"/><rect x="10" y="30" width="288" height="112" rx="10" class="fig-str-b"/>' +
      '<text x="154" y="54" text-anchor="middle" class="fig-label fig-t">OPEN WORLD — OWL</text>' +
      '<text x="154" y="80" text-anchor="middle" class="fig-small fig-m">no catalase result on record</text>' +
      '<text x="154" y="104" text-anchor="middle" class="fig-small fig-a">→ unknown, not absent</text>' +
      '<text x="154" y="126" text-anchor="middle" class="fig-small fig-m">infers; never complains about a gap</text>' +
      '<rect x="322" y="30" width="288" height="112" rx="10" class="fig-sf"/><rect x="322" y="30" width="288" height="112" rx="10" class="fig-str-a"/>' +
      '<text x="466" y="54" text-anchor="middle" class="fig-label fig-a">CLOSED WORLD — SHACL</text>' +
      '<text x="466" y="80" text-anchor="middle" class="fig-small fig-m">buffer field left blank on the form</text>' +
      '<text x="466" y="104" text-anchor="middle" class="fig-small fig-no">→ rejected</text>' +
      '<text x="466" y="126" text-anchor="middle" class="fig-small fig-m">validates; a gap is a violation</text>' +
      '<text x="310" y="18" text-anchor="middle" class="fig-small fig-m">same missing value, opposite reading</text>' +
      "</svg>"
  };

  function arrowDefs() {
    return '<defs>' +
      '<marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="fig-m"/></marker>' +
      '<marker id="aha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="fig-a"/></marker>' +
      '<marker id="ahas" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M10 0 L0 5 L10 10 z" class="fig-a"/></marker>' +
      '<marker id="ahok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="fig-ok"/></marker>' +
      '<marker id="ahno" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="fig-no"/></marker>' +
      '</defs>';
  }

  function mountFigures() {
    $$("figure.fig[data-figure]").forEach(function (f) {
      var svg = FIGURES[f.getAttribute("data-figure")];
      if (!svg) return;
      var cap = f.querySelector("figcaption");
      f.insertAdjacentHTML("afterbegin", svg);
      if (cap) f.appendChild(cap);
    });
  }

  /* ======================================================================
     3. Widgets — <div class="widget" data-widget="name">
     ====================================================================== */

  var WIDGETS = {};

  /* ---- 3a. The reaction classifier -------------------------------------- */

  WIDGETS.classifier = function (host) {
    var CONJ = [
      { k: "aaIn",   t: "an amino acid is consumed",  s: "participantRole = Reactant, entity a AminoAcid" },
      { k: "oxoIn",  t: "a 2-oxo acid is consumed",   s: "participantRole = Reactant, entity a TwoOxoAcid" },
      { k: "oxoOut", t: "a 2-oxo acid is produced",   s: "participantRole = Product,  entity a TwoOxoAcid" },
      { k: "aaOut",  t: "an amino acid is produced",  s: "participantRole = Product,  entity a AminoAcid" }
    ];
    var PRESETS = {
      alt: { label: "alanine transaminase", on: ["aaIn", "oxoIn", "oxoOut", "aaOut"],
             mol: "L-alanine + 2-oxoglutarate ⇌ pyruvate + L-glutamate" },
      ast: { label: "aspartate transaminase", on: ["aaIn", "oxoIn", "oxoOut", "aaOut"],
             mol: "L-aspartate + 2-oxoglutarate ⇌ oxaloacetate + L-glutamate" },
      gdh: { label: "glutamate dehydrogenase — the negative control", on: ["aaIn", "oxoOut"],
             mol: "L-glutamate + H₂O + NAD⁺ ⇌ 2-oxoglutarate + NH₄⁺ + NADH" },
      none: { label: "nothing set", on: [], mol: "" }
    };

    var state = { aaIn: false, oxoIn: false, oxoOut: false, aaOut: false };
    var preset = "none";

    host.innerHTML =
      '<header><span class="wt">Try it: the defined class</span>' +
      '<span class="wh">flip the roles — the verdict is computed, not looked up</span></header>' +
      '<div class="body">' +
        '<div class="btnrow" style="margin-bottom:.9rem">' +
          '<button class="btn" data-p="alt">load ALT</button>' +
          '<button class="btn" data-p="ast">load AST</button>' +
          '<button class="btn" data-p="gdh">load the control</button>' +
          '<button class="btn" data-p="none">clear</button>' +
        '</div>' +
        '<p class="small muted" data-mol style="min-height:1.3em;margin-bottom:.7rem"></p>' +
        '<div class="grid2">' +
          '<div><div class="switches" data-sw></div></div>' +
          '<div data-verdict></div>' +
        '</div>' +
      '</div>' +
      '<div class="foot" data-foot></div>';

    var swHost = $("[data-sw]", host);
    CONJ.forEach(function (c) {
      var b = el("button", "sw");
      b.type = "button";
      b.setAttribute("aria-pressed", "false");
      b.dataset.k = c.k;
      b.innerHTML = '<span class="track"></span><span class="lbl">' + c.t + "<small>" + c.s + "</small></span>";
      b.addEventListener("click", function () {
        state[c.k] = !state[c.k];
        preset = "custom";
        render();
      });
      swHost.appendChild(b);
    });

    $$("[data-p]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        preset = b.dataset.p;
        var p = PRESETS[preset];
        CONJ.forEach(function (c) { state[c.k] = p.on.indexOf(c.k) >= 0; });
        render();
      });
    });

    function render() {
      $$(".sw", host).forEach(function (b) {
        b.setAttribute("aria-pressed", state[b.dataset.k] ? "true" : "false");
      });
      var p = PRESETS[preset];
      $("[data-mol]", host).textContent = p ? p.mol : "custom — your own combination of roles";

      var met = CONJ.filter(function (c) { return state[c.k]; }).length;
      var all = met === 4;

      $("[data-verdict]", host).innerHTML =
        '<div class="verdict ' + (all ? "ok" : "no") + '">' +
          '<div class="vhead">' + (all ? "✓ TransaminationReaction" : "✗ not derived") + "</div>" +
          '<div class="conj">' +
            CONJ.map(function (c) {
              return '<span class="' + (state[c.k] ? "met" : "unmet") + '">' +
                (state[c.k] ? "✓" : "✗") + " " + c.t + "</span>";
            }).join("") +
          "</div>" +
          '<div class="why">' + why(met, all) + "</div>" +
        "</div>";

      $("[data-foot]", host).innerHTML = foot();
    }

    function why(met, all) {
      if (all) {
        if (preset === "alt" || preset === "ast")
          return "In the real build HermiT derives this. <strong>Nothing in the data says &ldquo;transamination&rdquo;</strong> — the four conditions hold, so the classification follows.";
        if (preset === "custom" && state.aaIn && state.oxoIn && state.oxoOut && state.aaOut)
          return "All four hold, so this classifies — <strong>even though the model has never seen it</strong>. That is what writing the definition over classes rather than molecules buys.";
        return "All four conditions hold.";
      }
      if (preset === "gdh")
        return "It contains <strong>both headline molecules</strong> of the three transaminations — with the roles reversed. The definition discriminates on <strong>role</strong>, not on which molecules are present, so it is correctly excluded.";
      return (4 - met) + " of 4 conditions unmet, so the reaction is not derived as a transamination.";
    }

    function foot() {
      if (preset === "gdh")
        return "<strong>Now flip the two red ones.</strong> Watch a real, non-transaminase reaction become one the moment its roles change — that is the whole argument for modelling roles rather than molecules.";
      if (preset === "custom")
        return "Careful with the wording: OWL is open-world, so a failing combination means <strong>“not derived”</strong>, not “proved not to be one.”";
      return "The four switches are the four conjuncts of <code>equivalent_to</code> in <code>ontology/schema.py</code>. Nothing here is a lookup table.";
    }

    render();
  };

  /* ---- 3b. Silent-failure demo ------------------------------------------ */

  WIDGETS["silent-failure"] = function (host) {
    host.innerHTML =
      '<header><span class="wt">Try it: why the string/IRI distinction broke v0</span>' +
      '<span class="wh">two graphs that look identical</span></header>' +
      '<div class="body">' +
        '<div class="grid2">' +
          '<div class="panel"><div class="ph">stored as an IRI &nbsp;<span style="color:var(--ok)">✓</span></div>' +
            '<pre><code data-lang="turtle">tacat:REACT_0000002\n  a\n    &lt;http://rdf.rhea-db.org/19453&gt; .</code></pre>' +
            '<div class="out" data-out="a"><span class="muted small">not run yet</span></div></div>' +
          '<div class="panel"><div class="ph">stored as a string &nbsp;<span style="color:var(--no)">✗</span></div>' +
            '<pre><code data-lang="turtle">tacat:REACT_0000002\n  tacat:rheaIRI\n    "http://rdf.rhea-db.org/19453" .</code></pre>' +
            '<div class="out" data-out="b"><span class="muted small">not run yet</span></div></div>' +
        "</div>" +
        '<div class="btnrow" style="margin-top:.9rem">' +
          '<button class="btn primary" data-run>▶ run the federated join against UniProt</button>' +
          '<button class="btn" data-reset>reset</button>' +
        "</div>" +
      "</div>" +
      '<div class="foot" data-foot>The two files differ by <strong>two quotation marks</strong>. Press run.</div>';

    paintCode(host);

    function set(k, html) { $('[data-out="' + k + '"]', host).innerHTML = html; }

    $("[data-run]", host).addEventListener("click", function () {
      var busy = '<div class="status"><span class="spinner"></span> querying…</div>';
      set("a", busy); set("b", busy);
      $("[data-foot]", host).innerHTML = "…";

      setTimeout(function () {
        set("a",
          '<div class="status ok">✓ 200 OK — 3 rows</div>' +
          '<table><tbody>' +
          "<tr><td>17441</td><td>15 proteins</td></tr>" +
          "<tr><td>19453</td><td>27 proteins</td></tr>" +
          "<tr><td>21824</td><td>91 proteins</td></tr>" +
          "</tbody></table>");
      }, 700);

      setTimeout(function () {
        set("b",
          '<div class="status ok">✓ 200 OK — 0 rows</div>' +
          '<p class="zero small">(empty result set)</p>' +
          '<p class="small muted" style="margin:0">No error. No warning. Exit code 0.</p>');
        $("[data-foot]", host).innerHTML =
          "<strong>Both queries succeeded.</strong> One answered; one returned nothing and said so in exactly the same tone. " +
          "An empty table is indistinguishable from a correct answer to a question with no matches — which is why the fix came with a test asserting the object is a <em>node</em>, not merely that a well-formed string is present.";
      }, 1500);
    });

    $("[data-reset]", host).addEventListener("click", function () {
      set("a", '<span class="muted small">not run yet</span>');
      set("b", '<span class="muted small">not run yet</span>');
      $("[data-foot]", host).innerHTML = "The two files differ by <strong>two quotation marks</strong>. Press run.";
    });
  };

  /* ---- 3c. CQ05 → CQ06 dropout ------------------------------------------ */

  WIDGETS["cq-dropout"] = function (host) {
    var ROWS = [
      "alanine transaminase reaction",
      "aspartate transaminase reaction",
      "cysteine transaminase reaction",
      "glutamate dehydrogenase reaction (negative control)"
    ];
    var added = false;

    host.innerHTML =
      '<header><span class="wt">Try it: one line changes the answer</span>' +
      '<span class="wh">CQ05 → CQ06</span></header>' +
      '<div class="body"><div class="grid2">' +
        "<div>" +
          '<pre><code>?reaction a tacat:BiochemicalReaction ;\n          rdfs:label ?label ;\n          tacat:hasParticipant ?participant .\n?participant tacat:participatingEntity tacat:CHEBI_29985 <span data-tail>.</span><span data-extra style="display:none"> ;\n             <span class="addline">tacat:participantRole tacat:Product .</span></span></code></pre>' +
          '<div class="btnrow"><button class="btn primary" data-toggle>+ add the role filter</button></div>' +
        "</div>" +
        "<div>" +
          '<div style="display:flex;align-items:baseline;gap:.5rem;margin-bottom:.5rem">' +
            '<span class="counter" data-count>4</span>' +
            '<span class="small muted" data-qlabel>reactions <strong>have</strong> L-glutamate as a participant</span>' +
          "</div>" +
          '<ul class="rows" data-rows></ul>' +
        "</div>" +
      "</div></div>" +
      '<div class="foot" data-foot>Participation is not production. Press the button.</div>';

    var rowsHost = $("[data-rows]", host);
    ROWS.forEach(function (r, i) {
      var li = el("li", null, r);
      li.dataset.i = String(i);
      rowsHost.appendChild(li);
    });

    $("[data-toggle]", host).addEventListener("click", function () {
      added = !added;
      $("[data-extra]", host).style.display = added ? "" : "none";
      $("[data-tail]", host).style.display = added ? "none" : "";
      $$("li", rowsHost)[3].classList.toggle("drop", added);
      $("[data-count]", host).textContent = added ? "3" : "4";
      $("[data-qlabel]", host).innerHTML = added
        ? "reactions <strong>produce</strong> L-glutamate, left-to-right"
        : "reactions <strong>have</strong> L-glutamate as a participant";
      this.textContent = added ? "− remove the role filter" : "+ add the role filter";
      $("[data-foot]", host).innerHTML = added
        ? "The dehydrogenase <em>consumes</em> L-glutamate, so filtering on the <strong>role</strong> drops it. That extra line is only writable because participation is a node with a role on it — it is the entire justification for the n-ary bridge."
        : "Participation is not production. Press the button.";
    });
  };

  /* ---- 3d. Flashcards, built from the Q&A blocks on the page ------------- */

  WIDGETS.flashcards = function (host) {
    var src = $$(".qa");
    var cards = src.map(function (q) {
      return {
        q: (q.querySelector(".q") || {}).textContent || "",
        a: (q.querySelector(".a") || {}).innerHTML || ""
      };
    }).filter(function (c) { return c.q && c.a; });

    if (!cards.length) { host.style.display = "none"; return; }

    var order = cards.map(function (_, i) { return i; });
    var pos = 0, flipped = false;
    var known = store.get("known", {});

    host.innerHTML =
      '<header><span class="wt">Quiz yourself</span>' +
      '<span class="wh">space or click flips · ← → moves</span></header>' +
      '<div class="body">' +
        '<div class="fc-wrap"><div class="fc" data-card>' +
          '<div class="face front"><div class="q" data-q></div><div class="tapme">tap to reveal</div></div>' +
          '<div class="face back"><div data-a></div></div>' +
        "</div></div>" +
        '<div class="fc-bar">' +
          '<button class="btn" data-prev>←</button>' +
          '<button class="btn" data-next>→</button>' +
          '<span class="pos" data-pos></span>' +
          '<span class="spacer"></span>' +
          '<button class="btn" data-known></button>' +
          '<button class="btn" data-shuffle>shuffle</button>' +
        "</div>" +
        '<div class="progress" style="margin-top:.7rem"><div class="bar"><i data-bar></i></div>' +
        '<div class="pl"><span data-plabel></span><span>marked confident</span></div></div>' +
      "</div>";

    var card = $("[data-card]", host);

    // Grow the card to fit its tallest face, so neither face ever needs its own
    // scrollbar.
    //
    // The faces are absolutely positioned flex containers, so neither
    // scrollHeight (only meaningful on a scroll container) nor a child sum
    // (flex items compress at zero height) reports the truth. Drop each face
    // into normal flow just long enough to measure it, then restore. All
    // synchronous, so nothing paints in between.
    function fit() {
      var h = 0;
      $$(".face", card).forEach(function (f) {
        var prev = f.getAttribute("style");
        f.style.position = "static";
        f.style.display = "block";
        h = Math.max(h, f.offsetHeight);
        if (prev === null) f.removeAttribute("style");
        else f.setAttribute("style", prev);
      });
      card.style.minHeight = Math.max(Math.ceil(h), 150) + "px";
    }

    function draw() {
      var c = cards[order[pos]];
      flipped = false;
      card.classList.remove("flipped");
      $("[data-q]", host).textContent = c.q;
      $("[data-a]", host).innerHTML = c.a;
      fit();
      $("[data-pos]", host).textContent = (pos + 1) + " / " + cards.length;
      var k = !!known[order[pos]];
      $("[data-known]", host).textContent = k ? "✓ confident" : "mark confident";
      $("[data-known]", host).classList.toggle("primary", k);
      var n = Object.keys(known).filter(function (x) { return known[x]; }).length;
      $("[data-bar]", host).style.width = Math.round(n / cards.length * 100) + "%";
      $("[data-plabel]", host).textContent = n + " of " + cards.length;
    }

    function flip() { flipped = !flipped; card.classList.toggle("flipped", flipped); }
    function move(d) { pos = (pos + d + cards.length) % cards.length; draw(); }

    card.addEventListener("click", flip);
    $("[data-next]", host).addEventListener("click", function () { move(1); });
    $("[data-prev]", host).addEventListener("click", function () { move(-1); });
    $("[data-known]", host).addEventListener("click", function () {
      known[order[pos]] = !known[order[pos]];
      store.set("known", known);
      draw();
    });
    $("[data-shuffle]", host).addEventListener("click", function () {
      for (var i = order.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = order[i]; order[i] = order[j]; order[j] = t;
      }
      pos = 0; draw();
    });

    document.addEventListener("keydown", function (e) {
      if (document.body.classList.contains("deck")) return;
      if (!host.getBoundingClientRect().height) return;
      var r = host.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      if (e.key === " ") { e.preventDefault(); flip(); }
      else if (e.key === "ArrowRight") { move(1); }
      else if (e.key === "ArrowLeft") { move(-1); }
    });

    // Text reflows on resize, so the required height changes with it.
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(fit, 120);
    });

    draw();
    setTimeout(fit, 250);   // re-measure once webfonts/layout have settled
  };

  /* ---- 3e. Turtle expander ---------------------------------------------- */

  WIDGETS["turtle-expand"] = function (host) {
    var SHORT =
      "tacat:REACT_0000002 a tacat:BiochemicalReaction,\n" +
      "        tacat:TransaminationReaction ;\n" +
      '    rdfs:label "alanine transaminase reaction" ;\n' +
      "    tacat:catalysedBy tacat:EC_2_6_1_2 ;\n" +
      "    tacat:hasParticipant tacat:PART_0000002_01,\n" +
      "        tacat:PART_0000002_02 .";
    var LONG =
      "tacat:REACT_0000002  a                    tacat:BiochemicalReaction .\n" +
      "tacat:REACT_0000002  a                    tacat:TransaminationReaction .\n" +
      'tacat:REACT_0000002  rdfs:label           "alanine transaminase reaction" .\n' +
      "tacat:REACT_0000002  tacat:catalysedBy      tacat:EC_2_6_1_2 .\n" +
      "tacat:REACT_0000002  tacat:hasParticipant   tacat:PART_0000002_01 .\n" +
      "tacat:REACT_0000002  tacat:hasParticipant   tacat:PART_0000002_02 .";
    var expanded = false;

    host.innerHTML =
      '<header><span class="wt">Try it: the shorthand, undone</span>' +
      '<span class="wh"><code>;</code> and <code>,</code> are pure abbreviation</span></header>' +
      '<div class="body"><pre><code data-lang="turtle" data-code></code></pre>' +
      '<div class="btnrow"><button class="btn primary" data-t>expand into plain triples</button>' +
      '<span class="small muted" data-n></span></div></div>' +
      '<div class="foot">Both forms are <strong>exactly the same data</strong>. Turtle just lets you skip repeating the subject.</div>';

    function draw() {
      var c = $("[data-code]", host);
      c.textContent = expanded ? LONG : SHORT;
      c.dataset.painted = "";
      paintCode(host);
      $("[data-t]", host).textContent = expanded ? "collapse the shorthand" : "expand into plain triples";
      $("[data-n]", host).textContent = expanded ? "6 triples, one per line" : "6 triples, hidden behind ; and ,";
    }
    $("[data-t]", host).addEventListener("click", function () { expanded = !expanded; draw(); });
    draw();
  };

  /* ---- 3f. SPARQL pattern matcher --------------------------------------- */

  WIDGETS["sparql-match"] = function (host) {
    var DATA = [
      ["REACT_0000001", "catalysedBy", "EC_2_6_1_1"],
      ["REACT_0000002", "catalysedBy", "EC_2_6_1_2"],
      ["REACT_0000003", "catalysedBy", "EC_2_6_1_3"],
      ["REACT_0000002", "hasReversibility", "Reversible"]
    ];
    host.innerHTML =
      '<header><span class="wt">Try it: a pattern with holes in it</span>' +
      '<span class="wh">hover a ?variable</span></header>' +
      '<div class="body"><div class="grid2">' +
        '<div><p class="small muted" style="margin:.1rem 0 .5rem">the pattern</p>' +
        '<pre><code>SELECT <span data-v="r" style="cursor:pointer">?reaction</span> <span data-v="e" style="cursor:pointer">?enzyme</span>\nWHERE {\n  <span data-v="r" style="cursor:pointer">?reaction</span> catalysedBy <span data-v="e" style="cursor:pointer">?enzyme</span> .\n}</code></pre></div>' +
        '<div><p class="small muted" style="margin:.1rem 0 .5rem">the data</p>' +
        '<table><tbody data-rows></tbody></table></div>' +
      "</div></div>" +
      '<div class="foot" data-foot>You describe what a hit looks like; the engine finds every way to fill the holes. Three matches here — the fourth triple has the wrong predicate.</div>';

    var tb = $("[data-rows]", host);
    DATA.forEach(function (t, i) {
      var tr = el("tr");
      tr.innerHTML = '<td class="s" style="font-family:monospace;font-size:.76rem">' + t[0] + "</td>" +
                     '<td class="p" style="font-family:monospace;font-size:.76rem">' + t[1] + "</td>" +
                     '<td class="o" style="font-family:monospace;font-size:.76rem">' + t[2] + "</td>";
      if (t[1] !== "catalysedBy") tr.style.opacity = "0.35";
      tb.appendChild(tr);
    });

    function mark(which, on) {
      $$("tr", tb).forEach(function (tr) {
        if (tr.style.opacity) return;
        var cell = tr.querySelector(which === "r" ? ".s" : ".o");
        cell.style.background = on ? "var(--accent-sf)" : "";
        cell.style.color = on ? "var(--accent)" : "";
        cell.style.fontWeight = on ? "700" : "";
      });
      $$("[data-v]", host).forEach(function (s) {
        if (s.dataset.v !== which) return;
        s.style.background = on ? "var(--accent-sf)" : "";
        s.style.color = on ? "var(--accent)" : "";
      });
    }
    $$("[data-v]", host).forEach(function (s) {
      s.addEventListener("mouseenter", function () { mark(s.dataset.v, true); });
      s.addEventListener("mouseleave", function () { mark(s.dataset.v, false); });
      s.addEventListener("click", function () { mark(s.dataset.v, true); setTimeout(function () { mark(s.dataset.v, false); }, 1200); });
    });
  };

  /* ---- 3g. OWL vs SHACL split-screen ------------------------------------ */

  WIDGETS["owl-shacl"] = function (host) {
    host.innerHTML =
      '<header><span class="wt">Try it: same data, opposite verdict</span>' +
      '<span class="wh">two licences, cardinality of one</span></header>' +
      '<div class="body">' +
        '<pre style="margin-top:0"><code data-lang="turtle">:dataset dcterms:license &lt;…/CC-BY&gt; , &lt;…/CC0&gt; .   # two licences\n:dataset a [ owl:maxCardinality 1 ; owl:onProperty dcterms:license ] .</code></pre>' +
        '<div class="btnrow" style="margin:.7rem 0"><button class="btn primary" data-run>▶ run both engines</button><button class="btn" data-reset>reset</button></div>' +
        '<div class="grid2">' +
          '<div class="panel"><div class="ph">OWL reasoner</div><div class="out" data-out="owl"><span class="muted small">not run</span></div></div>' +
          '<div class="panel"><div class="ph">SHACL validator</div><div class="out" data-out="shacl"><span class="muted small">not run</span></div></div>' +
        "</div>" +
      "</div>" +
      '<div class="foot" data-foot>Neither engine is broken. They were built to answer different questions.</div>';

    paintCode(host);
    function set(k, h) { $('[data-out="' + k + '"]', host).innerHTML = h; }

    $("[data-run]", host).addEventListener("click", function () {
      set("owl", '<div class="status"><span class="spinner"></span> reasoning…</div>');
      set("shacl", '<div class="status"><span class="spinner"></span> validating…</div>');
      setTimeout(function () {
        set("owl",
          '<div class="status ok">✓ consistent — no complaint</div>' +
          '<p class="small" style="margin:.3rem 0">Inferred:</p>' +
          '<pre style="margin:0;font-size:.72rem"><code>&lt;CC-BY&gt; owl:sameAs &lt;CC0&gt;</code></pre>' +
          '<p class="small" style="margin:.4rem 0 0;color:var(--no)"><strong>It has just declared CC-BY and CC0 to be the same licence.</strong></p>');
      }, 650);
      setTimeout(function () {
        set("shacl",
          '<div class="status" style="color:var(--no)">✗ 1 violation</div>' +
          '<p class="small" style="margin:.3rem 0 0">maxCount 1 on <code>dcterms:license</code>, found 2.</p>' +
          '<p class="small muted" style="margin:.4rem 0 0">A missing or excess value is an error, not an inference opportunity.</p>');
        $("[data-foot]", host).innerHTML =
          "<strong>Same input, opposite outcome</strong> — and the OWL result is worse than useless, because it silently merged two incompatible licences. That is why both run.";
      }, 1100);
    });
    $("[data-reset]", host).addEventListener("click", function () {
      set("owl", '<span class="muted small">not run</span>');
      set("shacl", '<span class="muted small">not run</span>');
      $("[data-foot]", host).innerHTML = "Neither engine is broken. They were built to answer different questions.";
    });
  };

  /* ---- 3h. Direction flip ------------------------------------------------ */

  WIDGETS["direction-flip"] = function (host) {
    var human = true;
    host.innerHTML =
      '<header><span class="wt">Try it: same reaction, opposite roles</span>' +
      '<span class="wh">RHEA:19453 in two organisms</span></header>' +
      '<div class="body">' +
        '<div class="btnrow" style="margin-bottom:.9rem">' +
          '<button class="btn primary" data-o="h">human ALT1 · P24298</button>' +
          '<button class="btn" data-o="e">E. coli AlaA · P0A959</button>' +
        "</div>" +
        '<div class="verdict" data-eq></div>' +
      "</div>" +
      '<div class="foot" data-foot></div>';

    function draw() {
      $$("[data-o]", host).forEach(function (b) {
        b.classList.toggle("primary", (b.dataset.o === "h") === human);
      });
      $("[data-eq]", host).innerHTML =
        '<div class="conj" style="font-size:.95rem;line-height:1.9">' +
          "<span>" + (human
            ? 'L-alanine + 2-oxoglutarate &nbsp;<strong style="color:var(--accent)">→</strong>&nbsp; pyruvate + <strong style="color:var(--ok)">L-glutamate</strong>'
            : 'pyruvate + <strong style="color:var(--no)">L-glutamate</strong> &nbsp;<strong style="color:var(--accent)">→</strong>&nbsp; L-alanine + 2-oxoglutarate') +
          "</span>" +
        "</div>" +
        '<div class="why" style="margin-top:.6rem">' +
          "<code>Reaction=RHEA:19453</code> &nbsp;·&nbsp; " +
          "<code>PhysiologicalDirection=" + (human ? "left-to-right" : "right-to-left") + "</code>" +
        "</div>";
      $("[data-foot]", host).innerHTML = human
        ? "Human ALT1 <strong>produces</strong> L-glutamate. Now switch organism — the Rhea identifier does not change."
        : "<strong>Same reaction. Same Rhea master. Opposite roles.</strong> <em>E. coli</em> AlaA runs biosynthetically and <em>consumes</em> the L-glutamate that ALT1 produces (evidence: PubMed 20729367). Substrate and product are roles in a direction, not properties of a molecule.";
    }
    $$("[data-o]", host).forEach(function (b) {
      b.addEventListener("click", function () { human = b.dataset.o === "h"; draw(); });
    });
    draw();
  };

  /* ---- 3i. Microspecies toggle ------------------------------------------- */

  WIDGETS.microspecies = function (host) {
    var ROWS = [
      ["L-alanine", 57972, "L-alanine zwitterion", 0, 16977, "tautomer"],
      ["L-aspartate", 29991, "L-aspartate(1−)", -1, 17053, "conjugate acid"],
      ["L-cysteine", 35235, "L-cysteine zwitterion", 0, 17561, "tautomer"],
      ["2-oxoglutarate", 16810, "2-oxoglutarate(2−)", -2, null, ""],
      ["pyruvate", 15361, "pyruvate", -1, null, ""],
      ["oxaloacetate", 16452, "oxaloacetate(2−)", -2, null, ""],
      ["3-mercaptopyruvate", 57678, "3-mercaptopyruvate", -1, 16208, "conjugate acid"],
      ["L-glutamate", 29985, "L-glutamate(1−)", -1, 16015, "conjugate acid"],
      ["PLP", 597326, "pyridoxal 5′-phosphate(2−)", -2, 18405, "neutral parent"]
    ];
    var show = false;

    host.innerHTML =
      '<header><span class="wt">Try it: the systematic error</span>' +
      '<span class="wh">9 identifiers, 6 wrong, all wrong the same way</span></header>' +
      '<div class="body"><div class="tablewrap"><table><thead><tr>' +
        "<th>species</th><th>ChEBI</th><th>accepted name</th><th>charge</th><th data-c4>&nbsp;</th>" +
      "</tr></thead><tbody data-rows></tbody></table></div>" +
      '<div class="btnrow"><button class="btn primary" data-t>show what v0 used</button></div></div>' +
      '<div class="foot" data-foot>Every identifier was checked individually against ChEBI. Press the button to see what a defensible automated method produced instead.</div>';

    function draw() {
      $("[data-c4]", host).textContent = show ? "v0 used" : "";
      $("[data-rows]", host).innerHTML = ROWS.map(function (r) {
        var wrong = show && r[4];
        return '<tr class="msrow' + (wrong ? " wrong" : "") + '">' +
          "<td>" + r[0] + "</td>" +
          "<td><strong>" + r[1] + "</strong></td>" +
          "<td>" + r[2] + "</td>" +
          "<td>" + r[3] + "</td>" +
          "<td>" + (show ? (r[4] ? '<span class="old">' + r[4] + "</span> <span class='muted small'>" + r[5] + "</span>" : '<span style="color:var(--ok)">✓ correct</span>') : "") + "</td>" +
          "</tr>";
      }).join("");
      $("[data-t]", host).textContent = show ? "hide v0's identifiers" : "show what v0 used";
      $("[data-foot]", host).innerHTML = show
        ? "Six of nine wrong — and <strong>every one off by exactly one hydrogen per unit of charge</strong>. v0 resolved ChEBI through KEGG's <code>conv/chebi</code> cross-reference, which returns the neutral parent. A systematic method produced a systematic error, and nothing complained: the formulae stored alongside were already the correct microspecies values, so the balance tests passed."
        : "Every identifier was checked individually against ChEBI. Press the button to see what a defensible automated method produced instead.";
    }
    $("[data-t]", host).addEventListener("click", function () { show = !show; draw(); });
    draw();
  };

  /* ---- 3j. Multi-stage build -------------------------------------------- */

  WIDGETS.multistage = function (host) {
    host.innerHTML =
      '<header><span class="wt">Try it: what crosses into the shipped image</span>' +
      '<span class="wh">multi-stage build</span></header>' +
      '<div class="body"><div class="grid2">' +
        '<div class="panel"><div class="ph">stage 1 — builder</div><div class="out">' +
          '<ul class="rows" style="margin:0">' +
            '<li data-it="jvm">☕ Java runtime (JVM)</li>' +
            '<li data-it="herm">🧠 HermiT reasoner</li>' +
            '<li data-it="dev">🔧 pytest · ruff · mypy</li>' +
            '<li data-it="src">📄 source + dependencies</li>' +
            '<li data-it="ttl" style="border-color:var(--ok);background:var(--ok-sf)">📦 reactions.ttl <span class="small muted">(reasoned)</span></li>' +
          "</ul></div></div>" +
        '<div class="panel"><div class="ph">stage 2 — runtime (shipped)</div><div class="out" data-rt>' +
          '<p class="small muted">press build</p></div></div>' +
      "</div>" +
      '<div class="btnrow" style="margin-top:.8rem"><button class="btn primary" data-run>▶ docker build</button><button class="btn" data-reset>reset</button></div></div>' +
      '<div class="foot" data-foot>The reasoner needs Java. The service does not reason — it answers. So what should the shipped image contain?</div>';

    var order = [
      ["src", "📄 source + dependencies"],
      ["ttl", "📦 reactions.ttl <span class='small muted'>(with inferred types)</span>"]
    ];

    $("[data-run]", host).addEventListener("click", function () {
      var rt = $("[data-rt]", host);
      rt.innerHTML = '<ul class="rows" style="margin:0"></ul>';
      var ul = rt.querySelector("ul");
      ["jvm", "herm", "dev"].forEach(function (k) {
        var n = $('[data-it="' + k + '"]', host);
        if (n) { n.style.opacity = "0.3"; n.style.textDecoration = "line-through"; }
      });
      order.forEach(function (o, i) {
        setTimeout(function () {
          var li = el("li", null, o[1]);
          if (o[0] === "ttl") { li.style.borderColor = "var(--ok)"; li.style.background = "var(--ok-sf)"; }
          ul.appendChild(li);
          if (i === order.length - 1) {
            $("[data-foot]", host).innerHTML =
              "<strong>No JVM. No reasoner. No test tooling.</strong> The inferred types are already materialised in the Turtle, so the running service answers " +
              "<code>?r a tacat:TransaminationReaction</code> from a plain lookup. It starts with the graph loaded, needs no network — and if reasoning had failed, the image would not exist.";
          }
        }, 350 + i * 500);
      });
    });
    $("[data-reset]", host).addEventListener("click", function () {
      $$("[data-it]", host).forEach(function (n) { n.style.opacity = ""; n.style.textDecoration = ""; });
      $("[data-rt]", host).innerHTML = '<p class="small muted">press build</p>';
      $("[data-foot]", host).innerHTML = "The reasoner needs Java. The service does not reason — it answers. So what should the shipped image contain?";
    });
  };

  function mountWidgets() {
    $$(".widget[data-widget]").forEach(function (w) {
      var name = w.getAttribute("data-widget");
      var fn = WIDGETS[name];
      if (!fn) {
        w.innerHTML =
          '<div class="widget-error" role="alert"><strong>This exercise is not implemented.</strong> ' +
          "The explanation around it still stands.</div>";
        return;
      }
      try {
        fn(w);
        badgeWidget(w, name);
      } catch (e) {
        // NEVER hide it. This is a primer whose central lesson is that silent
        // failure is the dangerous kind; a widget that vanishes on error would
        // be the thing it warns against, performed live.
        if (window.console && console.error) console.error("widget " + name + " failed", e);
        w.innerHTML =
          '<div class="widget-error" role="alert"><strong>This exercise failed to load.</strong> ' +
          "The explanation below it is unaffected." +
          (location.hostname === "localhost" ? " <code>" + String(e && e.message) + "</code>" : "") +
          "</div>";
      }
    });
  }

  /* ----------------------------------------------------------------------
     Widget provenance — what kind of result is this?

     Every widget here runs in the browser. None of them calls the tacat
     service, a reasoner or a SPARQL endpoint. That is the right choice for an
     offline prep tool, but it has to be SAID: a button reading "run the
     federated join against UniProt" that silently returns three hard-coded
     numbers will be described in an interview as a live query, and the
     correction will arrive from the other side of the table.

       REPLAY      output captured from a real run, reproduced verbatim
       SIMULATION  browser logic that mirrors the concept, not the engine
       EXAMPLE     illustrative only, nothing is computed
     ---------------------------------------------------------------------- */

  var WIDGET_KIND = {
    "silent-failure": ["REPLAY", "verified live 27 Jul 2026 — no request is made now",
                       "tacat questions"],
    "cq-dropout":     ["REPLAY", "the real CQ05/CQ06 answers, 4 then 3", "tacat questions"],
    "direction-flip": ["REPLAY", "UniProt P24298 / P0A959, curated annotation", null],
    microspecies:     ["EXAMPLE", "identifiers verified against ChEBI", null],
    classifier:       ["SIMULATION", "mirrors the four conditions — not HermiT itself",
                       "tacat infer"],
    "owl-shacl":      ["SIMULATION", "illustrative licence case, not the project's data",
                       "uv run pytest tests/test_shapes.py"],
    "sparql-match":   ["SIMULATION", "pattern matching in the browser", null],
    multistage:       ["SIMULATION", "the shape of the build, not a real build",
                       "docker compose up --build"],
    "turtle-expand":  ["EXAMPLE", "the same triples, written two ways", null]
  };

  function badgeWidget(host, name) {
    var meta = WIDGET_KIND[name];
    var head = $("header", host);
    if (!meta || !head) return;

    var kind = meta[0], note = meta[1], cmd = meta[2];
    head.insertAdjacentHTML(
      "beforeend",
      '<span class="wkind k-' + kind.toLowerCase() + '" title="' + esc(note) + '">' + kind + "</span>"
    );

    var foot = $("[data-foot]", host) || host.querySelector(".foot");
    var line =
      '<div class="wprov"><strong>' + kind + "</strong> — " + esc(note) +
      (cmd ? ' · real command: <code>' + esc(cmd) + "</code>" : "") + "</div>";
    if (foot) foot.insertAdjacentHTML("afterend", line);
    else host.insertAdjacentHTML("beforeend", line);
  }

  /* ======================================================================
     4. Progress checklists — <button class="checkline" data-check="id">
     ====================================================================== */

  function mountChecks() {
    var done = store.get("checks", {});

    $$(".checkline[data-check]").forEach(function (b) {
      var id = b.getAttribute("data-check");
      b.setAttribute("aria-pressed", done[id] ? "true" : "false");
      if (!b.querySelector(".bx")) b.insertAdjacentHTML("afterbegin", '<span class="bx">✓</span>');
      b.addEventListener("click", function () {
        done = store.get("checks", {});
        done[id] = !done[id];
        store.set("checks", done);
        b.setAttribute("aria-pressed", done[id] ? "true" : "false");
        paintProgress();
      });
    });
    paintProgress();
  }

  /* The complete set, fixed. Regenerate with:  node build-manifest.mjs
     ------------------------------------------------------------------------
     This used to be accumulated from whatever pages had been VISITED, which
     meant opening chapter 1, ticking its two boxes and being told 100 %
     ready. A navigation artefact was being reported as mastery — the single
     worst failure mode available in a preparation tool, because it is
     confidently wrong in the reassuring direction. */
  var CHECKS = [
    "1:triple", "1:literal",
    "2:nary", "2:defined", "2:control",
    "3:cq", "3:fed",
    "4:cq", "4:owlshacl",
    "5:protocol",
    "6:ci", "6:multistage",
    "7:plp", "7:chebi", "7:direction",
    "8:narrative", "8:weak"
  ];

  function allCheckIds() { return CHECKS; }

  function paintProgress() {
    var done = store.get("checks", {});

    // A check id on the page that is not in the manifest means the manifest is
    // stale. Say so rather than quietly counting it.
    var unknown = $$(".checkline[data-check]")
      .map(function (b) { return b.getAttribute("data-check"); })
      .filter(function (id) { return CHECKS.indexOf(id) < 0; });
    if (unknown.length && window.console && console.warn) {
      console.warn("checks missing from the manifest in primer.js:", unknown.join(", "));
    }

    var idx = CHECKS;
    var n = idx.filter(function (i) { return done[i]; }).length;
    var total = idx.length;
    var pct = total ? Math.round(n / total * 100) : 0;

    $$("[data-progress]").forEach(function (p) {
      p.innerHTML =
        '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="pl"><span>' + (total ? n + " of " + total + " marked" : "nothing marked yet") +
        "</span><span>“I can explain this”</span></div>";
    });

    // per-page ticks in the sidebar
    var byPage = {};
    idx.forEach(function (i) { var p = i.split(":")[0]; byPage[p] = byPage[p] || { n: 0, d: 0 }; byPage[p].n++; if (done[i]) byPage[p].d++; });
    $$(".sidebar ol a").forEach(function (a) {
      var m = (a.getAttribute("href") || "").match(/^(\d+)-/);
      if (!m) return;
      var st = byPage[String(parseInt(m[1], 10))];
      var old = a.querySelector(".done");
      if (old) old.remove();
      if (st && st.n && st.d === st.n) a.insertAdjacentHTML("beforeend", '<span class="done">✓</span>');
    });
  }

  /* ======================================================================
     5. Deck mode — repaginate the same DOM, one h2 per slide
     ====================================================================== */

  var deck = { on: false, i: 0, slides: [] };

  function buildDeck() {
    var page = $(".page");
    if (!page || deck.slides.length) return;

    var kids = Array.prototype.slice.call(page.children);
    var head = el("div", "slide"), cur = head;
    deck.slides = [head];

    kids.forEach(function (k) {
      if (k.classList.contains("pager")) return;
      if (k.tagName === "H2") { cur = el("div", "slide"); deck.slides.push(cur); }
      cur.appendChild(k);
    });
    deck.slides.forEach(function (s) { page.appendChild(s); });

    var bar = el("div", "deckbar");
    bar.innerHTML = '<button class="btn" data-d="-1">←</button><div class="dots"></div>' +
                    '<span class="pos"></span><button class="btn" data-d="1">→</button>';
    document.body.appendChild(bar);
    $(".dots", bar).innerHTML = deck.slides.map(function () { return "<i></i>"; }).join("");
    $$("[data-d]", bar).forEach(function (b) {
      b.addEventListener("click", function () { go(deck.i + parseInt(b.dataset.d, 10)); });
    });
  }

  function go(i) {
    if (!deck.slides.length) return;
    deck.i = Math.max(0, Math.min(deck.slides.length - 1, i));
    deck.slides.forEach(function (s, n) { s.classList.toggle("on", n === deck.i); });
    var bar = $(".deckbar");
    if (bar) {
      $$(".dots i", bar).forEach(function (d, n) { d.classList.toggle("on", n === deck.i); });
      $(".pos", bar).textContent = (deck.i + 1) + " / " + deck.slides.length;
    }
    window.scrollTo(0, 0);
  }

  function setDeck(on) {
    deck.on = on;
    if (on) buildDeck();
    document.body.classList.toggle("deck", on);
    var b = $("[data-deck-btn]");
    if (b) { b.classList.toggle("on", on); b.textContent = on ? "▤ read" : "▦ deck"; }
    if (on) go(deck.i);
    store.set("deck", on);
  }

  /* ======================================================================
     6. Chrome — theme, toc, menu, resume, keys
     ====================================================================== */

  function initChrome() {
    var bar = el("div", "topbar");

    var deckBtn = el("button", null, "▦ deck");
    deckBtn.setAttribute("data-deck-btn", "");
    deckBtn.title = "One idea per screen (d)";
    deckBtn.addEventListener("click", function () { setDeck(!deck.on); });

    var themeBtn = el("button");
    function isDark() {
      var a = document.documentElement.getAttribute("data-theme");
      if (a) return a === "dark";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    function label() { themeBtn.textContent = isDark() ? "☀" : "☾"; }
    themeBtn.title = "Light / dark";
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      store.set("theme", next);
      label();
    });

    var stored = store.get("theme", null);
    if (stored) document.documentElement.setAttribute("data-theme", stored);
    label();

    if ($(".page") && $$(".page h2").length > 1) bar.appendChild(deckBtn);
    bar.appendChild(themeBtn);
    document.body.appendChild(bar);

    document.addEventListener("keydown", function (e) {
      if (/^(INPUT|TEXTAREA)$/.test((e.target || {}).tagName || "")) return;
      if (e.key === "d" && !e.metaKey && !e.ctrlKey) { setDeck(!deck.on); }
      else if (deck.on && e.key === "ArrowRight") { go(deck.i + 1); }
      else if (deck.on && e.key === "ArrowLeft") { go(deck.i - 1); }
      else if (deck.on && e.key === "Escape") { setDeck(false); }
    });
  }

  function initToc() {
    var host = $("[data-toc]");
    if (!host) return;
    var heads = $$(".page h2[id]");
    if (!heads.length) { host.style.display = "none"; return; }

    var links = heads.map(function (h) {
      var a = el("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent.replace(/^\d+\.\s*/, "").trim();
      host.appendChild(a);
      return a;
    });

    if (!("IntersectionObserver" in window)) return;
    var seen = {};
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen[e.target.id] = e.isIntersecting; });
      var active = null;
      heads.forEach(function (h) { if (seen[h.id] && !active) active = h.id; });
      if (!active) return;
      links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + active); });
    }, { rootMargin: "0px 0px -70% 0px", threshold: 0 });
    heads.forEach(function (h) { obs.observe(h); });
  }

  function initMenu() {
    var sb = $(".sidebar");
    if (!sb) return;
    var btn = el("button", "menu-btn", "☰  All chapters");
    btn.type = "button";
    var brand = sb.querySelector(".brand");
    if (brand && brand.nextSibling) sb.insertBefore(btn, brand.nextSibling);
    else sb.insertBefore(btn, sb.firstChild);

    function apply() {
      if (window.innerWidth <= 900) { if (!sb.hasAttribute("data-open")) sb.setAttribute("data-open", "false"); }
      else sb.removeAttribute("data-open");
    }
    btn.addEventListener("click", function () {
      sb.setAttribute("data-open", sb.getAttribute("data-open") === "true" ? "false" : "true");
    });
    window.addEventListener("resize", apply);
    apply();
  }

  function initResume() {
    var key = "scroll:" + pageName();
    var saved = store.get(key, 0);

    window.addEventListener("beforeunload", function () {
      if (!deck.on) store.set(key, Math.round(window.scrollY));
      store.set("last", { page: pageName(), y: Math.round(window.scrollY) });
    });

    if (saved > 300 && !location.hash) {
      var r = $("[data-resume]");
      if (r) {
        r.classList.add("show");
        r.innerHTML = '<span>You stopped part-way down this page.</span>' +
                      '<button class="btn primary" style="margin-left:auto">jump back</button>';
        r.querySelector("button").addEventListener("click", function () {
          window.scrollTo({ top: saved, behavior: "smooth" });
          r.classList.remove("show");
        });
      }
    }

    // "continue where you left off" on the index
    var cont = $("[data-continue]");
    if (cont) {
      var last = store.get("last", null);
      if (last && last.page && last.page !== "index.html") {
        var title = (PAGES.filter(function (p) { return p[0] === last.page; })[0] || [null, last.page])[1];
        cont.classList.add("show");
        cont.innerHTML = '<span>Last time you were in <strong>' + title + "</strong>.</span>" +
                         '<a class="btn primary" style="margin-left:auto;text-decoration:none" href="' + last.page + '">continue →</a>';
      }
    }
  }

  /* ======================================================================
     7. Boot
     ====================================================================== */

  function boot() {
    paintCode(document);
    mountFigures();
    mountWidgets();
    mountChecks();
    initChrome();
    initToc();
    initMenu();
    initResume();
    if (store.get("deck", false) && $$(".page h2").length > 1) setDeck(true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
