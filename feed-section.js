(function () {

  // ① Vue を読み込む
  const vueScript = document.createElement("script");
  vueScript.src = "https://unpkg.com/vue@3/dist/vue.global.prod.js";
  document.head.appendChild(vueScript);

  // ② Vue と Blogger DOM の両方が揃うまで待つ
  const waitReady = setInterval(() => {
    if (!window.Vue) return;

    // Blogger 固定ページは iframe 内で DOM が遅延生成される
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
          <div class="overview-section">
            <h2>{{ label }} × {{ overviewSub }}（概要）</h2>
            <ul>
              <li v-for="item in overview" :key="item.id">
                <a :href="item.link">{{ item.title }}</a>
                <div class="excerpt">{{ item.content.slice(0, 80) }}...</div>
                <div class="date">{{ item.published.toLocaleDateString() }}</div>
              </li>
            </ul>
          </div>

          <div class="latest-section">
            <h2>{{ label }} に関する新着投稿</h2>
            <ul>
              <li v-for="item in latest" :key="item.id">
                <a :href="item.link">{{ item.title }}</a>
                <div class="excerpt">{{ item.content.slice(0, 80) }}...</div>
                <div class="date">{{ item.published.toLocaleDateString() }}</div>
              </li>
            </ul>
          </div>

          <div class="important-section">
            <h2>{{ label }} に関する最近の重要な投稿</h2>
            <ul>
              <li v-for="item in important" :key="item.id">
                <a :href="item.link">{{ item.title }}</a>
                <div class="excerpt">{{ item.content.slice(0, 80) }}...</div>
                <div class="date">{{ item.published.toLocaleDateString() }}</div>
              </li>
            </ul>
          </div>
        </div>
      `
    };

    // ④ Blogger 固定ページ内の <feed-section> をすべて mount
    targets.forEach((el) => {
      const props = {};
      for (const attr of el.attributes) {
        props[attr.name] = attr.value;
      }
      createApp(FeedSection, props).mount(el);
    });

  }, 50);

})();
