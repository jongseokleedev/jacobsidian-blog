/* Shared atoms used across all four variations */
const { useMemo } = React;

// ── Logo (jacobsidian wordmark) ─────────────────────────────
function BdLogo({ size = 15 }) {
  return (
    <div className="bd-logo" style={{ fontSize: size }}>
      <span className="mark" />
      <span><span className="b">jac</span><span className="t">o</span><span className="b">b</span><span className="t">sidian</span></span>
    </div>
  );
}

// ── Header (utilities only — nav lives in left rail) ────────
function BdHeader() {
  return (
    <div className="bd-header">
      <BdLogo />
      <div className="bd-nav">
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 10px",
          border: "1px solid var(--border)",
          borderRadius: 6,
          color: "var(--fg-faint)",
          fontSize: 12,
          cursor: "text",
          minWidth: 240,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <span>Wander Jacob's second brain…</span>
          <span className="mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--fg-veryfaint)" }}>⌘K</span>
        </span>
        <span className="icon" title="Theme">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        </span>
        <span className="icon" title="RSS">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
        </span>
      </div>
    </div>
  );
}

// ── Footer ──────────────────────────────────────────────────
function BdFooter() {
  return (
    <div style={{
      borderTop: "1px solid var(--border)",
      padding: "16px 24px",
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12,
      color: "var(--fg-mute)",
    }}>
      <div style={{ display: "flex", gap: 14 }}>
        <span style={{ opacity: 0.6 }}>GitHub</span>
        <span style={{ opacity: 0.6 }}>LinkedIn</span>
        <span style={{ opacity: 0.6 }}>Email</span>
      </div>
      <div>© 2026 Jacob · RSS</div>
    </div>
  );
}

// ── Mini graph (SVG placeholder of the d3 canvas) ───────────
// Used to show the Obsidian-style network. Static positions, focused node.
function BdMiniGraph({ size = 240, height, focused = true, label, variant = "default" }) {
  const h = height ?? size;
  // Pre-computed node positions for a pleasing layout
  const nodes = [
    { x: 0.50, y: 0.50, r: 6, focused: focused, cat: "thought" },
    { x: 0.28, y: 0.32, r: 4, cat: "tech" },
    { x: 0.72, y: 0.34, r: 4, cat: "book" },
    { x: 0.20, y: 0.62, r: 4, cat: "writing" },
    { x: 0.78, y: 0.66, r: 4, cat: "thought" },
    { x: 0.42, y: 0.78, r: 3.5, cat: "tech" },
    { x: 0.62, y: 0.20, r: 3.5, cat: "book" },
    { x: 0.12, y: 0.42, r: 3, cat: "thought" },
    { x: 0.88, y: 0.50, r: 3, cat: "writing" },
    { x: 0.36, y: 0.18, r: 3, cat: "writing" },
    { x: 0.58, y: 0.88, r: 3, cat: "book" },
    { x: 0.86, y: 0.82, r: 3, cat: "tech" },
  ];
  const edges = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
    [1, 7], [1, 9], [2, 6], [2, 8],
    [3, 7], [4, 8], [4, 11], [5, 10],
  ];
  const catColor = (c) =>
    c === "thought" ? "var(--cat-thought)" :
    c === "tech"    ? "var(--cat-tech)" :
    c === "writing" ? "var(--cat-writing)" : "var(--cat-book)";

  // Dot grid
  const dotSpacing = 24;
  const dots = [];
  for (let gx = 0; gx < size; gx += dotSpacing) {
    for (let gy = 0; gy < h; gy += dotSpacing) {
      dots.push([gx, gy]);
    }
  }

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${size} ${h}`} preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
      <rect width={size} height={h} fill="var(--bg)" />
      {dots.map(([gx, gy], i) => (
        <circle key={i} cx={gx} cy={gy} r={0.7} className="bd-graph-dot" />
      ))}
      {edges.map(([a, b], i) => {
        const A = nodes[a], B = nodes[b];
        const isFocused = A.focused || B.focused;
        return (
          <line
            key={i}
            x1={A.x * size} y1={A.y * h}
            x2={B.x * size} y2={B.y * h}
            className={isFocused ? "bd-graph-edge" : "bd-graph-edge-faint"}
          />
        );
      })}
      {nodes.map((n, i) => (
        <g key={i}>
          {n.focused && (
            <circle cx={n.x * size} cy={n.y * h} r={n.r + 5} fill="var(--accent)" fillOpacity={0.18} />
          )}
          <circle
            cx={n.x * size} cy={n.y * h}
            r={n.r}
            fill={n.focused ? "var(--accent)" : catColor(n.cat)}
            fillOpacity={n.focused ? 1 : 0.75}
          />
        </g>
      ))}
      {label && (
        <text x={nodes[0].x * size} y={nodes[0].y * h + nodes[0].r + 12}
          textAnchor="middle" fontSize="9.5" fill="var(--fg)" fillOpacity="0.85">
          {label}
        </text>
      )}
    </svg>
  );
}

// ── ASCII hero (smaller for nested artboards) ───────────────
function BdAsciiHero() {
  const art =
`     ██╗ █████╗  ██████╗ ██████╗ ██████╗ ███████╗██╗██████╗ ██╗ █████╗ ███╗   ██╗
     ██║██╔══██╗██╔════╝██╔═══██╗██╔══██╗██╔════╝██║██╔══██╗██║██╔══██╗████╗  ██║
     ██║███████║██║     ██║   ██║██████╔╝███████╗██║██║  ██║██║███████║██╔██╗ ██║
