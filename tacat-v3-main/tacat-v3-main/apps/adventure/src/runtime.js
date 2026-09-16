/* Deck runtime. `DECK` — author, event, date, total — is injected by build.mjs
   immediately above this, so the slide count printed in the footer is computed
   from the slides rather than written down anywhere. */
(() => {
  "use strict";

  const stage  = document.getElementById("stage");
  const slides = [...document.querySelectorAll(".slide")];
  const total  = slides.length;
  const ov     = document.getElementById("overview");
  const notes  = document.getElementById("notes");
  const help   = document.getElementById("help");

  // Footer on every slide but the cover. A `live` marker rendered by the build
  // is preserved; everything else here is generated.
  slides.forEach((s, i) => {
    let f = s.querySelector("footer");
    if (!f) { f = document.createElement("footer"); s.appendChild(f); }
    const live = f.querySelector(".live");
    f.innerHTML = "";
    if (!s.classList.contains("cover")) {
      const l = document.createElement("span");
      l.textContent = `${DECK.author} · ${DECK.event} · ${DECK.date}`;
      const r = document.createElement("span");
      r.textContent = `${i + 1} / ${total}`;
      f.append(l, live || document.createTextNode(""), r);
    }
  });

  let cur = 0, step = 0;
  const frags = i => [...slides[i].querySelectorAll(".frag")];

  function render() {
    slides.forEach((s, i) => s.classList.toggle("active", i === cur));
    frags(cur).forEach((f, i) => f.classList.toggle("shown", i < step));
    notes.innerHTML = "<b>notes ·</b> " + (slides[cur].dataset.notes || "—");
    [...ov.children].forEach((t, i) => t.classList.toggle("cur", i === cur));
    location.hash = cur + 1;
  }
  function go(n, s) {
    cur = Math.max(0, Math.min(total - 1, n));
    step = s === "end" ? frags(cur).length : 0;
    render();
  }
  function next() {
    if (step < frags(cur).length) { step++; render(); }
    else if (cur < total - 1) go(cur + 1);
  }
  function prev() {
    if (step > 0) { step--; render(); }
    else if (cur > 0) go(cur - 1, "end");
  }

  // The stage is a fixed 1280x720 so type sizes are predictable at any
  // screen-share resolution; only the scale factor changes.
  function fit() {
    const k = Math.min((innerWidth - 24) / stage.offsetWidth, (innerHeight - 24) / stage.offsetHeight);
    stage.style.transform = `scale(${k})`;
  }
  addEventListener("resize", fit);

  // Overview. Built from the slides themselves, so it cannot fall out of date.
  slides.forEach((s, i) => {
    const t = document.createElement("div");
    t.className = "thumb";
    const gist = (s.querySelector("blockquote,.lead,.body,h1")?.textContent || "").trim();
    t.innerHTML = `<div class="tt">${s.dataset.title || ""}</div>`
                + `<div class="tk">${gist.slice(0, 90)}</div>`
                + `<div class="tn">${i + 1}</div>`;
    t.onclick = () => { ov.classList.remove("on"); go(i); };
    ov.appendChild(t);
  });

  addEventListener("keydown", e => {
    const k = e.key;
    if (k === "Escape")         { ov.classList.toggle("on"); help.classList.remove("on"); return; }
    if (k === "?")              { help.classList.toggle("on"); return; }
    if (k === "n" || k === "N") { notes.classList.toggle("on"); return; }
    if (k === "f" || k === "F") {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
      return;
    }
    if (help.classList.contains("on")) { help.classList.remove("on"); return; }
    if (k === "ArrowRight" || k === " " || k === "PageDown") { e.preventDefault(); next(); }
    else if (k === "ArrowLeft" || k === "PageUp")            { e.preventDefault(); prev(); }
    else if (k === "Home")                                   { go(0); }
    else if (k === "End")                                    { go(total - 1, "end"); }
    else if (/^[0-9]$/.test(k))                              { go((k === "0" ? 10 : +k) - 1); }
  });
  addEventListener("click", e => {
    if (!e.target.closest(".thumb") && !ov.classList.contains("on")) next();
  });

  fit();
  go(Math.max(0, (parseInt(location.hash.slice(1), 10) || 1) - 1));
})();
