/* V3 — Editorial Marginalia
   Category nav remains on the left, but the right column is more
   editorial: TOC items appear as marginalia next to the headings
   they reference, with graph + related sitting below. Reads more
   like a magazine than a workspace. */

function V3Frame({ left, right, children, mainPadding }) {
  return (
    <div className="bd-page" style={{ display: "grid", gridTemplateRows: "auto 1fr auto" }}>
      <BdHeader />
      <div style={{
        display: "grid",
        gridTemplateColumns: "228px minmax(0, 1fr) 300px",
        gap: 0,
        height: "100%",
        overflow: "hidden",
      }}>
        <aside className="bd-scroll-y" style={{ padding: "32px 24px 32px 32px", borderRight: "1px solid var(--border)" }}>
          {left}
        </aside>
        <main className="bd-scroll-y" style={{ padding: mainPadding || "40px 32px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 680 }}>{children}</div>
        </main>
        <aside className="bd-scroll-y" style={{ padding: "32px 32px 32px 24px", borderLeft: "1px solid var(--border)" }}>
          {right}
        </aside>
      </div>
      <BdFooter />
    </div>
  );
}

function V3LeftNav({ active }) {
  const D = window.BLOG_DATA;
  return (
    <div>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10.5,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--fg-veryfaint)",
        marginBottom: 18,
      }}>jacob's blog → index</div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {D.filters.map(f => {
          const isActive = f.key === active;
          return (
            <li key={f.key}>
              <a href="#" style={{
                display: "block",
                textDecoration: "none",
                color: isActive ? "var(--fg)" : "var(--fg-mute)",
                fontWeight: isActive ? 600 : 400,
                fontSize: 18,
                letterSpacing: "-0.01em",
                position: "relative",
                paddingLeft: isActive ? 14 : 0,
                lineHeight: 1.2,
                transition: "padding 200ms ease",
              }}>
                {isActive && (
                  <span style={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                    width: 6, height: 6, background: "var(--accent)", borderRadius: 999,
                  }} />
                )}
                {f.label}
                <span className="mono" style={{
                  marginLeft: 6, fontSize: 10, color: "var(--fg-veryfaint)",
                  verticalAlign: "super",
                }}>{D.counts[f.key]}</span>
              </a>
            </li>
          );
        })}
      </ul>

      <hr className="bd-rule" style={{ margin: "28px 0" }} />

      <div className="bd-overline" style={{ marginBottom: 12 }}>Pinned</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9, fontSize: 12.5 }}>
        {D.posts.slice(0, 3).map((p, i) => (
          <li key={i}>
            <a href="#" style={{ color: "var(--fg)", textDecoration: "none" }}>
              <span style={{
                display: "inline-block", width: 4, height: 4, borderRadius: 999,
                background: "var(--accent)", marginRight: 6, verticalAlign: "middle",
              }} />
              {p.title}
            </a>
          </li>
        ))}
      </ul>

      <div className="bd-overline" style={{ marginTop: 28, marginBottom: 12 }}>Tags</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 8px", fontSize: 12.5 }}>
        {window.BLOG_DATA.tags.slice(0, 6).map(t => (
          <a key={t.name} href="#" style={{
            textDecoration: "none", color: "var(--fg-mute)",
          }}>
            <span style={{ color: "var(--fg-veryfaint)" }}>#</span>{t.name}
          </a>
        ))}
      </div>
    </div>
  );
}

function V3RightHome() {
  return (
    <div>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase",
        color: "var(--fg-veryfaint)", marginBottom: 16,
      }}>The Network</div>

      <div style={{ marginLeft: -32, marginRight: -32, marginBottom: 16 }}>
        <BdMiniGraph size={300} height={240} focused={false} />
      </div>

      <p style={{ fontSize: 13.5, lineHeight: 1.7, margin: 0, color: "var(--fg)" }}>
        지금까지 쓴 <strong>25개</strong>의 글이
        <span style={{ color: "var(--accent)" }}> 47개의 링크</span>로 이어져 있어요.
        가장 많이 인용된 노트는{" "}
        <a href="#" style={{ color: "var(--fg)", borderBottom: "1px dashed var(--border)", textDecoration: "none" }}>
          개발자의 글쓰기
        </a>
        입니다.
      </p>

      <hr className="bd-rule" style={{ margin: "26px 0" }} />

      <div className="bd-overline" style={{ marginBottom: 12 }}>This week</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {window.BLOG_DATA.posts.slice(0, 3).map((p, i) => (
          <li key={i}>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--fg-veryfaint)" }}>{p.date}</div>
            <a href="#" style={{ color: "var(--fg)", textDecoration: "none", fontSize: 13.5, lineHeight: 1.45, display: "block", marginTop: 2 }}>
              {p.title}
            </a>
          </li>
        ))}
      </ul>

      <hr className="bd-rule" style={{ margin: "26px 0" }} />

      <div className="bd-overline" style={{ marginBottom: 12 }}>Now reading</div>
      <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--fg)" }}>
        <span style={{ fontWeight: 500 }}>실패를 통과하는 일</span>
        <span style={{ color: "var(--fg-faint)" }}> · Lee</span>
      </div>
    </div>
  );
}

