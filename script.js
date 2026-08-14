(function () {

  /* ---------------------------------------------------------
   * ① トースト通知の CSS（右下に2秒表示）
   * --------------------------------------------------------- */
  const toastStyle = document.createElement("style");
  toastStyle.textContent = `
    .toast {
      position: fixed;
      right: 20px;
      bottom: 20px;
      background: #333;
      color: #fff;
      padding: 12px 18px;
      border-radius: 6px;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.4s ease;
      z-index: 9999;
    }
    .toast.show {
      opacity: 1;
    }
  `;
  document.head.appendChild(toastStyle);

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 2000);
  }

  /* ---------------------------------------------------------
   * ② ラベルボックス用 CSS
   * --------------------------------------------------------- */
  const labelStyle = document.createElement("style");
  labelStyle.textContent = `
    .label-row {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-top: 12px;
    }
    .post-labels-title {
      font-weight: 600;
      font-size: 0.95rem;
      padding: 0.25rem 0.6rem;
      background-color: #eeeeee;
      border: 1px solid #bbbbbb;
      border-radius: 6px;
      white-space: nowrap;
    }
    .label-box {
      background-color: #fff9d6;
      border: 1px solid #f0e6b8;
      padding: 10px 12px;
      border-radius: 10px;
      display: inline-flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      cursor: pointer;
    }
    .label-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.15rem 0.7rem;
      border-radius: 999px;
      border: 1px solid #cc7a8a;
      background-color: #ffe5ec;
      color: #333;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .label-pill:hover {
      background-color: #ffd6e5;
      border-color: #d45c78;
    }
    .feed-section-wrapper a.w3-button {
      background-color: #1a73e8 !important;
      color: #ffffff !important;
      border: none !important;
      border-radius: 999px !important;
      padding: 6px 16px !important;
      display: inline-block;
      font-weight: 600;
    }
  `;
  document.head.appendChild(labelStyle);

  /* ---------------------------------------------------------
   * ③ W3.CSS 読み込み
   * --------------------------------------------------------- */
  const w3css = document.createElement("link");
  w3css.rel = "stylesheet";
  w3css.href = "https://www.w3schools.com/w3css/5/w3.css";
  document.head.appendChild(w3css);

  /* ---------------------------------------------------------
   * ④ リンク色修正
   * --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
   * ⑤ セクション余白
   * --------------------------------------------------------- */
  const w3marginFix = document.createElement("style");
  w3marginFix.textContent = `
    .feed-section-wrapper .overview-section,
    .feed-section-wrapper .latest-section,
    .feed-section-wrapper .important-section {
      margin-bottom: 32px;
    }
    .feed-section-wrapper h2 {
      margin-bottom: 12px;
    }
  `;
  document.head.appendChild(w3marginFix);

  /* ---------------------------------------------------------
   * ⑥ 【★追加：フォントサイズ修正】
   * --------------------------------------------------------- */
  const w3fontFix = document.createElement("style");
  w3fontFix.textContent = `
    /* W3.CSS のフォントサイズを Blogger 標準に合わせる */
    .w3-small,
    .w3-medium {
      font-size: 1rem !important;
    }
  `;
  document.head.appendChild(w3fontFix);

  /* ---------------------------------------------------------
   * ⑦ Vue 読み込み
   * --------------------------------------------------------- */
  const vueScript = document.createElement("script");
  vueScript.src = "https://unpkg.com/vue@3/dist/vue.global.prod.js";
  document.head.appendChild(vueScript);

  /* ---------------------------------------------------------
   * ⑧ Vue と DOM の準備待ち
   * --------------------------------------------------------- */
  const waitReady = setInterval(() => {
    if (!window.Vue) return;

    const targets = document.querySelectorAll("feed-section");
    if (targets.length === 0) return;

    clearInterval(waitReady);

    const { createApp, ref } = Vue;

    /* ---------------------------------------------------------
     * ⑨ LabelBox コンポーネント
     * --------------------------------------------------------- */
    const LabelBox = {
      name: "LabelBox",
      props: {
        labels: { type: Array, required: true }
      },
      methods: {
        copyLabels() {
          const text = this.labels.join(",") + ",";
          navigator.clipboard.writeText(text).then(() => {
            if (location.protocol !== "file:") {
              showToast("コピーしました");
            } else {
              alert("コピーしました: " + text);
            }
          });
        }
      },
      template: `
        <div class="label-box" @click="copyLabels">
          <span v-for="(label, index) in labels"
                :key="index"
                class="label-pill">
            {{ label }}
          </span>
        </div>
      `
    };

    /* ---------------------------------------------------------
     * ⑩ FeedSection コンポーネント
     * --------------------------------------------------------- */
    const FeedSection = {
      props: {
        label: { type: String, required: true },
        overviewSub: { type: String, default: "概要" },
        importantSub: { type: String, default: "重要" },
        overviewLimit: { type: Number, default: 1 },
        latestLimit: { type: Number, default: 5 },
        importantLimit: { type: Number, default: 20 }
      },

      components: { LabelBox },

      setup(props) {
        const overview = ref([]);
        const latest = ref([]);
        const important = ref([]);

        const makeSearchURL = (labels) =>
          `/search/label/${labels.join("+")}`;

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

        return { overview, latest, important, makeSearchURL };
      },

      template: `
        <div class="feed-section-wrapper">

          <!-- 概要 -->
          <div class="overview-section">
            <div class="w3-container w3-light-grey w3-padding w3-border-left w3-border-blue w3-round">
              <h2>{{ label }} についての概要</h2>
            </div>

            <div class="label-row">
              <span class="post-labels-title">投稿ラベル</span>
              <label-box :labels="[label, overviewSub]"></label-box>
            </div>

            <div><p>新しい投稿を書いて、ここに表示するには、ダッシュボード(管理画面)を開いて[投稿]を選択し、[+新しい投稿]ボタンをクリックして投稿エディタを開き、<b> {{ label }} </b> と <b> 概要 </b> をカンマ(,)で区切ってラベルの欄に書き込み、記事のタイトルと本文を書いてから、[公開]ボタンをクリックしてください。</p></div>

            <div class="w3-margin-top w3-margin-bottom">
              <a :href="makeSearchURL([label, overviewSub])"
                 class="w3-button w3-blue w3-round w3-small">
                 一覧を見る
              </a>
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

            <div class="w3-margin-top">
              <a :href="makeSearchURL([label, overviewSub])"
                 class="w3-button w3-blue w3-round w3-small">
                 一覧を見る
              </a>
            </div>
          </div>

          <!-- 新着 -->
          <div class="latest-section">
            <div class="w3-container w3-light-grey w3-padding w3-border-left w3-border-green w3-round">
              <h2>{{ label }} に関する新着投稿</h2>
            </div>

            <div class="label-row">
              <span class="post-labels-title">投稿ラベル</span>
              <label-box :labels="[label]"></label-box>
            </div>

            <div><p>新しい投稿を書いて、ここに表示するには、ダッシュボード(管理画面)を開いて[投稿]を選択し、[+新しい投稿]ボタンをクリックして投稿エディタを開き、<b> {{ label }} </b> をラベルの欄に書き込み、記事のタイトルと本文を書いてから、[公開]ボタンをクリックしてください。</p></div>

            <div class="w3-margin-top w3-margin-bottom">
              <a :href="makeSearchURL([label])"
                 class="w3-button w3-blue w3-round w3-small">
                 一覧を見る
              </a>
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

            <div class="w3-margin-top">
              <a :href="makeSearchURL([label])"
                 class="w3-button w3-blue w3-round w3-small">
                 一覧を見る
              </a>
            </div>
          </div>

          <!-- 重要 -->
          <div class="important-section">
            <div class="w3-container w3-light-grey w3-padding w3-border-left w3-border-red w3-round">
              <h2>{{ label }} に関する最近の重要な投稿</h2>
            </div>

            <div class="label-row">
              <span class="post-labels-title">投稿ラベル</span>
              <label-box :labels="[label, importantSub]"></label-box>
            </div>

            <div><p>新しい投稿を書いて、ここに表示するには、ダッシュボード(管理画面)を開いて[投稿]を選択し、[+新しい投稿]ボタンをクリックして投稿エディタを開き、<b> {{ label }} </b> と <b> 重要 </b> をカンマ(,)で区切ってラベルの欄に書き込み、記事のタイトルと本文を書いてから、[公開]ボタンをクリックしてください。</p></div>

            <div class="w3-margin-top w3-margin-bottom">
              <a :href="makeSearchURL([label, importantSub])"
                 class="w3-button w3-blue w3-round w3-small">
                 一覧を見る
              </a>
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

            <div class="w3-margin-top">
              <a :href="makeSearchURL([label, importantSub])"
                 class="w3-button w3-blue w3-round w3-small">
                 一覧を見る
              </a>
            </div>
          </div>

        </div>
      `
    };

    /* ---------------------------------------------------------
     * ⑪ feed-section タグごとに Vue をマウント
     * --------------------------------------------------------- */
    targets.forEach((el) => {
      const props = {};
      for (const attr of el.attributes) {
        props[attr.name] = attr.value;
      }
      createApp(FeedSection, props).mount(el);
    });

  }, 50);

})();
//MSC:MJBqVAST 2026-08-15-0136
