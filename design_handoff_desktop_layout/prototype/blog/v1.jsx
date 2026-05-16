/* V1 — Quiet Rails (refined)
   Two distinct layouts:
   ─ Discovery mode (Home, Category index): graph is HERO in main content.
     Right rail carries discovery widgets (Now reading, This week, Stats).
   ─ Reading mode (Post detail): focused 3-col with mini graph + TOC + related.
   Both share the same left rail (category nav) and chrome. */

function V1Frame({ left, right, children, mode = "discovery" }) {
  return (
    <div className="bd-page" style={{ display: "grid", gridTemplateRows: "auto 1fr auto" }}>
      <BdHeader />
      <div style={{
        display: "grid",
        gridTemplateColumns: mode === "reading"
          ? "232px 1px minmax(0, 1fr) 1px 268px"
          : "232px 1px minmax(0, 1fr) 1px 260px",
        height: "100%",
        overflow: "hidden",
      }}>
        <aside className="bd-scroll-y" style={{ padding: "28px 24px 28px 28px" }}>
          {left}
        </aside>
        <div style={{ background: "var(--border)" }} />
        <main className="bd-scroll-y" style={{
          padding: mode === "reading" ? "32px 40px" : "32px 28px",
          display: "flex",
          justifyContent: "center",
        }}>
          <div style={{
            width: "100%",
            maxWidth: mode === "reading" ? 680 : "none",
          }}>{children}</div>
        </main>
        <div style={{ background: "var(--border)" }} />
        <aside className="bd-scroll-y" style={{ padding: "28px 24px 28px 24px" }}>
          {right}
        </aside>
      </div>
      <BdFooter />
    </div>
  );
}

