// ① Vue 3 を読み込む（script.onload で読み込み完了を保証）
(function loadVue() {
  const script = document.createElement("script");
  script.src = "https://unpkg.com/vue@3/dist/vue.global.prod.js";
  script.onload = initFeedSection;
  document.head.appendChild(script);
})();

// ② Vue 読み込み後にコンポーネント登録と mount を行う
function initFeedSection() {
  const { createApp, ref } = Vue;

  const FeedSection = {
    props: {
      label: { type: String, required: true },
      overviewSub: { type: String, default: "概要" },
      importantSub: { type: String, default: "重要" },
      overviewLimit: { type: Number, default: 1 },
      latestLimit: { type: Number, default: 5 },
      importantLimit: { type: Number, default: 20 },
      excerptLength: { type: Number, default: 80 }   // ★本文の抜粋文字数
    },

    setup(props) {
      const overview = ref([]);
      const latest = ref([]);
      const important = ref([]);

      // ★HTMLタグ除去
      const stripHtml = (html) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
      };

      // ★本文の一部を作る
      const excerpt = (text, len) =>
        text.length > len ? text.slice(0, len) + "…" : text;

      // ★フィード取得（本文も含む）
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
            const content = e.summary?.$t || e.content?.$t || "";  // ★本文取得
            const cleanText = stripHtml(content);                  // ★HTML除去

            return {
              id: e.id.$t,
              title: e.title.$t,
              link: linkObj ? linkObj.href : "#",
              published: new Date(e.published.$t),
              excerpt: excerpt(cleanText, props.excerptLength)     // ★本文の一部
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
              <div class="meta">
                <span>{{ item.published.toLocaleDateString() }}</span>
              </div>
              <p class="excerpt">{{ item.excerpt }}</p>
            </li>
          </ul>
        </div>

        <div id="latest-section">
          <h2>{{ label }} に関する新着投稿</h2>
          <ul>
            <li v-for="item in latest" :key="item.id">
              <a :href="item.link">{{ item.title }}</a>
              <div class="meta">
                <span>{{ item.published.toLocaleDateString() }}</span>
              </div>
              <p class="excerpt">{{ item.excerpt }}</p>
            </li>
          </ul>
        </div>

        <div id="important-section">
          <h2>{{ label }} に関する最近の重要な投稿</h2>
          <ul>
            <li v-for="item in important" :key="item.id">
              <a :href="item.link">{{ item.title }}</a>
              <div class="meta">
                <span>{{ item.published.toLocaleDateString() }}</span>
              </div>
              <p class="excerpt">{{ item.excerpt }}</p>
            </li>
          </ul>
        </div>
      </div>
    `
  };

  document.querySelectorAll("feed-section").forEach((el) => {
    const app = createApp({});
    app.component("feed-section", FeedSection);
    app.mount(el);
  });
}
