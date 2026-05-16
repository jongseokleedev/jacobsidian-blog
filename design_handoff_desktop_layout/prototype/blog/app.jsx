const { useState, useEffect } = React;

const VARIANT_LABELS = {
  v1: "Quiet Rails",
  v2: "Soft Panels",
  v3: "Editorial Marginalia",
  v4: "Two-Tone Workspace",
};
const VARIANT_DESC = {
  v1: "분위기만 — 세로선과 타이포만으로 영역을 분리",
  v2: "은은한 패널 카드 — 위젯별로 살짝 단을 잡음",
  v3: "마지널리아 — 본문 옆 여백에 TOC가 주석으로",
  v4: "Obsidian-y — 좌우 레일을 한 톤 깊게 (가장 앱스러움)",
};

// ── Tweaks panel ─────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark"
}/*EDITMODE-END*/;

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function TweaksUI() {
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  useEffect(() => { applyTheme(t.theme); }, [t.theme]);
  return (
    <window.TweaksPanel>
      <window.TweakSection title="Theme">
        <window.TweakRadio
          label="Mode"
          value={t.theme}
          onChange={v => setTweak("theme", v)}
          options={[
            { value: "light", label: "Light" },
            { value: "dark",  label: "Dark" },
          ]}
        />
      </window.TweakSection>
      <window.TweakSection title="시안 안내">
        <div style={{ fontSize: 12, lineHeight: 1.55, color: "rgba(255,255,255,0.7)" }}>
          더블클릭하면 풀스크린으로 볼 수 있어요.
          <br/><br/>
          <strong>Discovery (Home·Category)</strong>: 본문에 큰 graph hero.
          우측은 Now reading · This week · Stats.
          <br/><br/>
          <strong>Reading (Post)</strong>: 우측에 TOC · mini graph · Related · Backlinks.
        </div>
      </window.TweakSection>
    </window.TweaksPanel>
  );
}

function App() {
  useEffect(() => { applyTheme(TWEAK_DEFAULTS.theme); }, []);

  const ARTBOARD_W = 1280;
  const ARTBOARD_H = 880;

  return (
    <>
      <window.DesignCanvas
        title="jacobsidian — Desktop Layout"
        subtitle="모바일처럼 가운데만 쓰던 데스크탑을 양쪽 사이드까지 활용. V1 Quiet Rails 채택 후 모드 분리(Discovery / Reading)."
      >
        {/* PRIMARY — V1 with mode-specific layouts */}
        <window.DCSection
          id="v1-primary"
          title="V1 Quiet Rails — 채택안"
          subtitle="Home(그래프+미리보기) / Category(목록) / Topic(서브카테고리) / About / Post 각각 다른 레이아웃. 필터는 그래프와 Archives 통합."
        >
          <window.DCArtboard
            id="v1-home"
            label="① Home"
            width={ARTBOARD_W}
            height={ARTBOARD_H}
          >
            <window.V1Home />
          </window.DCArtboard>

          <window.DCArtboard
            id="v1-category-thoughts"
            label="② Category · Thoughts"
            width={ARTBOARD_W}
            height={ARTBOARD_H}
          >
            <window.V1Category catKey="thought" />
          </window.DCArtboard>

          <window.DCArtboard
            id="v1-category-tech"
            label="③ Category · Tech"
            width={ARTBOARD_W}
            height={ARTBOARD_H}
          >
            <window.V1Category catKey="tech" />
          </window.DCArtboard>

          <window.DCArtboard
            id="v1-topic"
            label="④ Topic · Thoughts › Work · 일"
            width={ARTBOARD_W}
            height={ARTBOARD_H}
          >
            <window.V1Topic catKey="thought" topicKey="work" />
          </window.DCArtboard>

          <window.DCArtboard
            id="v1-about"
            label="⑤ About"
            width={ARTBOARD_W}
            height={ARTBOARD_H}
          >
            <window.V1About />
          </window.DCArtboard>

          <window.DCArtboard
            id="v1-post"
            label="⑥ Post detail (Reading)"
            width={ARTBOARD_W}
            height={ARTBOARD_H}
          >
            <window.V1Post />
          </window.DCArtboard>
        </window.DCSection>

        {/* REFERENCE — other directions kept for comparison */}
        <window.DCSection
          id="reference"
          title="참고 — 이전 시안들"
          subtitle="V2~V4는 채택 안 된 방향들. 비교 참고용."
        >
          <window.DCArtboard id="v2-home" label="V2 Soft Panels · Home" width={ARTBOARD_W} height={ARTBOARD_H}>
            <window.V2Home />
          </window.DCArtboard>
          <window.DCArtboard id="v2-post" label="V2 Soft Panels · Post" width={ARTBOARD_W} height={ARTBOARD_H}>
            <window.V2Post />
          </window.DCArtboard>
          <window.DCArtboard id="v3-home" label="V3 Marginalia · Home" width={ARTBOARD_W} height={ARTBOARD_H}>
            <window.V3Home />
          </window.DCArtboard>
          <window.DCArtboard id="v3-post" label="V3 Marginalia · Post" width={ARTBOARD_W} height={ARTBOARD_H}>
            <window.V3Post />
          </window.DCArtboard>
          <window.DCArtboard id="v4-home" label="V4 Workspace · Home" width={ARTBOARD_W} height={ARTBOARD_H}>
            <window.V4Home />
          </window.DCArtboard>
          <window.DCArtboard id="v4-post" label="V4 Workspace · Post" width={ARTBOARD_W} height={ARTBOARD_H}>
            <window.V4Post />
          </window.DCArtboard>
        </window.DCSection>
      </window.DesignCanvas>

      <TweaksUI />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
