/* V4 — Two-Tone Workspace
   The most "Obsidian-like" of the four. Left and right rails sit on a
   deeper neutral background (--rail-bg), main content on --bg, giving
   that classic two-tone editor feel. Left uses folder/chevron rows;
   right has Properties, Outline, Graph, Related, Backlinks stacked. */

function V4Frame({ left, right, children }) {
  return (
    <div className="bd-page" style={{ display: "grid", gridTemplateRows: "auto 1fr auto" }}>
      <div style={{ background: "var(--rail-bg)" }}>
        <BdHeader />
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "248px minmax(0, 1fr) 300px",
        gap: 0,
        height: "100%",
        overflow: "hidden",
      }}>
        <aside className="bd-scroll-y" style={{
          background: "var(--rail-bg)",
          borderRight: "1px solid var(--border)",
          padding: "20px 14px",
        }}>
          {left}
        </aside>
        <main className="bd-scroll-y" style={{ padding: "32px 40px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 680 }}>{children}</div>
        </main>
        <aside className="bd-scroll-y" style={{
          background: "var(--rail-bg)",
          borderLeft: "1px solid var(--border)",
          padding: "20px 16px",
        }}>
          {right}
        </aside>
      </div>
      <div style={{ background: "var(--rail-bg)" }}>
        <BdFooter />
      </div>
    </div>
  );
}

