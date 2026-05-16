/* V2 — Soft Panels
   3-column with discrete soft-muted cards for each widget.
   Slightly more "structured" feel while still calm. */

function V2Frame({ left, right, children }) {
  return (
    <div className="bd-page" style={{ display: "grid", gridTemplateRows: "auto 1fr auto" }}>
      <BdHeader />
      <div style={{
        display: "grid",
        gridTemplateColumns: "256px minmax(0, 1fr) 292px",
        gap: 24,
        height: "100%",
        overflow: "hidden",
        padding: "24px 32px",
      }}>
        <aside className="bd-scroll-y" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {left}
        </aside>
        <main className="bd-scroll-y" style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 680 }}>{children}</div>
        </main>
        <aside className="bd-scroll-y" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {right}
        </aside>
      </div>
      <BdFooter />
    </div>
  );
}

function V2NavCard({ active }) {
  const D = window.BLOG_DATA;
  return (
    <div className="bd-card">
      <div className="bd-overline" style={{ marginBottom: 12 }}>Library</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 1 }}>
        {D.filters.map(f => {
          const isActive = f.key === active;
          return (
            <li key={f.key}>
              <a href="#" style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "7px 8px",
                borderRadius: 5,
                textDecoration: "none",
                color: isActive ? "var(--accent)" : "var(--fg)",
                fontWeight: isActive ? 600 : 400,
                fontSize: 13.5,
                background: isActive ? "var(--accent-soft)" : "transparent",
              }}>
                {f.key === "all" ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                ) : (
                  <span className={`bd-cat-dot ${f.key}`} style={{ width: 8, height: 8 }} />
                )}
                <span>{f.label}</span>
                <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "var(--fg-faint)" }}>
                  {D.counts[f.key]}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function V2TagsCard() {
  const D = window.BLOG_DATA;
  return (
    <div className="bd-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <div className="bd-overline">Tags</div>
        <a href="#" style={{ fontSize: 11, color: "var(--fg-faint)", textDecoration: "none" }} className="mono">view all →</a>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {D.tags.map(t => (
          <span key={t.name} className="bd-chip" style={{ fontSize: 11.5, padding: "3px 9px" }}>
            #{t.name}<span className="count">{t.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function V2GraphCard({ focused = false, label }) {
  return (
    <div className="bd-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 14px", borderBottom: "1px solid var(--border-soft)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--fg-mute)" }}>
            <circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="19" r="2"/>
            <path d="M7 12h10M17 7l-4 3M17 17l-4-3"/>
          </svg>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>Graph view</span>
        </div>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--fg-faint)", cursor: "pointer" }}>
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
        </svg>
      </div>
      <div style={{ background: "var(--bg)" }}>
        <BdMiniGraph size={264} height={210} focused={focused} label={label} />
      </div>
    </div>
  );
}

function V2OutlineCard({ post }) {
  return (
    <div className="bd-card">
      <div className="bd-overline" style={{ marginBottom: 10 }}>Outline</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {post.headings.map((h, i) => (
          <li key={h.id} className={`bd-toc-item${i === 1 ? " active" : ""}`}>{h.text}</li>
        ))}
      </ul>
    </div>
  );
}

function V2RelatedCard({ post }) {
  return (
    <div className="bd-card">
      <div className="bd-overline" style={{ marginBottom: 10 }}>Related</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {post.related.map((r, i) => (
          <li key={i}>
            <a href="#" style={{
              display: "flex", alignItems: "center", gap: 8,
              textDecoration: "none", color: "var(--fg)",
              fontSize: 13,
            }}>
              <span className={`bd-cat-dot ${r.kind}`} />
              <span>{r.title}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: "auto", color: "var(--fg-veryfaint)" }}>
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </a>
          </li>
        ))}
      </ul>
      <div style={{ borderTop: "1px dashed var(--border)", marginTop: 14, paddingTop: 12 }}>
        <div className="bd-overline" style={{ marginBottom: 8 }}>Backlinks · {post.backlinks.length}</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {post.backlinks.map((b, i) => (
            <li key={i}>
              <a href="#" style={{ fontSize: 12.5, color: "var(--fg-mute)", textDecoration: "none" }}>↩ {b.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function V2NowReading() {
  return (
    <div className="bd-card">
      <div className="bd-overline" style={{ marginBottom: 12 }}>Now reading</div>
      <div style={{ display: "flex", gap: 12 }}>
        <div className="bd-book" style={{ width: 56, flex: "none" }}>실패를 통과하는 일</div>
        <div style={{ fontSize: 12, lineHeight: 1.55 }}>
          <div style={{ fontWeight: 500 }}>실패를 통과하는 일</div>
          <div style={{ color: "var(--fg-faint)", marginTop: 2 }}>Lee</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <div style={{ flex: 1, height: 3, background: "var(--muted)", borderRadius: 999 }}>
              <div style={{ width: "62%", height: "100%", background: "var(--accent)", borderRadius: 999 }} />
            </div>
            <span className="mono" style={{ fontSize: 10, color: "var(--fg-faint)" }}>62%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function V2Home() {
  const D = window.BLOG_DATA;
  return (
    <V2Frame
      left={<><V2NavCard active="all" /><V2TagsCard /></>}
      right={<><V2GraphCard /><V2NowReading /></>}
    >
      <div style={{ marginBottom: 28 }}><BdAsciiHero /></div>
      <BdSectionHead
        overline="Archives"
        title="모든 글"
        right={<span className="mono" style={{ fontSize: 11, color: "var(--fg-faint)" }}>{D.counts.all} records</span>}
      />
      {D.posts.slice(0, 10).map((p, i) => <BdPostRow key={i} p={p} />)}
      <div style={{ marginTop: 18, textAlign: "center" }}>
        <button style={{
          background: "transparent", border: "1px solid var(--border)", color: "var(--fg-mute)",
          padding: "6px 16px", borderRadius: 999, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit",
        }}>Load more</button>
      </div>
    </V2Frame>
  );
}

function V2Post() {
  const D = window.BLOG_DATA;
  const p = D.currentPost;
  return (
    <V2Frame
      left={<><V2NavCard active="thought" /><V2TagsCard /></>}
      right={<><V2OutlineCard post={p} /><V2GraphCard focused label={p.title.slice(0, 12) + "…"} /><V2RelatedCard post={p} /></>}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18, fontSize: 12, color: "var(--fg-faint)" }}>
        <a href="#" style={{ color: "var(--fg-mute)", textDecoration: "none" }}>← Thoughts</a>
      </div>
      <h1 className="bd-h1">{p.title}</h1>
      <p style={{ marginTop: 8, color: "var(--fg-mute)", fontSize: 15, lineHeight: 1.6 }}>{p.description}</p>
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12, fontSize: 12.5, color: "var(--fg-mute)" }}>
        <span className="mono" style={{ color: "var(--fg-faint)" }}>{p.date}</span>
        <span style={{ color: "var(--fg-veryfaint)" }}>·</span>
        <span>{p.readingTime} min read</span>
        <span style={{ color: "var(--fg-veryfaint)" }}>·</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span className={`bd-cat-dot ${p.category}`} />{p.label}
        </span>
      </div>
      <hr className="bd-rule" style={{ margin: "20px 0 22px" }} />
      <BdProse post={p} />
      <hr className="bd-rule" style={{ margin: "26px 0 16px" }} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {p.tags.map(t => (
          <span key={t} className="bd-chip">#{t}</span>
        ))}
      </div>
    </V2Frame>
  );
}

Object.assign(window, { V2Home, V2Post });
