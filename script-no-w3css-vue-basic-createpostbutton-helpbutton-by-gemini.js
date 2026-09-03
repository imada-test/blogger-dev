(function () {

  /* ---------------------------------------------------------
   * ① スタイル（CSS）の動的注入
   * --------------------------------------------------------- */
  const customStyle = document.createElement("style");
  customStyle.textContent = `
    /* トースト通知 */
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
      z-index: 10000;
    }
    .toast.show {
      opacity: 1;
    }

    /* ラベルボックス */
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

    /* モーダルダイアログ */
    .custom-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    .custom-modal-content {
      background: #ffffff;
      padding: 24px;
      border-radius: 12px;
      max-width: 520px;
      width: 90%;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    .custom-modal-content ol {
      padding-left: 1.2rem;
      margin-top: 1rem;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }
    .custom-modal-content li {
      margin-bottom: 0.5rem;
    }
  `;
  document.head.appendChild(customStyle);

  /* ---------------------------------------------------------
   * ② トースト表示用関数
   * --------------------------------------------------------- */
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
   * ③ Vue 読み込み
   * --------------------------------------------------------- */
  const vueScript = document.createElement("script");
  vueScript.src = "https://unpkg.com/vue@3/dist/vue.global.prod.js";
  document.head.appendChild(vueScript);

  /* ---------------------------------------------------------
   * ④ Vue と DOM の準備待ち
   * --------------------------------------------------------- */
  const waitReady = setInterval(() => {
    if (!window.Vue) return;

    const targets = document.querySelectorAll("feed-section");
    if (targets.length === 0) return;

    clearInterval(waitReady);

    const { createApp } = Vue;

    /* ---------------------------------------------------------
     * ⑤ LabelBox コンポーネント (Options API)
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
     * ⑥ FeedSection コンポーネント（Options API 版）
     * --------------------------------------------------------- */
    const FeedSection = {
      name: "FeedSection",
      components: { LabelBox },

      props: {
        label: { type: String, required: true },
        overviewSub: { type: String, default: "概要" },
        importantSub: { type: String, default: "重要" },
        basicSub: { type: String, default: "基本" },
        overviewLimit: { type: Number, default: 1 },
        latestLimit: { type: Number, default: 5 },
        importantLimit: { type: Number, default: 20 },
        basicLimit: { type: Number, default: 20 }
      },

      data() {
        return {
          overview: [],
          latest: [],
          important: [],
          basic: [],
          isHelpModalOpen: false,
          helpModalText: ""
        };
      },

      methods: {
        makeSearchURL(labels) {
          return `/search/label/${labels.join("+")}`;
        },

        copyAndNavigate(labels) {
          const text = labels.join(",") + ",";
          const targetUrl = "https://www.blogger.com/blog/posts/3677777561286574965";
          
          navigator.clipboard.writeText(text).then(() => {
            if (location.protocol !== "file:") {
              showToast("コピーしました");
            }
            window.location.href = targetUrl;
          }).catch(err => {
            console.error("クリップボードへのコピーに失敗しました", err);
            window.location.href = targetUrl;
          });
        },

        openHelpModal(text) {
          this.helpModalText = text;
          this.isHelpModalOpen = true;
        },

        closeHelpModal() {
          this.isHelpModalOpen = false;
        },

        async fetchFeed(labels) {
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
        },

        sortByDate(items) {
          return items.sort((a, b) => b.published - a.published);
        },

        async loadAllFeeds() {
          const overviewData = await this.fetchFeed([this.label, this.overviewSub]);
          this.overview = this.sortByDate(overviewData).slice(0, this.overviewLimit);

          const latestData = await this.fetchFeed([this.label]);
          this.latest = this.sortByDate(latestData).slice(0, this.latestLimit);

          const importantData = await this.fetchFeed([this.label, this.importantSub]);
          this.important = this.sortByDate(importantData).slice(0, this.importantLimit);

          const basicData = await this.fetchFeed([this.label, this.basicSub]);
          this.basic = this.sortByDate(basicData).slice(0, this.basicLimit);
        }
      },

      created() {
        this.loadAllFeeds();
      },

      /* ---------------------------------------------------------
       * Bootstrap 5 版テンプレート
       * --------------------------------------------------------- */
      template: `
        <div class="container my-4">

          <!-- 概要 -->
          <div class="mb-4">
            <div class="p-3 bg-light border-start border-primary rounded">
              <h2>{{ label }} についての概要</h2>
            </div>

            <div class="label-row">
              <span class="post-labels-title">投稿ラベル</span>
              <label-box :labels="[label, overviewSub]"></label-box>
            </div>

            <p class="mt-3">
              新しい投稿を書いてここに表示するには、ダッシュボードで
              <b>{{ label }}</b> と <b>{{ overviewSub }}</b> をラベル欄に入力して公開してください。
            </p>

            <div class="d-flex flex-wrap gap-2 mb-3">
              <button type="button"
                      class="btn btn-outline-success btn-sm rounded-pill"
                      @click="copyAndNavigate([label, overviewSub])">
                新しい投稿記事を書いてここに表示する
              </button>
              <button type="button"
                      class="btn btn-outline-secondary btn-sm rounded-pill"
                      @click="openHelpModal(label + ' と ' + overviewSub)">
                ヘルプ
              </button>
            </div>

            <div>
              <a :href="makeSearchURL([label, overviewSub])"
                 class="btn btn-primary btn-sm rounded-pill mb-3">
                 一覧を見る
              </a>
            </div>

            <ul class="list-group">
              <li v-for="item in overview" :key="item.id"
                  class="list-group-item">
                <a :href="item.link" class="fw-bold text-primary">
                  {{ item.title }}
                </a>
                <div class="text-muted small">{{ item.published.toLocaleDateString() }}</div>
                <div class="small">{{ item.content.slice(0, 80) }}...</div>
              </li>
            </ul>

            <a :href="makeSearchURL([label, overviewSub])"
               class="btn btn-primary btn-sm rounded-pill mt-3">
               一覧を見る
            </a>
          </div>

          <!-- 新着 -->
          <div class="mb-4">
            <div class="p-3 bg-light border-start border-success rounded">
              <h2>{{ label }} に関する新着投稿</h2>
            </div>

            <div class="label-row">
              <span class="post-labels-title">投稿ラベル</span>
              <label-box :labels="[label]"></label-box>
            </div>

            <p class="mt-3">
              新しい投稿を書いてここに表示するには、ダッシュボードで
              <b>{{ label }}</b> をラベル欄に入力して公開してください。
            </p>

            <div class="d-flex flex-wrap gap-2 mb-3">
              <button type="button"
                      class="btn btn-outline-success btn-sm rounded-pill"
                      @click="copyAndNavigate([label])">
                新しい投稿記事を書いてここに表示する
              </button>
              <button type="button"
                      class="btn btn-outline-secondary btn-sm rounded-pill"
                      @click="openHelpModal(label)">
                ヘルプ
              </button>
            </div>

            <div>
              <a :href="makeSearchURL([label])"
                 class="btn btn-primary btn-sm rounded-pill mb-3">
                 一覧を見る
              </a>
            </div>

            <ul class="list-group">
              <li v-for="item in latest" :key="item.id"
                  class="list-group-item">
                <a :href="item.link" class="fw-bold text-primary">
                  {{ item.title }}
                </a>
                <div class="text-muted small">{{ item.published.toLocaleDateString() }}</div>
                <div class="small">{{ item.content.slice(0, 80) }}...</div>
              </li>
            </ul>

            <a :href="makeSearchURL([label])"
               class="btn btn-primary btn-sm rounded-pill mt-3">
               一覧を見る
            </a>
          </div>

          <!-- 重要 -->
          <div class="mb-4">
            <div class="p-3 bg-light border-start border-danger rounded">
              <h2>{{ label }} に関する最近の重要な投稿</h2>
            </div>

            <div class="label-row">
              <span class="post-labels-title">投稿ラベル</span>
              <label-box :labels="[label, importantSub]"></label-box>
            </div>

            <p class="mt-3">
              新しい投稿を書いてここに表示するには、ダッシュボードで
              <b>{{ label }}</b> と <b>{{ importantSub }}</b> をラベル欄に入力して公開してください。
            </p>

            <div class="d-flex flex-wrap gap-2 mb-3">
              <button type="button"
                      class="btn btn-outline-success btn-sm rounded-pill"
                      @click="copyAndNavigate([label, importantSub])">
                新しい投稿記事を書いてここに表示する
              </button>
              <button type="button"
                      class="btn btn-outline-secondary btn-sm rounded-pill"
                      @click="openHelpModal(label + ' と ' + importantSub)">
                ヘルプ
              </button>
            </div>

            <div>
              <a :href="makeSearchURL([label, importantSub])"
                 class="btn btn-primary btn-sm rounded-pill mb-3">
                 一覧を見る
              </a>
            </div>

            <ul class="list-group">
              <li v-for="item in important" :key="item.id"
                  class="list-group-item">
                <a :href="item.link" class="fw-bold text-primary">
                  {{ item.title }}
                </a>
                <div class="text-muted small">{{ item.published.toLocaleDateString() }}</div>
                <div class="small">{{ item.content.slice(0, 80) }}...</div>
              </li>
            </ul>

            <a :href="makeSearchURL([label, importantSub])"
               class="btn btn-primary btn-sm rounded-pill mt-3">
               一覧を見る
            </a>
          </div>

          <!-- 基本 -->
          <div class="mb-4">
            <div class="p-3 bg-light border-start border-danger rounded">
              <h2>{{ label }} に関する最近の基本的な投稿</h2>
            </div>

            <div class="label-row">
              <span class="post-labels-title">投稿ラベル</span>
              <label-box :labels="[label, basicSub]"></label-box>
            </div>

            <p class="mt-3">
              新しい投稿を書いてここに表示するには、ダッシュボードで
              <b>{{ label }}</b> と <b>{{ basicSub }}</b> をラベル欄に入力して公開してください。
            </p>

            <div class="d-flex flex-wrap gap-2 mb-3">
              <button type="button"
                      class="btn btn-outline-success btn-sm rounded-pill"
                      @click="copyAndNavigate([label, basicSub])">
                新しい投稿記事を書いてここに表示する
              </button>
              <button type="button"
                      class="btn btn-outline-secondary btn-sm rounded-pill"
                      @click="openHelpModal(label + ' と ' + basicSub)">
                ヘルプ
              </button>
            </div>

            <div>
              <a :href="makeSearchURL([label, basicSub])"
                 class="btn btn-primary btn-sm rounded-pill mb-3">
                 一覧を見る
              </a>
            </div>

            <ul class="list-group">
              <li v-for="item in basic" :key="item.id"
                  class="list-group-item">
                <a :href="item.link" class="fw-bold text-primary">
                  {{ item.title }}
                </a>
                <div class="text-muted small">{{ item.published.toLocaleDateString() }}</div>
                <div class="small">{{ item.content.slice(0, 80) }}...</div>
              </li>
            </ul>

            <a :href="makeSearchURL([label, basicSub])"
               class="btn btn-primary btn-sm rounded-pill mt-3">
               一覧を見る
            </a>
          </div>

          <!-- ヘルプモーダル -->
          <div v-if="isHelpModalOpen" class="custom-modal-overlay" @click.self="closeHelpModal">
            <div class="custom-modal-content">
              <h4 class="mb-3">投稿手順のヘルプ</h4>
              <p>新しい投稿を書いて、ここに表示するには、</p>
              <ol>
                <li>ダッシュボード(管理画面)を開いて[投稿]を選択します。</li>
                <li>[+新しい投稿]ボタンをクリックして投稿エディタを開きます。</li>
                <li><b>{{ helpModalText }}</b> をカンマ(,)で区切ってラベルの欄に書き込み、続いて、記事のタイトルと本文を書きます。</li>
                <li>書き終わったら、[公開]ボタンをクリックして公開してください。</li>
              </ol>
              <div class="text-end">
                <button type="button" class="btn btn-primary btn-sm px-4 rounded-pill" @click="closeHelpModal">
                  OK
                </button>
              </div>
            </div>
          </div>

        </div>
      `
    };

    /* ---------------------------------------------------------
     * ⑦ feed-section タグごとに Vue をマウント
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