// Right sidebar for post: graph + related + backlinks (no TOC — TOC is in body)
function V3RightPost({ post }) {
  return (
    <div>
      <div className="bd-overline" style={{ marginBottom: 12 }}>This note</div>
      <div style={{ marginLeft: -32, marginRight: -32 }}>
        <BdMiniGraph size={300} height={220} focused label={post.title.slice(0, 12) + "…"} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--fg-faint)", marginTop: 6 }} className="mono">
        <span>5 connections</span>
        <a href="#" style={{ color: "var(--accent)", textDecoration: "none" }}>expand →</a>
      </div>

      <hr className="bd-rule" style={{ margin: "24px 0" }} />

      <div className="bd-overline" style={{ marginBottom: 12 }}>Mentioned</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {post.related.map((r, i) => (
          <li key={i}>
            <a href="#" style={{ textDecoration: "none", color: "var(--fg)", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span className={`bd-cat-dot ${r.kind}`} style={{ marginTop: 6 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, lineHeight: 1.4 }}>{r.title}</div>
                <div style={{ fontSize: 10.5, color: "var(--fg-faint)", marginTop: 1 }}>book · referenced</div>
              </div>
            </a>
          </li>
        ))}
      </ul>

      <hr className="bd-rule" style={{ margin: "24px 0" }} />

      <div className="bd-overline" style={{ marginBottom: 12 }}>Backlinks · {post.backlinks.length}</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {post.backlinks.map((b, i) => (
          <li key={i}>
            <a href="#" style={{ fontSize: 13, color: "var(--fg)", textDecoration: "none", display: "flex", gap: 8 }}>
              <span style={{ color: "var(--fg-veryfaint)" }}>↩</span>
              <span>{b.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Marginalia note rendered in the gutter of the body
function V3Marginalia({ children }) {
  return (
    <aside style={{
      position: "absolute",
      right: -260, top: 6,
      width: 220,
      fontSize: 11.5,
      lineHeight: 1.5,
      color: "var(--fg-faint)",
      fontFamily: '"JetBrains Mono", monospace',
      letterSpacing: "0.02em",
      borderLeft: "1px solid var(--border)",
      paddingLeft: 12,
    }}>
      {children}
    </aside>
  );
}

function V3Home() {
  const D = window.BLOG_DATA;
  return (
    <V3Frame left={<V3LeftNav active="all" />} right={<V3RightHome />}>
      {/* Big editorial header */}
      <div style={{ marginBottom: 28 }}><BdAsciiHero /></div>
      <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--fg-mute)", marginTop: 16, marginBottom: 8, letterSpacing: "-0.01em", maxWidth: 540 }}>
        글, 소설, 개발 기록을 모아둔 디지털 정원입니다.
        쓰면 쓸수록 노트는 서로를 부른다고, 그 흔적을 기록하고 있어요.
      </p>
      <div style={{ marginTop: 36, marginBottom: 18, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <h2 className="bd-h2" style={{ fontSize: 17 }}>Archive</h2>
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--fg-faint)", display: "flex", gap: 14 }}>
          <span><strong style={{ color: "var(--fg)" }}>{D.counts.all}</strong> notes</span>
          <span>·</span>
          <span><strong style={{ color: "var(--fg)" }}>47</strong> links</span>
        </div>
      </div>
      {D.posts.slice(0, 9).map((p, i) => <BdPostRow key={i} p={p} />)}
      <div style={{ marginTop: 18, textAlign: "center" }}>
        <button style={{
          background: "transparent", border: "1px solid var(--border)", color: "var(--fg-mute)",
          padding: "6px 16px", borderRadius: 999, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit",
        }}>Load more</button>
      </div>
    </V3Frame>
  );
}

function V3Post() {
  const D = window.BLOG_DATA;
  const p = D.currentPost;

  // Marginalia data: which heading gets which side note
  const marginalNotes = {
    "onboarding": "§2 / 압축된 온보딩 — 평균 신입 온보딩: 대기업 90일, 스타트업 5일",
    "tempo":      "§3 / 프로젝트 템포 — 의사결정 사이클: 분기 → 격주 → 주간",
  };

  return (
    <V3Frame left={<V3LeftNav active="thought" />} right={<V3RightPost post={p} />} mainPadding="40px 56px">
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18, fontSize: 12, color: "var(--fg-faint)" }}>
        <a href="#" style={{ color: "var(--fg-mute)", textDecoration: "none" }}>← Thoughts</a>
      </div>
      <h1 className="bd-h1" style={{ fontSize: 30 }}>{p.title}</h1>
      <p style={{ marginTop: 10, color: "var(--fg-mute)", fontSize: 16, lineHeight: 1.6 }}>{p.description}</p>
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12, fontSize: 12.5, color: "var(--fg-mute)" }}>
        <span className="mono" style={{ color: "var(--fg-faint)" }}>{p.date}</span>
        <span style={{ color: "var(--fg-veryfaint)" }}>·</span>
        <span>{p.readingTime} min</span>
        <span style={{ color: "var(--fg-veryfaint)" }}>·</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span className={`bd-cat-dot ${p.category}`} />{p.label}
        </span>
      </div>
      <hr className="bd-rule" style={{ margin: "22px 0 28px" }} />

      {/* Body with marginalia */}
      <div className="bd-prose" style={{ position: "relative" }}>
        {p.body.map((b, i) => {
          if (b.type === "h2") {
            const note = marginalNotes[b.id];
            return (
              <div key={i} style={{ position: "relative" }}>
                <h2 id={b.id}>{b.text}</h2>
                {note && <V3Marginalia>{note}</V3Marginalia>}
              </div>
            );
          }
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

      <hr className="bd-rule" style={{ margin: "30px 0 16px" }} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {p.tags.map(t => <span key={t} className="bd-chip">#{t}</span>)}
      </div>
    </V3Frame>
  );
}

Object.assign(window, { V3Home, V3Post });
