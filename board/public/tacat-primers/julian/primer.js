/* ==========================================================================
   tacat primer (CS edition) — shared behaviour
   Syntax highlighting, theme toggle, table-of-contents scrollspy, mobile nav.
   No dependencies. Safe to open from file:// with no server.
   ========================================================================== */

(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     1. Tiny syntax highlighter
     One combined alternation per language, scanned once, so a match can never
     be re-processed inside another match. All inner groups are non-capturing
     (?:...) so group indices map 1:1 onto the rule list.
     ---------------------------------------------------------------------- */

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
      ["kw", "\\b(?:PREFIX|BASE|SELECT|DISTINCT|REDUCED|WHERE|FROM|FILTER|OPTIONAL|SERVICE|ORDER|BY|ASC|DESC|GROUP|HAVING|LIMIT|OFFSET|ASK|CONSTRUCT|DESCRIBE|UNION|MINUS|BIND|VALUES|GRAPH|AS|COUNT|SUM|AVG|MIN|MAX|STR|LANG|REGEX|CONTAINS|NOT|EXISTS|IN|a)\\b"],
      ["fn", "\\?[A-Za-z_]\\w*"],
      ["num", "\\b\\d+\\b"]
    ],
    sql: [
      ["comment", "--[^\\n]*"],
      ["string", "'(?:[^'\\\\]|\\\\.)*'"],
      ["kw", "\\b(?:SELECT|DISTINCT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|OUTER|FULL|ON|AND|OR|NOT|NULL|IS|IN|EXISTS|GROUP|ORDER|BY|HAVING|LIMIT|OFFSET|AS|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|PRIMARY|FOREIGN|KEY|REFERENCES|CHECK|CONSTRAINT|UNIQUE|COUNT|SUM|CASE|WHEN|THEN|ELSE|END|UNION|WITH)\\b"],
      ["num", "\\b\\d+(?:\\.\\d+)?\\b"]
    ],
    cypher: [
      ["comment", "//[^\\n]*"],
      ["string", "'(?:[^'\\\\]|\\\\.)*'|\"(?:[^\"\\\\]|\\\\.)*\""],
      ["kw", "\\b(?:MATCH|OPTIONAL|WHERE|RETURN|CREATE|MERGE|SET|DELETE|DETACH|WITH|UNWIND|ORDER|BY|LIMIT|SKIP|AS|AND|OR|NOT|DISTINCT|COUNT)\\b"],
      ["num", "\\b\\d+(?:\\.\\d+)?\\b"]
    ],
    python: [
      ["comment", "#[^\\n]*"],
      ["string", '"""[\\s\\S]*?"""|"(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\''],
      ["kw", "\\b(?:def|class|return|import|from|with|for|in|if|elif|else|not|and|or|None|True|False|assert|raise|try|except|finally|yield|lambda|async|await|pass|global|nonlocal)\\b"],
      ["fn", "\\b[A-Za-z_]\\w*(?=\\()"],
      ["num", "\\b\\d+(?:\\.\\d+)?\\b"]
    ],
    json: [
      ["comment", "//[^\\n]*"],
      ["fn", '"(?:[^"\\\\]|\\\\.)*"(?=\\s*:)'],
      ["string", '"(?:[^"\\\\]|\\\\.)*"'],
      ["kw", "\\b(?:true|false|null)\\b"],
      ["num", "-?\\b\\d+(?:\\.\\d+)?\\b"]
    ],
    bash: [
      ["comment", "#[^\\n]*"],
      ["string", '"(?:[^"\\\\]|\\\\.)*"|\'[^\']*\''],
      ["kw", "\\b(?:uv|docker|curl|pytest|cmp|git|psql|run|build|sync|compose|pull|push|serve|infer|questions|mypy|ruff|pyshacl)\\b"],
      ["num", "\\b\\d+\\b"]
    ],
    docker: [
      ["comment", "#[^\\n]*"],
      ["string", '"(?:[^"\\\\]|\\\\.)*"'],
      ["kw", "^\\s*(?:FROM|RUN|COPY|ENV|WORKDIR|USER|EXPOSE|CMD|ENTRYPOINT|HEALTHCHECK|ARG|LABEL|AS)\\b"],
      ["num", "\\b\\d+\\b"]
    ],
    yaml: [
      ["comment", "#[^\\n]*"],
      ["string", '"(?:[^"\\\\]|\\\\.)*"|\'[^\']*\''],
      ["fn", "^\\s*[A-Za-z_][\\w.-]*(?=:)"],
      ["num", "\\b\\d+\\b"]
    ],
    http: [
      ["comment", "#[^\\n]*"],
      ["kw", "\\b(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|HTTP|Accept|Content-Type|Host|Authorization)\\b"],
      ["num", "\\b\\d{3}\\b"]
    ]
  };

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function highlight(text, lang) {
    var rules = RULES[lang];
    if (!rules) return esc(text);

    var src = rules.map(function (r) { return "(" + r[1] + ")"; }).join("|");
    var re;
    try {
      re = new RegExp(src, "gm");
    } catch (e) {
      return esc(text);
    }

    var out = "", last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      if (m.index > last) out += esc(text.slice(last, m.index));
      var cls = null;
      for (var i = 0; i < rules.length; i++) {
        if (m[i + 1] !== undefined) { cls = rules[i][0]; break; }
      }
      out += cls
        ? '<span class="tok-' + cls + '">' + esc(m[0]) + "</span>"
        : esc(m[0]);
      last = m.index + m[0].length;
    }
    out += esc(text.slice(last));
    return out;
  }

  function paintCode() {
    var blocks = document.querySelectorAll("pre code[data-lang]");
    Array.prototype.forEach.call(blocks, function (el) {
      el.innerHTML = highlight(el.textContent, el.getAttribute("data-lang"));
    });
  }

  /* ----------------------------------------------------------------------
     2. Theme toggle — remembers the choice, defaults to the OS setting
     ---------------------------------------------------------------------- */

  function initTheme() {
    var KEY = "tacat-primer-csc-theme";
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) { /* file:// */ }
    if (stored) document.documentElement.setAttribute("data-theme", stored);

    var btn = document.createElement("button");
    btn.className = "theme-toggle";
    btn.type = "button";

    function currentIsDark() {
      var attr = document.documentElement.getAttribute("data-theme");
      if (attr) return attr === "dark";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    function label() { btn.textContent = currentIsDark() ? "☀ light" : "☾ dark"; }

    btn.addEventListener("click", function () {
      var next = currentIsDark() ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
      label();
    });

    label();
    document.body.appendChild(btn);
  }

  /* ----------------------------------------------------------------------
     3. In-page table of contents from the h2 headings, with scrollspy
     ---------------------------------------------------------------------- */

  function initToc() {
    var host = document.querySelector("[data-toc]");
    if (!host) return;

    var heads = document.querySelectorAll(".page h2[id]");
    if (!heads.length) { host.style.display = "none"; return; }

    var links = [];
    Array.prototype.forEach.call(heads, function (h) {
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent.replace(/^\d+\.\s*/, "");
      host.appendChild(a);
      links.push(a);
    });

    if (!("IntersectionObserver" in window)) return;

    var seen = {};
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen[e.target.id] = e.isIntersecting; });
      var activeId = null;
      Array.prototype.forEach.call(heads, function (h) {
        if (seen[h.id] && !activeId) activeId = h.id;
      });
      if (!activeId) return;
      links.forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === "#" + activeId);
      });
    }, { rootMargin: "0px 0px -70% 0px", threshold: 0 });

    Array.prototype.forEach.call(heads, function (h) { obs.observe(h); });
  }

  /* ----------------------------------------------------------------------
     4. Mobile: collapse the chapter list behind a button
     ---------------------------------------------------------------------- */

  function initMenu() {
    var sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    var btn = document.createElement("button");
    btn.className = "menu-btn";
    btn.type = "button";
    btn.textContent = "☰  All chapters";

    var brand = sidebar.querySelector(".brand");
    if (brand && brand.nextSibling) sidebar.insertBefore(btn, brand.nextSibling);
    else sidebar.insertBefore(btn, sidebar.firstChild);

    function apply() {
      if (window.innerWidth <= 960) {
        if (!sidebar.hasAttribute("data-open")) sidebar.setAttribute("data-open", "false");
      } else {
        sidebar.removeAttribute("data-open");
      }
    }
    btn.addEventListener("click", function () {
      sidebar.setAttribute("data-open", sidebar.getAttribute("data-open") === "true" ? "false" : "true");
    });
    window.addEventListener("resize", apply);
    apply();
  }

  /* ----------------------------------------------------------------------
     5. ← / → move between chapters, using the pager links
     ---------------------------------------------------------------------- */

  function initKeys() {
    document.addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;

      var sel = e.key === "ArrowLeft" ? ".pager a:not(.next)"
              : e.key === "ArrowRight" ? ".pager a.next"
              : null;
      if (!sel) return;
      var link = document.querySelector(sel);
      if (link) window.location.href = link.getAttribute("href");
    });
  }

  function boot() {
    paintCode();
    initTheme();
    initToc();
    initMenu();
    initKeys();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
