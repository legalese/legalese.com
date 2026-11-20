"use client";

// The statute map: every Act in a jurisdiction, one line each; each line divided into the Act's sections,
// sized by their text; coloured where an L4 encoding covers the section. Data: /commons-data/<code>-map.json.
import { useEffect, useRef, useState } from "react";

type Part = { k: string; n: string; t: string; d: { n: string; t: string }[] };
// a section: [number, heading, size, part index, division index, indices of the encodings covering it]
type Sec = [string, string, number, number, number, number[]];
type Act = { s: string; t: string; pg: number; pgx?: boolean; parts: Part[]; secs: Sec[]; sch: number; rows: string[] };
type Prepared = Act & { body: number; encN: number; encFrac: number; year: number };

const COLORS = {
  ink: "#1d2422", muted: "#5e6a66", rule: "#d9dfdc", a: "#cfd8d4", b: "#b9c5c0",
  sched: "#e6e2d6", enc: "#1e7a3c", panel: "#ffffff", hover: "#1d2422",
};
const LABEL_W = 280, ROW_H = 15, GAP = 4, PAD_R = 24;
const FONT = "Inter, system-ui, sans-serif", MONO = "ui-monospace, Menlo, Consolas, monospace";

function encodingLabel(r: string) {
  return `Encoding (${r === "(root)" ? "main" : r})`;
}

