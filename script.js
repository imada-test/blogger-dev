(function () {

  // ★ W3.CSS を読み込む
  const w3css = document.createElement("link");
  w3css.rel = "stylesheet";
  w3css.href = "https://www.w3schools.com/w3css/5/w3.css";
  document.head.appendChild(w3css);

  // ★ リンク色を青に強制（Blogger テーマの黒を上書き）
  const w3linkFix = document.createElement("style");
  w3linkFix.textContent = `
    .feed-section-wrapper a {
      color: #1a73e8 !important;
      text-decoration: none;
    }
    .feed-section-wrapper a:hover {
      color: #0b59d1 !important;
      opacity: 0.85;
    }
  `;
  document.head.appendChild(w3linkFix);

  // ① Vue を読み込む
  const vueScript = document.createElement("script");
  vueScript.src = "https://unpkg.com/vue@3/dist/vue.global.prod.js";
  document.head.appendChild(vueScript);

  // ② Vue と Blogger DOM の両方が揃うまで待つ
  const waitReady = setInterval(() => {
    if (!window.Vue) return;

    const targets = document.querySelectorAll("feed-section");
    if (targets.length === 0) return;

    clearInterval(waitReady);

    const { createApp, ref } = Vue;

    // ③ コンポーネント定義
    const FeedSection = {
      props: {
        label: { type: String, required: true },
        overviewSub: { type: String, default: "概要" },
        importantSub: { type: String, default: "重要" },
        overviewLimit: { type: Number, default: 1 },
        latestLimit: { type: Number, default: 5 },
        importantLimit: { type: Number, default: 20 }
      },

      setup(props) {
        const overview = ref([]);
        const latest = ref([]);
        const important = ref([]);

        const fetchFeed = async (labels) => {
          const base = `${location.origin}/feeds/posts/summary`;
          const path = labels.length ? "/-/" + labels.join("/") : "";
          const url = `${base}${path}?alt=json`;

          try {
            const res = await fetch(url);
            const data = await res.json();
            const entries = (data.feed && data.feed.entry) ? data.feed.entry : [];

            return entries.map(e => {
              const linkObj = e.link.find(l => l.rel === "alternate");
              return {
                id: e.id.$t,
                title: e.title.$t,
                link: linkObj ? linkObj.href : "#",
                published: new Date(e.published.$t),
                content: e.summary ? e.summary.$t : ""
              };
            });

          } catch (err) {
            console.error("Feed error:", err);
            return [];
          }
        };

        const sortByDate = (items) =>
          items.sort((a, b) => b.published - a.published);

        (async () => {
          overview.value = sortByDate(
            await fetchFeed([props.label, props.overviewSub])
          ).slice(0, props.overviewLimit);

          latest.value = sortByDate(
            await fetchFeed([props.label])
          ).slice(0, props.latestLimit);

          important.value = sortByDate(
            await fetchFeed([props.label, props.importantSub])
          ).slice(0, props.importantLimit);
        })();

        return { overview, latest, important };
      },

      template: `
        <div class="feed-section-wrapper">

          <!-- 概要 -->
          <div class="overview-section">
            <div class="w3-container w3-light-grey w3-padding w3-border-left w3-border-blue w3-round">
              <h2>{{ label }} についての概要</h2>
            </div>

            <ul class="w3-ul w3-card w3-round w3-margin-top">
              <li v-for="item in overview" :key="item.id" class="w3-padding w3-hoverable">
                <a :href="item.link"
                   class="w3-text-blue w3-hover-text-blue w3-hover-opacity w3-medium w3-bold">
                  {{ item.title }}
                </a>
                <div class="date w3-small w3-text-grey">{{ item.published.toLocaleDateString() }}</div>
                <div class="excerpt w3-small">{{ item.content.slice(0, 80) }}...</div>
              </li>
            </ul>
          </div>

          <!-- 新着 -->
          <div class="latest-section">
            <div class="w3-container w3-light-grey w3-padding w3-border-left w3-border-green w3-round">
              <h2>{{ label }} に関する新着投稿</h2>
            </div>

            <ul class="w3-ul w3-card w3-round w3-margin-top">
              <li v-for="item in latest" :key="item.id" class="w3-padding w3-hoverable">
                <a :href="item.link"
                   class="w3-text-blue w3-hover-text-blue w3-hover-opacity w3-medium w3-bold">
                  {{ item.title }}
                </a>
                <div class="date w3-small w3-text-grey">{{ item.published.toLocaleDateString() }}</div>
                <div class="excerpt w3-small">{{ item.content.slice(0, 80) }}...</div>
              </li>
            </ul>
          </div>

          <!-- 重要 -->
          <div class="important-section">
            <div class="w3-container w3-light-grey w3-padding w3-border-left w3-border-red w3-round">
              <h2>{{ label }} に関する最近の重要な投稿</h2>
            </div>

            <ul class="w3-ul w3-card w3-round w3-margin-top">
              <li v-for="item in important" :key="item.id" class="w3-padding w3-hoverable">
                <a :href="item.link"
                   class="w3-text-blue w3-hover-text-blue w3-hover-opacity w3-medium w3-bold">
                  {{ item.title }}
                </a>
                <div class="date w3-small w3-text-grey">{{ item.published.toLocaleDateString() }}</div>
                <div class="excerpt w3-small">{{ item.content.slice(0, 80) }}...</div>
              </li>
            </ul>
          </div>

        </div>
      `
    };

    targets.forEach((el) => {
      const props = {};
      for (const attr of el.attributes) {
        props[attr.name] = attr.value;
      }
      createApp(FeedSection, props).mount(el);
    });

  }, 50);

})();
