// Vue を読み込む
(function loadVue() {
  const script = document.createElement("script");
  script.src = "https://unpkg.com/vue@3/dist/vue.global.prod.js";
  document.head.appendChild(script);
})();

// Vue が読み込まれるまで待つ（Blogger で最も安定）
function waitForVue(callback) {
  const timer = setInterval(() => {
    if (window.Vue) {
      clearInterval(timer);
      callback();
    }
  }, 50);
}

// Vue 読み込み後に初期化
waitForVue(() => {
  initFeedSection();
});

function initFeedSection() {
  const { createApp, ref } = Vue;

  const FeedSection = {
    props: { /* 省略（あなたのコードそのまま） */ },

    setup(props) {
      const overview = ref([]);
      const latest = ref([]);
      const important = ref([]);

      // fetchFeed（あなたのコードそのまま）
      // sortByDate（あなたのコードそのまま）

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

    template: `...あなたのテンプレートそのまま...`
  };

  // mount は 1 回だけ
  const app = createApp({});
  app.component("feed-section", FeedSection);
  app.mount("#app");
}