function ChevDown() {
  return (
    <svg className="chev" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
function ChevRight() {
  return (
    <svg className="chev" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

function V4LeftFiles({ active }) {
  const D = window.BLOG_DATA;
  // Build a flat folder tree
  const folders = [
    { key: "thought", label: "Thoughts", open: active === "thought" },
    { key: "writing", label: "Writing", open: false },
    { key: "tech",    label: "Tech",    open: false },
    { key: "book",    label: "Books",   open: false },
  ];
  const samplesPerCat = {
    thought: D.posts.filter(p => p.category === "thought").slice(0, 4),
    writing: D.posts.filter(p => p.category === "writing").slice(0, 3),
    tech:    D.posts.filter(p => p.category === "tech").slice(0, 3),
    book:    D.posts.filter(p => p.category === "book").slice(0, 3),
  };
  return (
    <div>
      {/* search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "var(--bg)", border: "1px solid var(--border-soft)", borderRadius: 6,
        padding: "6px 10px", marginBottom: 14,
        fontSize: 12.5, color: "var(--fg-faint)",
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span>Search notes</span>
        <span className="mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--fg-veryfaint)" }}>⌘K</span>
      </div>

      {/* tabs */}
      <div style={{ display: "flex", gap: 0, fontSize: 11, marginBottom: 12 }} className="mono">
        <a href="#" style={{
          padding: "5px 10px", color: "var(--fg)", borderBottom: "2px solid var(--accent)",
          textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em",
        }}>Files</a>
        <a href="#" style={{
          padding: "5px 10px", color: "var(--fg-faint)", borderBottom: "2px solid transparent",
          textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em",
        }}>Tags</a>
        <a href="#" style={{
          padding: "5px 10px", color: "var(--fg-faint)", borderBottom: "2px solid transparent",
          textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em",
        }}>Bookmarks</a>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div className="bd-folder" style={{ fontWeight: 500 }}>
          <ChevDown /> <span>All notes</span>
          <span className="count">{D.counts.all}</span>
        </div>
      </div>

      {folders.map(f => {
        const open = f.open;
        const isActiveCat = active === f.key;
        return (
          <div key={f.key}>
            <div className={`bd-folder${isActiveCat ? "" : ""}`}>
              {open ? <ChevDown /> : <ChevRight />}
              <span className={`bd-cat-dot ${f.key}`} style={{ width: 7, height: 7 }} />
              <span>{f.label}</span>
              <span className="count">{D.counts[f.key]}</span>
            </div>
            {open && (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {samplesPerCat[f.key].map((p, i) => {
                  const isCurrent = p.title === D.currentPost.title;
                  return (
                    <li key={i}>
                      <a href="#" style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "4px 8px 4px 28px",
                        textDecoration: "none",
                        fontSize: 12.5,
                        color: isCurrent ? "var(--accent)" : "var(--fg-mute)",
                        background: isCurrent ? "var(--accent-soft)" : "transparent",
                        borderRadius: 4,
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
                        </svg>
                        <span className="bd-truncate" style={{ flex: 1, minWidth: 0 }}>{p.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}

      {/* secondary nav */}
      <hr className="bd-rule" style={{ margin: "16px 8px", opacity: 0.5 }} />
      <div className="bd-folder">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 12h10M17 7l-4 3M17 17l-4-3"/></svg>
        <span>Graph view</span>
      </div>
      <div className="bd-folder">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span>About</span>
      </div>
    </div>
  );
}

function V4PropertiesPanel({ post }) {
  return (
    <div style={{ background: "var(--bg)", border: "1px solid var(--border-soft)", borderRadius: 6, padding: "10px 12px", marginBottom: 12 }}>
      <div className="bd-overline" style={{ marginBottom: 8 }}>Properties</div>
      <div style={{ display: "grid", gridTemplateColumns: "78px 1fr", gap: "5px 8px", fontSize: 12 }}>
        <div style={{ color: "var(--fg-faint)" }} className="mono">category</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span className={`bd-cat-dot ${post.category}`} />{post.label}
        </div>
        <div style={{ color: "var(--fg-faint)" }} className="mono">pubDate</div>
        <div className="mono" style={{ fontSize: 11.5 }}>{post.date}</div>
        <div style={{ color: "var(--fg-faint)" }} className="mono">reading</div>
        <div>{post.readingTime} min</div>
        <div style={{ color: "var(--fg-faint)" }} className="mono">tags</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {post.tags.map(t => (
            <span key={t} style={{ fontSize: 11, color: "var(--fg-mute)" }}>#{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function V4Section({ title, children, icon, count, defaultOpen = true }) {
  return (
    <div style={{ marginBottom: 6, background: "var(--bg)", border: "1px solid var(--border-soft)", borderRadius: 6 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 12px",
        borderBottom: defaultOpen ? "1px solid var(--border-soft)" : "none",
        fontSize: 12, fontWeight: 500,
      }}>
        {defaultOpen ? <ChevDown /> : <ChevRight />}
        {icon}
        <span>{title}</span>
        {count != null && <span className="mono" style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--fg-faint)" }}>{count}</span>}
      </div>
      {defaultOpen && <div style={{ padding: "10px 12px" }}>{children}</div>}
    </div>
  );
}

function V4RightPost({ post }) {
  return (
    <div>
      <V4PropertiesPanel post={post} />
      <V4Section
        title="Outline"
        icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}
        count={post.headings.length}
      >
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {post.headings.map((h, i) => (
            <li key={h.id} className={`bd-toc-item${i === 1 ? " active" : ""}`}>{h.text}</li>
          ))}
        </ul>
      </V4Section>

      <V4Section
        title="Local graph"
        icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 12h10M17 7l-4 3M17 17l-4-3"/></svg>}
      >
        <div style={{ margin: "-10px -12px" }}>
          <BdMiniGraph size={272} height={200} focused label={post.title.slice(0, 10) + "…"} />
        </div>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--fg-faint)", marginTop: 6, display: "flex", justifyContent: "space-between" }}>
          <span>5 nodes · 5 edges</span>
          <a href="#" style={{ color: "var(--accent)", textDecoration: "none" }}>expand</a>
        </div>
      </V4Section>

      <V4Section
        title="Related"
        icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
        count={post.related.length}
      >
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {post.related.map((r, i) => (
            <li key={i}>
              <a href="#" style={{
                display: "flex", alignItems: "center", gap: 8,
                textDecoration: "none", color: "var(--fg)", fontSize: 12.5,
              }}>
                <span className={`bd-cat-dot ${r.kind}`} />
                <span>{r.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </V4Section>

      <V4Section
        title="Backlinks"
        icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>}
        count={post.backlinks.length}
      >
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {post.backlinks.map((b, i) => (
            <li key={i}>
              <a href="#" style={{ fontSize: 12.5, color: "var(--fg)", textDecoration: "none" }}>
                {b.title}
                <div style={{ fontSize: 11, color: "var(--fg-faint)", marginTop: 1 }}>"…마치 [[밀러 행성]]에 있는 것 같은 느낌이…"</div>
              </a>
            </li>
          ))}
        </ul>
      </V4Section>
    </div>
  );
}

function V4RightHome() {
  const D = window.BLOG_DATA;
  return (
    <div>
      <V4Section
        title="Global graph"
        icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 12h10M17 7l-4 3M17 17l-4-3"/></svg>}
      >
        <div style={{ margin: "-10px -12px" }}>
          <BdMiniGraph size={272} height={210} focused={false} />
        </div>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--fg-faint)", marginTop: 6, display: "flex", justifyContent: "space-between" }}>
          <span>{D.counts.all} nodes · 47 edges</span>
          <a href="#" style={{ color: "var(--accent)", textDecoration: "none" }}>expand</a>
        </div>
      </V4Section>

      <V4Section
        title="Stats"
        icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
          <div>
            <div className="mono" style={{ fontSize: 18, color: "var(--fg)" }}>{D.counts.all}</div>
            <div style={{ color: "var(--fg-faint)", fontSize: 11 }}>total notes</div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 18, color: "var(--fg)" }}>47</div>
            <div style={{ color: "var(--fg-faint)", fontSize: 11 }}>links</div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 18, color: "var(--fg)" }}>14</div>
            <div style={{ color: "var(--fg-faint)", fontSize: 11 }}>tags</div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 18, color: "var(--accent)" }}>+3</div>
            <div style={{ color: "var(--fg-faint)", fontSize: 11 }}>this week</div>
          </div>
        </div>
      </V4Section>

      <V4Section
        title="Pinned"
        icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>}
        count={3}
      >
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {D.posts.slice(0, 3).map((p, i) => (
            <li key={i}>
              <a href="#" style={{
                display: "flex", alignItems: "center", gap: 8,
                textDecoration: "none", color: "var(--fg)", fontSize: 12.5,
              }}>
                <span className={`bd-cat-dot ${p.category}`} />
                <span className="bd-truncate" style={{ flex: 1, minWidth: 0 }}>{p.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </V4Section>
    </div>
  );
}

function V4Home() {
  const D = window.BLOG_DATA;
  return (
    <V4Frame left={<V4LeftFiles active="all" />} right={<V4RightHome />}>
      {/* File tabs at top, mimicking Obsidian's open-tabs row */}
      <div style={{ display: "flex", gap: 1, marginBottom: 24, fontSize: 12 }}>
        <div style={{
          background: "var(--muted)", padding: "5px 12px", borderRadius: "5px 5px 0 0",
          color: "var(--fg)", display: "inline-flex", alignItems: "center", gap: 6,
          borderTop: "1px solid var(--border)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)",
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--fg-faint)" }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          Home
        </div>
      </div>

      <div style={{ marginBottom: 24 }}><BdAsciiHero /></div>

      <BdSectionHead
        title="Archives"
        overline="last edited · 2026.05.15"
        right={<span className="mono" style={{ fontSize: 11, color: "var(--fg-faint)" }}>{D.counts.all} records</span>}
      />
      {D.posts.slice(0, 10).map((p, i) => <BdPostRow key={i} p={p} />)}
      <div style={{ marginTop: 18, textAlign: "center" }}>
        <button style={{
          background: "transparent", border: "1px solid var(--border)", color: "var(--fg-mute)",
          padding: "6px 16px", borderRadius: 999, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit",
        }}>Load more</button>
      </div>
    </V4Frame>
  );
}

function V4Post() {
  const D = window.BLOG_DATA;
  const p = D.currentPost;
  return (
    <V4Frame left={<V4LeftFiles active="thought" />} right={<V4RightPost post={p} />}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 1, marginBottom: 24, fontSize: 12 }}>
        <div style={{
          background: "var(--muted)", padding: "5px 12px", borderRadius: "5px 5px 0 0",
          color: "var(--fg)", display: "inline-flex", alignItems: "center", gap: 6,
          borderTop: "1px solid var(--border)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)",
        }}>
          <span className={`bd-cat-dot ${p.category}`} />
          <span className="bd-truncate" style={{ maxWidth: 200 }}>{p.title}</span>
          <span style={{ color: "var(--fg-faint)", marginLeft: 4 }}>×</span>
        </div>
      </div>

      <h1 className="bd-h1">{p.title}</h1>
      <p style={{ marginTop: 8, color: "var(--fg-mute)", fontSize: 15, lineHeight: 1.6 }}>{p.description}</p>
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12, fontSize: 12.5, color: "var(--fg-mute)" }}>
        <span className="mono" style={{ color: "var(--fg-faint)" }}>{p.date}</span>
        <span style={{ color: "var(--fg-veryfaint)" }}>·</span>
        <span>{p.readingTime} min read</span>
      </div>
      <hr className="bd-rule" style={{ margin: "20px 0 22px" }} />
      <BdProse post={p} />
      <hr className="bd-rule" style={{ margin: "26px 0 16px" }} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {p.tags.map(t => <span key={t} className="bd-chip">#{t}</span>)}
      </div>
    </V4Frame>
  );
}

Object.assign(window, { V4Home, V4Post });