// ── Left rail (shared across modes) ─────────────────────────
// Acts as the sole navigation surface — header carries only utilities.
// Built to scale into a hierarchical structure (sub-topics, year folders, …).
function V1LeftNav({ active = "home", expandedKey = null, activeTopic = null }) {
  const D = window.BLOG_DATA;
  // expand the active branch by default
  const expanded = expandedKey ?? (active === "home" || active === "about" ? null : active);
  return (
    <div>
      {/* Site pages — Home + About sit together at the top */}
      <a href="#" style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "6px 4px",
        textDecoration: "none",
        color: active === "home" ? "var(--accent)" : "var(--fg)",
        fontWeight: active === "home" ? 600 : 500,
        fontSize: 14,
        borderRadius: 4,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
        <span>Home</span>
      </a>
      <a href="#" style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "6px 4px",
        textDecoration: "none",
        color: active === "about" ? "var(--accent)" : "var(--fg)",
        fontWeight: active === "about" ? 600 : 500,
        fontSize: 14,
        borderRadius: 4,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 21a8 8 0 0 1 16 0"/>
        </svg>
        <span>About</span>
      </a>

      <hr className="bd-rule" style={{ margin: "10px 0 8px" }} />

      {/* Category tree — chevrons indicate expandability. No counts (keep clean). */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 1 }}>
        {D.filters.filter(f => f.key !== "all").map(f => {
          const isActive = f.key === active;
          const isOpen = f.key === expanded;
          const subs = D.hierarchy[f.key] ?? [];
          return (
            <li key={f.key}>
              <a href="#" style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 4px",
                textDecoration: "none",
                color: isActive ? "var(--accent)" : "var(--fg)",
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                borderRadius: 4,
              }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ color: "var(--fg-faint)", flexShrink: 0 }}>
                  {isOpen
                    ? <path d="m6 9 6 6 6-6"/>
                    : <path d="m9 18 6-6-6-6"/>}
                </svg>
                <span className={`bd-cat-dot ${f.key}`} />
                <span>{f.label}</span>
              </a>
              {isOpen && subs.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0, margin: "1px 0 4px 0", display: "flex", flexDirection: "column", gap: 0 }}>
                  {subs.map(s => {
                    const subActive = activeTopic === s.key;
                    return (
                      <li key={s.key}>
                        <a href="#" style={{
                          display: "flex", alignItems: "center", gap: 6,
                          textDecoration: "none",
                          color: subActive ? "var(--accent)" : "var(--fg-mute)",
                          fontWeight: subActive ? 500 : 400,
                          fontSize: 12.5,
                          padding: "3px 4px 3px 26px",
                          position: "relative",
                          borderRadius: 3,
                        }}>
                          <span style={{
                            position: "absolute", left: 17, top: 0, bottom: 0,
                            width: 1, background: subActive ? "var(--accent)" : "var(--border)",
                          }} />
                          <span>{s.label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <div className="bd-overline" style={{ marginTop: 28, marginBottom: 10 }}>Pinned</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9 }}>
        {window.BLOG_DATA.posts.slice(0, 4).map((p, i) => (
          <li key={i}>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "var(--fg)", fontSize: 12.5, lineHeight: 1.4 }}>
              <span className={`bd-cat-dot ${p.category}`} style={{ flexShrink: 0 }} />
              <span className="bd-truncate" style={{ flex: 1, minWidth: 0 }}>{p.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Right rail — DISCOVERY mode (Home, Category) ───────────
function V1RightDiscovery({ scope = "all" }) {
  const D = window.BLOG_DATA;
  const scopedActivity = scope === "all"
    ? D.posts.slice(0, 4)
    : D.posts.filter(p => p.category === scope).slice(0, 4);

  return (
    <div>
      <div className="bd-overline" style={{ marginBottom: 12 }}>Now reading</div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div className="bd-book" style={{ width: 54, flex: "none" }}>실패를 통과하는 일</div>
        <div style={{ fontSize: 12.5, lineHeight: 1.55, flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, color: "var(--fg)" }}>실패를 통과하는 일</div>
          <div style={{ color: "var(--fg-faint)", fontSize: 11.5 }}>Lee</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <div style={{ flex: 1, height: 2, background: "var(--muted)", borderRadius: 999 }}>
              <div style={{ width: "62%", height: "100%", background: "var(--accent)", borderRadius: 999 }} />
            </div>
            <span className="mono" style={{ fontSize: 10, color: "var(--fg-faint)" }}>62%</span>
          </div>
        </div>
      </div>

      <div className="bd-overline" style={{ marginTop: 28, marginBottom: 12 }}>This week</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {scopedActivity.map((p, i) => (
          <li key={i}>
            <a href="#" style={{ display: "block", textDecoration: "none" }}>
              <span className="mono" style={{ color: "var(--fg-veryfaint)", fontSize: 10.5, display: "block" }}>{p.date}</span>
              <span style={{ color: "var(--fg)", fontSize: 12.5, lineHeight: 1.45 }}>{p.title}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="bd-overline" style={{ marginTop: 28, marginBottom: 10 }}>Stats</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px" }}>
        <div>
          <div className="mono" style={{ fontSize: 22, color: "var(--fg)", lineHeight: 1 }}>{D.counts.all}</div>
          <div style={{ color: "var(--fg-faint)", fontSize: 11, marginTop: 4 }}>notes</div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: 22, color: "var(--fg)", lineHeight: 1 }}>47</div>
          <div style={{ color: "var(--fg-faint)", fontSize: 11, marginTop: 4 }}>links</div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: 22, color: "var(--fg)", lineHeight: 1 }}>{D.tags.length}</div>
          <div style={{ color: "var(--fg-faint)", fontSize: 11, marginTop: 4 }}>tags</div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: 22, color: "var(--accent)", lineHeight: 1 }}>+3</div>
          <div style={{ color: "var(--fg-faint)", fontSize: 11, marginTop: 4 }}>this week</div>
        </div>
      </div>

      <div className="bd-overline" style={{ marginTop: 30, marginBottom: 8 }}>Footnotes</div>
      <div style={{ fontSize: 11.5, color: "var(--fg-faint)", lineHeight: 1.6 }} className="mono">
        Asia/Seoul · ko-KR<br/>
        Astro + Obsidian
      </div>
    </div>
  );
}

// ── Right rail — CATEGORY mode (Category index, Topic) ─────
// Includes a category-scoped mini graph so the visual context survives
// the move from Home's graph hero.
function V1RightCategory({ catKey }) {
  const D = window.BLOG_DATA;
  const meta = D.filters.find(f => f.key === catKey);
  const scoped = D.posts.filter(p => p.category === catKey).slice(0, 4);
  return (
    <div>
      <div className="bd-overline" style={{ marginBottom: 10 }}>{meta.label} graph</div>
      <div style={{ marginLeft: -24, marginRight: -24, marginBottom: 6 }}>
        <BdMiniGraph size={268} height={210} focused={false} />
      </div>
      <div className="mono" style={{ fontSize: 11, color: "var(--fg-faint)", display: "flex", justifyContent: "space-between" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span className={`bd-cat-dot ${catKey}`} /> {scoped.length === 0 ? 0 : D.posts.filter(p => p.category === catKey).length} notes
        </span>
        <a href="#" style={{ color: "var(--accent)", textDecoration: "none" }}>expand →</a>
      </div>

      <div className="bd-overline" style={{ marginTop: 26, marginBottom: 12 }}>This week</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {scoped.map((p, i) => (
          <li key={i}>
            <a href="#" style={{ display: "block", textDecoration: "none" }}>
              <span className="mono" style={{ color: "var(--fg-veryfaint)", fontSize: 10.5, display: "block" }}>{p.date}</span>
              <span style={{ color: "var(--fg)", fontSize: 12.5, lineHeight: 1.45 }}>{p.title}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="bd-overline" style={{ marginTop: 26, marginBottom: 10 }}>Other categories</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {D.filters.filter(f => f.key !== "all" && f.key !== catKey).map(f => (
          <li key={f.key}>
            <a href="#" style={{
              display: "flex", alignItems: "center", gap: 8,
              textDecoration: "none", color: "var(--fg-mute)", fontSize: 12.5,
            }}>
              <span className={`bd-cat-dot ${f.key}`} />
              <span>{f.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Right rail — READING mode (Post detail) ────────────────
function V1RightReading() {
  const D = window.BLOG_DATA;
  const p = D.currentPost;
  return (
    <div>
      <div className="bd-overline" style={{ marginBottom: 10 }}>On this page</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {p.headings.map((h, i) => (
          <li key={h.id} className={`bd-toc-item${i === 1 ? " active" : ""}`}>
            {h.text}
          </li>
        ))}
      </ul>

      <div className="bd-overline" style={{ marginTop: 26, marginBottom: 10 }}>Local graph</div>
      <div style={{ marginLeft: -24, marginRight: -24, marginBottom: 6 }}>
        <BdMiniGraph size={268} height={200} focused label={p.title.length > 14 ? p.title.slice(0, 14) + "…" : p.title} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--fg-faint)", marginTop: 4 }} className="mono">
        <span>5 connections</span>
        <a href="#" style={{ color: "var(--accent)", textDecoration: "none" }}>expand →</a>
      </div>

      <div className="bd-overline" style={{ marginTop: 26, marginBottom: 10 }}>Related</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {p.related.map((r, i) => (
          <li key={i}>
            <a href="#" style={{ textDecoration: "none", color: "var(--fg)", display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <span className={`bd-cat-dot ${r.kind}`} />
              <span style={{ borderBottom: "1px dashed var(--border)", paddingBottom: 1 }}>{r.title}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="bd-overline" style={{ marginTop: 26, marginBottom: 10 }}>Backlinks</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5 }}>
        {p.backlinks.map((b, i) => (
          <li key={i} style={{ color: "var(--fg-mute)" }}>
            <a href="#" style={{ color: "var(--fg)", textDecoration: "none" }}>← {b.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Graph hero (used by Home) ──────────────────────────────
function V1GraphHero({ categoryFilter = null }) {
  return (
    <div style={{
      border: "1px solid var(--border)",
      borderRadius: 6,
      overflow: "hidden",
      position: "relative",
      background: "var(--bg)",
    }}>
      <BdBigGraph width={780} height={420} categoryFilter={categoryFilter} filterChips={false} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// V1 Home — discovery mode
// Unified category filter controls BOTH the graph and the archives.
// Single state, two views — the badge row is the only filter UI.
// ────────────────────────────────────────────────────────────
function V1Home() {
  const D = window.BLOG_DATA;
  const [filter, setFilter] = React.useState(null);

  const visiblePosts = filter
    ? D.posts.filter(p => p.category === filter)
    : D.posts;
  const visibleCount = filter ? visiblePosts.length : D.counts.all;
  const filterMeta = filter ? D.filters.find(f => f.key === filter) : null;

  return (
    <V1Frame left={<V1LeftNav active="home" />} right={<V1RightDiscovery scope={filter ?? "all"} />} mode="discovery">
      <div style={{ marginBottom: 22 }}>
        <BdAsciiHero />
      </div>

      {/* Unified filter — single source of truth for graph + archives */}
      <BdCategoryFilter value={filter} onChange={setFilter} />

      <div style={{ marginTop: 14 }}>
        <V1GraphHero categoryFilter={filter} />
      </div>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 14, marginBottom: 28, color: "var(--fg-mute)", fontSize: 13 }}>
        <span>
          {filter
            ? <>{filterMeta.label} 카테고리에 <strong style={{ color: "var(--fg)" }}>{visibleCount}</strong>개의 노트가 있어요.</>
            : <>지금까지 쓴 <strong style={{ color: "var(--fg)" }}>{D.counts.all}</strong>개의 노트가 <strong style={{ color: "var(--accent)" }}>47개</strong>의 링크로 이어져 있어요.</>
          }
        </span>
        <span className="mono" style={{ fontSize: 11, color: "var(--fg-faint)" }}>drag · zoom · hover</span>
      </div>

      <BdSectionHead
        overline="Latest"
        title="Archives"
        right={<span className="mono" style={{ fontSize: 11, color: "var(--fg-faint)" }}>{visibleCount} records</span>}
      />
      {visiblePosts.slice(0, 10).map((p, i) => <BdPostRow key={i} p={p} />)}
      <div style={{ marginTop: 18, textAlign: "center" }}>
        <button style={{
          background: "transparent", border: "1px solid var(--border)", color: "var(--fg-mute)",
          padding: "6px 16px", borderRadius: 999, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit",
        }}>Load more</button>
      </div>
    </V1Frame>
  );
}

// ────────────────────────────────────────────────────────────
// V1 Category — list-focused index page (no graph, no hard-coded title)
// Header from D.filters[catKey] — adding a new category just needs a row
// in data.filters and the page automatically renders correctly.
// ────────────────────────────────────────────────────────────
function V1Category({ catKey = "thought" }) {
  const D = window.BLOG_DATA;
  const meta = D.filters.find(f => f.key === catKey);
  const subs = D.hierarchy[catKey] ?? [];
  const [topic, setTopic] = React.useState(null);

  const scopedPosts = D.posts.filter(p => p.category === catKey);

  return (
    <V1Frame
      left={<V1LeftNav active={catKey} expandedKey={catKey} activeTopic={topic} />}
      right={<V1RightCategory catKey={catKey} />}
      mode="discovery"
    >
      {/* Category header — typographic, fully data-driven */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span className={`bd-cat-dot ${catKey}`} style={{ width: 9, height: 9 }} />
        <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg-faint)" }}>Category</span>
      </div>
      <h1 className="bd-h1" style={{ fontSize: 34 }}>{meta.label}</h1>
      {meta.desc && <p style={{ marginTop: 4, marginBottom: 24, color: "var(--fg-mute)", fontSize: 15 }}>{meta.desc}</p>}

      {/* Subtopic filter — only if hierarchy exists for this category */}
      {subs.length > 0 && (
        <div style={{
          display: "flex", gap: 8, overflowX: "auto",
          paddingBottom: 6, marginBottom: 18,
          scrollbarWidth: "none",
          borderBottom: "1px solid var(--border)",
        }} className="hide-scrollbar">
          <button
            onClick={() => setTopic(null)}
            style={chipStyle(topic == null)}
          >
            모두 보기
          </button>
          {subs.map(s => (
            <button
              key={s.key}
              onClick={() => setTopic(s.key)}
              style={chipStyle(topic === s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Generic list header — no per-category copy needed */}
      <div style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        marginTop: subs.length > 0 ? 4 : 6, marginBottom: 4,
      }}>
        <div className="bd-overline">
          {topic ? `${subs.find(s => s.key === topic)?.label} · 글 목록` : "글 목록"}
        </div>
        <span className="mono" style={{ fontSize: 11, color: "var(--fg-faint)" }}>{scopedPosts.length} notes</span>
      </div>

      {scopedPosts.map((p, i) => (
        <a key={i} className="bd-rowlink" href="#" style={{ gridTemplateColumns: "76px 1fr" }}>
          <span className="bd-rowlink-date mono">{p.date}</span>
          <span className="bd-rowlink-title bd-truncate">{p.title}</span>
        </a>
      ))}
      {scopedPosts.length === 0 && (
        <p style={{ color: "var(--fg-faint)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>
          아직 글이 없습니다.
        </p>
      )}
    </V1Frame>
  );
}

function chipStyle(active) {
  return {
    flexShrink: 0,
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "5px 12px",
    fontSize: 12.5,
    fontFamily: "inherit",
    borderRadius: 999,
    cursor: "pointer",
    border: "1px solid " + (active ? "var(--accent)" : "var(--border)"),
    color: active ? "var(--accent)" : "var(--fg-mute)",
    background: active ? "var(--accent-soft)" : "transparent",
    fontWeight: active ? 500 : 400,
    transition: "all 150ms ease",
  };
}

// ────────────────────────────────────────────────────────────
// V1 Topic — sub-category page (e.g. Thoughts › Work · 일)
// Reached by clicking a sub-topic in the sidebar tree.
// Same layout as Category, just one level deeper with breadcrumb.
// ────────────────────────────────────────────────────────────
function V1Topic({ catKey = "thought", topicKey = "work" }) {
  const D = window.BLOG_DATA;
  const meta = D.filters.find(f => f.key === catKey);
  const topicMeta = (D.hierarchy[catKey] ?? []).find(s => s.key === topicKey);
  // For mock: just slice 4 posts from this category
  const topicPosts = D.posts.filter(p => p.category === catKey).slice(0, 4);

  return (
    <V1Frame
      left={<V1LeftNav active={catKey} expandedKey={catKey} activeTopic={topicKey} />}
      right={<V1RightCategory catKey={catKey} />}
      mode="discovery"
    >
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--fg-mute)", marginBottom: 12 }}>
        <a href="#" style={{ color: "var(--fg-mute)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span className={`bd-cat-dot ${catKey}`} />{meta.label}
        </a>
        <span style={{ color: "var(--fg-veryfaint)" }}>›</span>
        <span style={{ color: "var(--fg)" }}>{topicMeta?.label}</span>
      </div>

      <h1 className="bd-h1" style={{ fontSize: 28 }}>{topicMeta?.label}</h1>
      <p style={{ marginTop: 4, marginBottom: 26, color: "var(--fg-mute)", fontSize: 14 }}>
        <a href="#" style={{ color: "var(--fg-mute)" }}>{meta.label}</a> 안의 한 주제. {topicPosts.length}개의 노트.
      </p>

      {topicPosts.map((p, i) => (
        <a key={i} className="bd-rowlink" href="#" style={{ gridTemplateColumns: "76px 1fr" }}>
          <span className="bd-rowlink-date mono">{p.date}</span>
          <span className="bd-rowlink-title bd-truncate">{p.title}</span>
        </a>
      ))}
    </V1Frame>
  );
}

// ────────────────────────────────────────────────────────────
// V1 About — uses the same shell as Home; no graph hero
// ────────────────────────────────────────────────────────────
function V1About() {
  return (
    <V1Frame left={<V1LeftNav active="about" />} right={<V1RightDiscovery scope="all" />} mode="discovery">
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 999,
          background: "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 50%, var(--fg)))",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--bg)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.05em",
        }}>J</div>
        <div>
          <h1 className="bd-h1" style={{ fontSize: 28 }}>Jacob Lee</h1>
          <p style={{ marginTop: 4, color: "var(--fg-mute)", fontSize: 14 }}>
            글쓰기를 좋아하는 어느 개발자의 기록 저장소.
          </p>
        </div>
      </div>

      <div className="bd-overline" style={{ marginBottom: 10 }}>About</div>
      <div className="bd-prose" style={{ fontSize: 15 }}>
        <p>
          반도체 대기업에서 7년, 지금은 스타트업에서 매니저 1년차. 사이드로 소설을 쓰고, 시간이 남으면 코드를 짜요.
          이 곳은 그 사이에서 생긴 짧은 글들을 모으는 공간이에요. 노트 사이의 연결을 좋아해서{" "}
          <a href="#" className="wiki">Obsidian</a>으로 글을 관리하고,{" "}
          <a href="#" className="wiki">Astro</a>로 빌드하고 있어요.
        </p>
        <p>
          기록은 휘발성이 강해요. 그래서 자주 돌아와서 다시 읽고, 새로 쓰고, 잇고 있어요.
          이 사이트의 그래프 뷰는 그 흔적이에요.
        </p>
      </div>

      <div className="bd-overline" style={{ marginTop: 32, marginBottom: 12 }}>What I'm doing now</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
        <li style={{ display: "flex", gap: 12 }}>
          <span style={{ flex: "none", width: 18, color: "var(--cat-tech)" }}>—</span>
          <span>스타트업에서 프로덕트 매니징 1년차로 적응 중</span>
        </li>
        <li style={{ display: "flex", gap: 12 }}>
          <span style={{ flex: "none", width: 18, color: "var(--cat-writing)" }}>—</span>
          <span>장편 소설 첫 챕터 다듬는 중</span>
        </li>
        <li style={{ display: "flex", gap: 12 }}>
          <span style={{ flex: "none", width: 18, color: "var(--cat-book)" }}>—</span>
          <span>《실패를 통과하는 일》 읽는 중 (62%)</span>
        </li>
      </ul>

      <div className="bd-overline" style={{ marginTop: 32, marginBottom: 12 }}>Elsewhere</div>
      <div style={{ display: "flex", gap: 18, fontSize: 13.5 }}>
        <a href="#" style={{ color: "var(--fg)", textDecoration: "none", borderBottom: "1px dashed var(--border)" }}>GitHub</a>
        <a href="#" style={{ color: "var(--fg)", textDecoration: "none", borderBottom: "1px dashed var(--border)" }}>LinkedIn</a>
        <a href="#" style={{ color: "var(--fg)", textDecoration: "none", borderBottom: "1px dashed var(--border)" }}>Email</a>
        <a href="#" style={{ color: "var(--fg)", textDecoration: "none", borderBottom: "1px dashed var(--border)" }}>RSS</a>
      </div>
    </V1Frame>
  );
}

// ────────────────────────────────────────────────────────────
// V1 Post — reading mode
// ────────────────────────────────────────────────────────────
function V1Post() {
  const D = window.BLOG_DATA;
  const p = D.currentPost;
  const parentLabel = D.filters.find(f => f.key === p.category)?.label ?? "Back";
  return (
    <V1Frame left={<V1LeftNav active={p.category} expandedKey={p.category} />} right={<V1RightReading />} mode="reading">
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18, fontSize: 12, color: "var(--fg-faint)" }}>
        <a href="#" style={{ color: "var(--fg-mute)", textDecoration: "none" }}>← {parentLabel}</a>
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
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, color: "var(--fg-faint)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Share
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
    </V1Frame>
  );
}

Object.assign(window, { V1Home, V1Category, V1Topic, V1About, V1Post });
