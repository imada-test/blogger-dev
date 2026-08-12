// ===============================
// feed-section.js（Blogger 専用）
// ===============================

(function () {

  // ① Vue を確実に読み込む（load イベントは使わない）
  const vueScript = document.createElement("script");
  vueScript.src = "https://unpkg.com/vue@3/dist/vue.global.prod.js";
  document.head.appendChild(vueScript);

  // ② Vue 読み込み完了をポーリングで待つ（Blogger で最も安定）
  const waitVue = setInterval(() => {
    if (!window.Vue) return;

    clearInterval(waitVue);

    const { createApp, ref } = Vue;

    // ③ コンポーネント定義（Vue 3 正式構文）
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
        <div>
          <div id="overview-section">
            <h2>{{ label }} × {{ overviewSub }}（概要）</h2>
            <ul>
              <li v-for="item in overview" :key="item.id">
                <a :href="item.link">{{ item.title }}</a>
                <div class="excerpt">{{ item.content.slice(0, 80) }}...</div>
                <div class="date">{{ item.published.toLocaleDateString() }}</div>
              </li>
            </ul>
          </div>

          <div id="latest-section">
            <h2>{{ label }} に関する新着投稿</h2>
            <ul>
              <li v-for="item in latest" :key="item.id">
                <a :href="item.link">{{ item.title }}</a>
                <div class="excerpt">{{ item.content.slice(0, 80) }}...</div>
                <div class="date">{{ item.published.toLocaleDateString() }}</div>
              </li>
            </ul>
          </div>

          <div id="important-section">
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
    document.querySelectorAll("feed-section").forEach((el) => {
      createApp(FeedSection, el.attributes).mount(el);
    });

  }, 50); // ← 50ms ポーリング（Blogger で最も安定）

})();