export default function StatuteMap({ code, base }: { code: string; base: string }) {
  const scroller = useRef<HTMLDivElement>(null), spacer = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null), tip = useRef<HTMLDivElement>(null);
  const [acts, setActs] = useState<Prepared[] | null>(null);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState("pages");
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [lenMode, setLenMode] = useState("log");

  useEffect(() => {
    let live = true;
    fetch(`/commons-data/${code}-map.json`)
      .then((r) => r.json())
      .then((raw: Act[]) => {
        if (!live) return;
        setActs(raw.map((a) => {
          const body = a.secs.reduce((s, x) => s + x[2], 0);
          const encN = a.secs.filter((x) => x[5].length).length;
          const m = a.s.match(/(1[6-9]\d\d|20\d\d)$/);
          return { ...a, body, encN, encFrac: a.secs.length ? encN / a.secs.length : 0, year: m ? +m[1] : 9999 };
        }));
      })
      .catch(() => live && setError(true));
    return () => { live = false; };
  }, [code]);

  useEffect(() => {
    if (!acts || !scroller.current || !spacer.current || !canvas.current || !tip.current) return;
    const sc = scroller.current, sp = spacer.current, cv = canvas.current, tp = tip.current;
    const ctx = cv.getContext("2d")!;
    const maxPages = Math.max(1, ...acts.map((a) => a.pg));
    const q = query.trim().toLowerCase();
    const view = acts.filter((a) => !q || a.t.toLowerCase().includes(q) || a.s.includes(q));
    const cmp: Record<string, (x: Prepared, y: Prepared) => number> = {
      pages: (x, y) => y.pg - x.pg, az: (x, y) => x.t.localeCompare(y.t),
      enc: (x, y) => y.encFrac - x.encFrac || y.pg - x.pg, unenc: (x, y) => x.encFrac - y.encFrac || y.pg - x.pg,
      year: (x, y) => x.year - y.year || x.t.localeCompare(y.t),
    };
    view.sort(cmp[sort]);
    const barLen = (pg: number) => (lenMode === "log" ? (maxPages * Math.log1p(pg)) / Math.log1p(maxPages) : pg);
    let ppp = 1, dpr = 1;
    let hover: { a: Prepared; i?: number; sched?: boolean; box?: number[] } | null = null;

    function layout() {
      const w = sc.clientWidth, h = sc.clientHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      ppp = (Math.max(200, w - LABEL_W - PAD_R) / maxPages) * zoom;
      sp.style.width = `${LABEL_W + maxPages * ppp + PAD_R}px`;
      sp.style.height = `${view.length * ROW_H + 8}px`;
      cv.style.width = `${w}px`; cv.style.height = `${h}px`;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      draw();
    }
    function draw() {
      const w = sc.clientWidth, h = sc.clientHeight, sx = sc.scrollLeft, sy = sc.scrollTop;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = COLORS.panel; ctx.fillRect(0, 0, w, h);
      const first = Math.max(0, Math.floor(sy / ROW_H)), last = Math.min(view.length - 1, Math.ceil((sy + h) / ROW_H));
      ctx.textBaseline = "middle";
      for (let r = first; r <= last; r++) {
        const a = view[r], y = r * ROW_H - sy, bh = ROW_H - GAP, by = y + GAP / 2;
        const W = Math.max(1.5, barLen(a.pg) * ppp), scale = a.body + a.sch > 0 ? W / (a.body + a.sch) : 0;
        let x = LABEL_W - sx, lastP = -2;
        if (!a.secs.length) { ctx.fillStyle = COLORS.sched; ctx.fillRect(x, by, W, bh); }
        for (let i = 0; i < a.secs.length; i++) {
          const s = a.secs[i], sw = s[2] * scale;
          if (x + sw >= LABEL_W - 1 && x <= w) {
            ctx.fillStyle = s[5].length ? COLORS.enc
              : (s[3] < 0 ? 0 : s[3]) % 2 ? COLORS.b : COLORS.a;
            ctx.fillRect(Math.max(x, LABEL_W), by, Math.max(0.6, Math.min(x + sw, w) - Math.max(x, LABEL_W)), bh);
            if (s[3] !== lastP && i > 0) { ctx.fillStyle = COLORS.panel; ctx.fillRect(x - 0.5, by, 1, bh); }
          }
          lastP = s[3]; x += sw;
        }
        if (a.sch > 0 && a.secs.length) {
          const sw = a.sch * scale;
          if (x + sw >= LABEL_W && x <= w) {
            ctx.fillStyle = COLORS.sched;
            ctx.fillRect(Math.max(x, LABEL_W), by, Math.min(x + sw, w) - Math.max(x, LABEL_W), bh);
          }
        }
        const on = hover && hover.a === a;
        ctx.fillStyle = COLORS.panel; ctx.fillRect(0, y, LABEL_W, ROW_H);
        ctx.fillStyle = on ? COLORS.ink : COLORS.muted;
        ctx.font = `${on ? 600 : 400} 11.5px ${FONT}`;
        let label = a.t;
        while (ctx.measureText(label).width > LABEL_W - 64 && label.length > 4) label = label.slice(0, -2);
        if (label !== a.t) label = label.trimEnd() + "…";
        ctx.textAlign = "left"; ctx.fillText(label, 6, y + ROW_H / 2);
        ctx.textAlign = "right"; ctx.font = `10.5px ${MONO}`; ctx.fillStyle = COLORS.muted;
        ctx.fillText(`${a.pg}p`, LABEL_W - 8, y + ROW_H / 2);
      }
      ctx.fillStyle = COLORS.rule; ctx.fillRect(LABEL_W - 1, 0, 1, h);
      if (hover?.box) { const b = hover.box; ctx.strokeStyle = COLORS.hover; ctx.lineWidth = 1.25; ctx.strokeRect(b[0], b[1], b[2], b[3]); }
    }
    function hitTest(mx: number, my: number) {
      const sx = sc.scrollLeft, sy = sc.scrollTop, r = Math.floor((my + sy) / ROW_H);
      if (r < 0 || r >= view.length) return null;
      const a = view[r], by = r * ROW_H - sy + GAP / 2, bh = ROW_H - GAP;
      if (mx < LABEL_W) return { a };
      const W = Math.max(1.5, barLen(a.pg) * ppp), scale = a.body + a.sch > 0 ? W / (a.body + a.sch) : 0;
      let x = LABEL_W - sx;
      for (let i = 0; i < a.secs.length; i++) {
        const sw = a.secs[i][2] * scale;
        if (mx >= x && mx < x + Math.max(sw, 0.6)) return { a, i, box: [x, by, Math.max(sw, 1), bh] };
        x += sw;
      }
      if (a.sch > 0) { const sw = a.sch * scale; if (mx >= x && mx < x + sw) return { a, sched: true, box: [x, by, sw, bh] }; }
      return { a };
    }
    const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
    function showTip(hit: NonNullable<typeof hover>, cx: number, cy: number) {
      const a = hit.a;
      let h = `<div class="font-semibold">${esc(a.t)}</div><div class="text-xs text-gray-500">${a.pg} pages · ${a.secs.length} sections · ${a.encN} encoded (${Math.round(100 * a.encFrac)}%)</div>`;
      if (hit.i !== undefined) {
        const s = a.secs[hit.i], p = s[3] >= 0 ? a.parts[s[3]] : null, d = p && s[4] >= 0 ? p.d[s[4]] : null;
        if (p) h += `<div class="mt-1">${esc(p.k)} ${esc(p.n)}${p.t ? " · " + esc(p.t) : ""}</div>`;
        if (d) h += `<div>Division ${esc(d.n)}${d.t ? " · " + esc(d.t) : ""}</div>`;
        h += `<div><b>s ${esc(s[0])}</b>${s[1] ? " · " + esc(s[1]) : ""}</div>`;
        h += `<div class="mt-1 text-xs">${s[5].length ? "Encoded in: " + s[5].map((k) => esc(encodingLabel(a.rows[k]))).join(", ") : "Not yet encoded"}</div>`;
      } else if (hit.sched) h += `<div class="mt-1">Schedules (not split into sections)</div>`;
      else h += `<div class="mt-1 text-xs">${a.rows.length ? "Encodings: " + a.rows.map((r) => esc(encodingLabel(r))).join(", ") : "Not yet encoded"}</div>${a.rows.length ? '<div class="mt-1 text-xs text-gray-500">Click to open the Act</div>' : ""}`;
      tp.innerHTML = h; tp.hidden = false;
      const tw = tp.offsetWidth, th = tp.offsetHeight;
      tp.style.left = `${Math.min(window.innerWidth - tw - 8, cx + 14)}px`;
      tp.style.top = `${cy + th + 18 > window.innerHeight ? cy - th - 12 : cy + 16}px`;
    }
    const onMove = (e: MouseEvent) => {
      const rc = cv.getBoundingClientRect(), hit = hitTest(e.clientX - rc.left, e.clientY - rc.top);
      hover = hit;
      if (hit) showTip(hit, e.clientX, e.clientY); else tp.hidden = true;
      draw();
    };
    const onLeave = () => { hover = null; tp.hidden = true; draw(); };
    const onScroll = () => { tp.hidden = true; requestAnimationFrame(draw); };
    const onClick = (e: MouseEvent) => {
      const rc = cv.getBoundingClientRect(), hit = hitTest(e.clientX - rc.left, e.clientY - rc.top);
      if (hit && hit.a.rows.length) window.location.href = `${base}/act/${hit.a.s}`;
    };
    sc.addEventListener("mousemove", onMove); sc.addEventListener("mouseleave", onLeave);
    sc.addEventListener("scroll", onScroll, { passive: true }); sc.addEventListener("click", onClick);
    window.addEventListener("resize", layout);
    sc.scrollTop = 0;
    layout();
    return () => {
      sc.removeEventListener("mousemove", onMove); sc.removeEventListener("mouseleave", onLeave);
      sc.removeEventListener("scroll", onScroll); sc.removeEventListener("click", onClick);
      window.removeEventListener("resize", layout);
    };
  }, [acts, sort, query, zoom, lenMode, base]);

  const swatch = (c: string) => <i className="mr-1.5 inline-block h-2.5 w-4 rounded-sm align-[-1px]" style={{ background: c }} />;
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-gray-200 py-2 text-xs uppercase tracking-wider text-gray-500">
        <label className="flex items-center gap-2">Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-sm normal-case tracking-normal text-gray-900">
            <option value="pages">Most pages first</option><option value="az">A to Z</option>
            <option value="enc">Most encoded first</option><option value="unenc">Least encoded first</option>
            <option value="year">Oldest first</option>
          </select>
        </label>
        <label className="flex items-center gap-2">Find
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Act name"
            className="w-48 rounded border border-gray-300 px-2 py-1 text-sm normal-case tracking-normal text-gray-900" />
        </label>
        <label className="flex items-center gap-2">Length
          <select value={lenMode} onChange={(e) => setLenMode(e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-sm normal-case tracking-normal text-gray-900">
            <option value="log">Log of pages</option><option value="lin">Pages to scale</option>
          </select>
        </label>
        <label className="flex items-center gap-2">Scale
          <input type="range" min={1} max={40} value={zoom} onChange={(e) => setZoom(+e.target.value)} className="w-28 accent-[#1e7a3c]" />
        </label>
      </div>
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-gray-600">
        <span>{swatch(COLORS.enc)}Encoded</span>
        <span>{swatch(COLORS.a)}Not encoded (Parts alternate in shade)</span>
        <span>{swatch(COLORS.sched)}Schedules</span>
      </div>
      <div className="relative h-[70vh] min-h-[320px] border border-gray-200">
        <div ref={scroller} className="absolute inset-0 cursor-pointer overflow-auto" tabIndex={0} aria-label="Statute map, scrollable">
          <div ref={spacer} className="relative"><canvas ref={canvas} className="sticky left-0 top-0 block" /></div>
        </div>
        {!acts && <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">{error ? "The map data could not be loaded." : "Loading the map…"}</div>}
      </div>
      <div ref={tip} hidden className="pointer-events-none fixed z-50 max-w-sm rounded border border-gray-200 bg-white px-3 py-2 text-sm shadow-md" />
    </div>
  );
}