██   ██║██╔══██║██║     ██║   ██║██╔══██╗╚════██║██║██║  ██║██║██╔══██║██║╚██╗██║
╚█████╔╝██║  ██║╚██████╗╚██████╔╝██████╔╝███████║██║██████╔╝██║██║  ██║██║ ╚████║
 ╚════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝`;
  return <pre className="bd-ascii" style={{ margin: 0 }}>{art}</pre>;
}

// ── Post row for archive list ───────────────────────────────
function BdPostRow({ p, showCat = true, dense = false }) {
  return (
    <a className="bd-rowlink" href="#"
      style={{
        gridTemplateColumns: showCat ? "76px 1fr 60px" : "76px 1fr",
        paddingBlock: dense ? 8 : 10,
      }}>
      <span className="bd-rowlink-date mono">{p.date}</span>
      <span className="bd-rowlink-title bd-truncate" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span className={`bd-cat-dot ${p.category}`} />
        {p.title}
      </span>
      {showCat && <span className="bd-rowlink-meta">{p.label}</span>}
    </a>
  );
}

// ── Render prose body (with wikilinks) ──────────────────────
function BdProse({ post }) {
  return (
    <div className="bd-prose">
      {post.body.map((b, i) => {
        if (b.type === "h2") {
          return <h2 key={i} id={b.id}>{b.text}</h2>;
        }
        // Render [[wikilink]] as accent-styled spans
        const parts = b.text.split(/(\[\[[^\]]+\]\])/g);
        return (
          <p key={i}>
            {parts.map((part, j) => {
              const m = part.match(/^\[\[([^\]]+)\]\]$/);
              if (m) return <a key={j} className="wiki" href="#">{m[1]}</a>;
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

// ── Section header ──────────────────────────────────────────
function BdSectionHead({ overline, title, right }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
      <div>
        {overline && <div className="bd-overline" style={{ marginBottom: 4 }}>{overline}</div>}
        {title && <div className="bd-h2">{title}</div>}
      </div>
      {right}
    </div>
  );
}

// ── Big graph (home/category hero) ──────────────────────────
// Larger network with more nodes and a curated layout. Renders the
// site as a constellation rather than a single-focus mini view.
function BdBigGraph({ width = 760, height = 420, categoryFilter = null, filterChips = true }) {
  // 25 nodes — distribute by category, hand-placed for a pleasing constellation.
  const seedNodes = [
    // thoughts (purple)
    { x: 0.50, y: 0.50, r: 9, cat: "thought", hot: true, title: "스타트업의 시간" },
    { x: 0.30, y: 0.36, r: 6, cat: "thought" },
    { x: 0.70, y: 0.30, r: 5, cat: "thought" },
    { x: 0.18, y: 0.58, r: 5, cat: "thought" },
    { x: 0.58, y: 0.72, r: 6, cat: "thought" },
    { x: 0.78, y: 0.62, r: 4, cat: "thought" },
    { x: 0.42, y: 0.22, r: 4, cat: "thought" },
    { x: 0.86, y: 0.44, r: 4, cat: "thought" },
    // tech (blue)
    { x: 0.62, y: 0.50, r: 6, cat: "tech" },
    { x: 0.84, y: 0.18, r: 5, cat: "tech" },
    { x: 0.40, y: 0.62, r: 4, cat: "tech" },
    { x: 0.92, y: 0.74, r: 4, cat: "tech" },
    { x: 0.26, y: 0.78, r: 4, cat: "tech" },
    { x: 0.72, y: 0.84, r: 3, cat: "tech" },
    // writing (green)
    { x: 0.36, y: 0.74, r: 5, cat: "writing" },
    { x: 0.10, y: 0.30, r: 4, cat: "writing" },
    { x: 0.52, y: 0.16, r: 4, cat: "writing" },
    { x: 0.66, y: 0.92, r: 3, cat: "writing" },
    // books (amber)
    { x: 0.20, y: 0.18, r: 5, cat: "book", title: "실패를 통과하는 일" },
    { x: 0.88, y: 0.32, r: 5, cat: "book" },
    { x: 0.14, y: 0.84, r: 5, cat: "book" },
    { x: 0.46, y: 0.88, r: 4, cat: "book" },
    { x: 0.74, y: 0.74, r: 4, cat: "book" },
    { x: 0.96, y: 0.56, r: 3, cat: "book" },
    // tags (small grey diamonds — drawn as small dots here)
    { x: 0.34, y: 0.46, r: 2.5, cat: "tag" },
    { x: 0.66, y: 0.64, r: 2.5, cat: "tag" },
    { x: 0.50, y: 0.36, r: 2.5, cat: "tag" },
    { x: 0.50, y: 0.62, r: 2.5, cat: "tag" },
  ];

  // Edge list — central node (0) connects widely; cross-category links sprinkled
  const edges = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 18], [0, 24],
    [1, 6], [1, 15], [1, 25], [1, 19],
    [2, 7], [2, 9], [2, 26],
    [3, 12], [3, 15], [3, 20],
    [4, 5], [4, 10], [4, 14], [4, 27],
    [5, 11], [5, 22],
    [6, 16], [6, 24],
    [7, 19], [7, 23],
    [8, 9], [8, 11], [8, 26],
    [10, 14], [10, 27],
    [12, 20], [12, 17],
    [13, 22],
    [15, 25],
    [16, 19],
    [17, 18],
    [18, 21],
    [21, 22],
    [23, 5],
    [3, 25], [4, 26],
  ];

  const filterToActive = (cat) => {
    if (!categoryFilter) return true;
    return cat === categoryFilter || cat === "tag";
  };

  const catColor = (c) =>
    c === "thought" ? "var(--cat-thought)" :
    c === "tech"    ? "var(--cat-tech)" :
    c === "writing" ? "var(--cat-writing)" :
    c === "book"    ? "var(--cat-book)" :
    "var(--fg-faint)";

  // Dot grid
  const dotSpacing = 28;
  const dots = [];
  for (let gx = 0; gx < width; gx += dotSpacing) {
    for (let gy = 0; gy < height; gy += dotSpacing) {
      dots.push([gx, gy]);
    }
  }

  const FILTERS = [
    { key: null, label: "All", color: "var(--fg)" },
    { key: "thought", label: "Thoughts", color: "var(--cat-thought)" },
    { key: "writing", label: "Writing", color: "var(--cat-writing)" },
    { key: "tech",    label: "Tech",    color: "var(--cat-tech)" },
    { key: "book",    label: "Books",   color: "var(--cat-book)" },
  ];

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {filterChips && (
        <div style={{
          position: "absolute", top: 14, left: 14, zIndex: 2,
          display: "flex", gap: 6,
        }}>
          {FILTERS.map(f => {
            const isActive = f.key === categoryFilter || (!f.key && !categoryFilter);
            return (
              <span key={String(f.key)} style={{
                fontSize: 11,
                padding: "3px 9px",
                borderRadius: 999,
                border: "1px solid " + (isActive ? f.color : "var(--border)"),
                color: isActive ? f.color : "var(--fg-mute)",
                background: isActive ? "color-mix(in srgb, " + f.color + " 12%, transparent)" : "color-mix(in srgb, var(--bg) 80%, transparent)",
                backdropFilter: "blur(6px)",
                fontWeight: isActive ? 500 : 400,
                cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 4,
              }}>
                {f.key && <span className={`bd-cat-dot ${f.key}`} />}
                {f.label}
              </span>
            );
          })}
        </div>
      )}

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
        {dots.map(([gx, gy], i) => (
          <circle key={i} cx={gx} cy={gy} r={0.85} className="bd-graph-dot" />
        ))}
        {edges.map(([a, b], i) => {
          const A = seedNodes[a], B = seedNodes[b];
          if (!A || !B) return null;
          const aActive = filterToActive(A.cat);
          const bActive = filterToActive(B.cat);
          const isActive = aActive && bActive;
          return (
            <line
              key={i}
              x1={A.x * width} y1={A.y * height}
              x2={B.x * width} y2={B.y * height}
              className={isActive ? "bd-graph-edge" : "bd-graph-edge-faint"}
            />
          );
        })}
        {seedNodes.map((n, i) => {
          const active = filterToActive(n.cat);
          if (n.cat === "tag") {
            const cx = n.x * width;
            const cy = n.y * height;
            const r = n.r;
            return (
              <polygon
                key={i}
                points={`${cx},${cy - r * 1.3} ${cx + r},${cy} ${cx},${cy + r * 1.3} ${cx - r},${cy}`}
                fill="var(--fg)"
                fillOpacity={active ? 0.35 : 0.1}
              />
            );
          }
          return (
            <g key={i} opacity={active ? 1 : 0.18}>
              {n.hot && (
                <circle cx={n.x * width} cy={n.y * height} r={n.r + 5} fill={catColor(n.cat)} fillOpacity={0.18} />
              )}
              <circle
                cx={n.x * width} cy={n.y * height}
                r={n.r}
                fill={catColor(n.cat)}
                fillOpacity={n.hot ? 1 : 0.78}
              />
              {n.title && active && (
                <text x={n.x * width} y={n.y * height + n.r + 12}
                  textAnchor="middle" fontSize={n.hot ? "11" : "10"}
                  fill="var(--fg)" fillOpacity={n.hot ? 0.9 : 0.55}
                  style={{ fontFamily: "Pretendard Variable, sans-serif" }}>
                  {n.title}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* fit button — lower right */}
      <button style={{
        position: "absolute", bottom: 12, right: 12,
        width: 28, height: 28, borderRadius: 6,
        background: "color-mix(in srgb, var(--bg) 85%, transparent)",
        border: "1px solid var(--border)",
        color: "var(--fg-mute)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(6px)", cursor: "pointer",
      }} title="Fit view">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
        </svg>
      </button>
    </div>
  );
}

// ── Unified category filter pill row (horizontally scrollable) ─
// Used on Home & Topic / About to filter both the graph view and any
// list rendered below. Single source of truth for which category is
// currently being explored.
function BdCategoryFilter({ value, onChange }) {
  const D = window.BLOG_DATA;
  const items = D.filters; // includes "All"
  return (
    <div style={{
      display: "flex", gap: 8,
      overflowX: "auto",
      paddingBottom: 6,
      scrollbarWidth: "none",
    }} className="hide-scrollbar">
      {items.map(f => {
        const active = value === f.key || (value == null && f.key === "all");
        const color =
          f.key === "thought" ? "var(--cat-thought)" :
          f.key === "tech"    ? "var(--cat-tech)" :
          f.key === "writing" ? "var(--cat-writing)" :
          f.key === "book"    ? "var(--cat-book)" :
          "var(--fg)";
        return (
          <button
            key={f.key}
            onClick={() => onChange?.(f.key === "all" ? null : f.key)}
            style={{
              flexShrink: 0,
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 12px",
              fontSize: 12.5,
              fontFamily: "inherit",
              borderRadius: 999,
              cursor: "pointer",
              border: "1px solid " + (active ? color : "var(--border)"),
              color: active ? color : "var(--fg-mute)",
              background: active ? "color-mix(in srgb, " + color + " 10%, transparent)" : "transparent",
              fontWeight: active ? 500 : 400,
              transition: "all 150ms ease",
            }}
          >
            {f.key !== "all" && <span className={`bd-cat-dot ${f.key}`} />}
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

// expose
Object.assign(window, {
  BdLogo, BdHeader, BdFooter, BdMiniGraph, BdBigGraph, BdAsciiHero,
  BdPostRow, BdProse, BdSectionHead, BdCategoryFilter,
});
