(function () {

  blog_id = "8624434127519986313";

  /* ---------------------------------------------------------
   * ① Bootstrap Icons および スタイル（CSS）の動的注入
   * --------------------------------------------------------- */
  if (!document.getElementById("bs-icons-css")) {
    const bsIconsLink = document.createElement("link");
    bsIconsLink.id = "bs-icons-css";
    bsIconsLink.rel = "stylesheet";
    bsIconsLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    document.head.appendChild(bsIconsLink);
  }

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

    /* 投稿タイトル用ピル型バッジ */
    .badge-pill-important {
      display: inline-flex;
      align-items: center;
      padding: 0.1rem 0.5rem;
      border-radius: 999px;
      background-color: #ff0000;
      color: #ffffff;
      border: 1px solid #000000;
      font-size: 0.75rem;
      font-weight: bold;
      margin-right: 0.4rem;
      vertical-align: middle;
      white-space: nowrap;
    }
    .badge-pill-basic {
      display: inline-flex;
      align-items: center;
      padding: 0.1rem 0.5rem;
      border-radius: 999px;
      background-color: #ffffe0;
      color: #000000;
      border: 1px solid #000000;
      font-size: 0.75rem;
      font-weight: bold;
      margin-right: 0.4rem;
      vertical-align: middle;
      white-space: nowrap;
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
      padding: 16px;
      box-sizing: border-box;
    }
    .custom-modal-content {
      background: #ffffff;
      padding: 24px;
      border-radius: 12px;
      max-width: 520px;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      box-sizing: border-box;
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
        latestLimit: { type: Number, default: 6 },
        importantLimit: { type: Number, default: 4 },
        basicLimit: { type: Number, default: 20 }
      },

      data() {
        return {
          pageSize: 6, // ページネーション時の1ページあたりの件数

          // 全件データリスト
          overviewList: [],
          latestList: [],
          importantList: [],
          basicList: [],

          // 各セクションの総件数
          overviewTotal: 0,
          latestTotal: 0,
          importantTotal: 0,
          basicTotal: 0,

          // 一覧表示（ページネーション表示）フラグ
          showListState: {
            overview: false,
            latest: false,
            important: false,
            basic: false
          },

          // 現在のページ番号（1始まり）
          pageState: {
            overview: 1,
            latest: 1,
            important: 1,
            basic: 1
          },

          isHelpModalOpen: false,
          helpModalText: ""
        };
      },

      computed: {
        // --- 概要セクション ---
        displayOverview() {
          if (!this.showListState.overview) {
            return this.overviewList.slice(0, this.overviewLimit);
          }
          const start = (this.pageState.overview - 1) * this.pageSize;
          return this.overviewList.slice(start, start + this.pageSize);
        },
        overviewTotalPages() {
          return Math.ceil(this.overviewList.length / this.pageSize);
        },

        // --- 新着セクション ---
        displayLatest() {
          if (!this.showListState.latest) {
            return this.latestList.slice(0, this.latestLimit);
          }
          const start = (this.pageState.latest - 1) * this.pageSize;
          return this.latestList.slice(start, start + this.pageSize);
        },
        latestTotalPages() {
          return Math.ceil(this.latestList.length / this.pageSize);
        },

        // --- 重要セクション ---
        displayImportant() {
          if (!this.showListState.important) {
            return this.importantList.slice(0, this.importantLimit);
          }
          const start = (this.pageState.important - 1) * this.pageSize;
          return this.importantList.slice(start, start + this.pageSize);
        },
        importantTotalPages() {
          return Math.ceil(this.importantList.length / this.pageSize);
        },

        // --- 基本セクション ---
        displayBasic() {
          if (!this.showListState.basic) {
            return this.basicList.slice(0, this.basicLimit);
          }
          const start = (this.pageState.basic - 1) * this.pageSize;
          return this.basicList.slice(start, start + this.pageSize);
        },
        basicTotalPages() {
          return Math.ceil(this.basicList.length / this.pageSize);
        }
      },

      methods: {
        formatDate(dateObj) {
          if (!dateObj || !(dateObj instanceof Date)) return "";
          const yyyy = dateObj.getFullYear();
          const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
          const dd = String(dateObj.getDate()).padStart(2, "0");
          return `${yyyy}/${mm}/${dd}`;
        },

        copyAndNavigate(labels) {
          const text = labels.join(",") + ",";
          const targetUrl = "https://www.blogger.com/blog/posts/" + blog_id;
          
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

        toggleShowList(key) {
          this.showListState[key] = !this.showListState[key];
          this.pageState[key] = 1; // 切り替え時に1ページ目へ戻す
        },

        setPage(key, page) {
          if (page >= 1 && page <= this[`${key}TotalPages`]) {
            this.pageState[key] = page;
          }
        },

        async fetchFeed(labels, maxResults = 500) {
          const base = `/feeds/posts/summary`;
          const path = labels.length ? "/-/" + labels.join("/") : "";
          // max-results=500 を指定してページネーション用のデータを一括取得
          const url = `${base}${path}?alt=json&max-results=${maxResults}`;

          try {
            const res = await fetch(url);
            const data = await res.json();
            const entries = (data.feed && data.feed.entry) ? data.feed.entry : [];
            const totalResults = data.feed && data.feed.openSearch$totalResults 
              ? parseInt(data.feed.openSearch$totalResults.$t, 10) 
              : entries.length;

            const items = entries.map(e => {
              const linkObj = e.link.find(l => l.rel === "alternate");
              const categories = e.category ? e.category.map(c => c.term) : [];
              return {
                id: e.id.$t,
                title: e.title.$t,
                link: linkObj ? linkObj.href : "#",
                published: new Date(e.published.$t),
                content: e.summary ? e.summary.$t : "",
                categories: categories
              };
            });

            return { items, totalResults };

          } catch (err) {
            console.error("Feed error:", err);
            return { items: [], totalResults: 0 };
          }
        },

        sortByDate(items) {
          return items.sort((a, b) => b.published - a.published);
        },

        async loadAllFeeds() {
          const overviewData = await this.fetchFeed([this.label, this.overviewSub]);
          this.overviewTotal = overviewData.totalResults;
          this.overviewList = this.sortByDate(overviewData.items);

          const latestData = await this.fetchFeed([this.label]);
          this.latestTotal = latestData.totalResults;
          this.latestList = this.sortByDate(latestData.items);

          const importantData = await this.fetchFeed([this.label, this.importantSub]);
          this.importantTotal = importantData.totalResults;
          this.importantList = this.sortByDate(importantData.items);

          const basicData = await this.fetchFeed([this.label, this.basicSub]);
          this.basicTotal = basicData.totalResults;
          this.basicList = this.sortByDate(basicData.items);
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

            <div class="d-flex flex-wrap gap-2 mt-3 mb-3">
              <button type="button"
                      class="btn btn-outline-success btn-sm rounded-pill"
                      @click="copyAndNavigate([label, overviewSub])">
                新しい記事を投稿し、ここに表示する
              </button>
              <button type="button"
                      class="btn btn-outline-secondary btn-sm rounded-pill"
                      @click="openHelpModal(label + ' と ' + overviewSub)">
                ヘルプ
              </button>
            </div>

            <div v-if="overviewTotal > overviewLimit" class="mb-3">
              <button type="button"
                      class="btn btn-outline-primary btn-sm rounded-pill"
                      @click="toggleShowList('overview')">
                {{ showListState.overview ? '閉じる' : '一覧を見る (全' + overviewTotal + '件)' }}
              </button>
            </div>

            <div class="row row-cols-1 row-cols-md-2 g-3">
              <div v-for="item in displayOverview" :key="item.id" class="col">
                <div class="card h-100">
                  <div class="card-body">
                    <h5 class="card-title">
                      <a :href="item.link" class="fw-bold text-primary text-decoration-none">
                        <span v-if="item.categories.includes('重要')" class="badge-pill-important">重要</span>
                        <span v-if="item.categories.includes('基本')" class="badge-pill-basic">基本</span>
                        {{ item.title }}
                      </a>
                    </h5>
                    <div class="text-muted small mb-2">
                      <i class="bi bi-calendar3 me-1"></i>{{ formatDate(item.published) }}
                    </div>
                    <p class="card-text small text-secondary">{{ item.content.slice(0, 400) }}...</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 概要: ページネーション -->
            <nav v-if="showListState.overview && overviewTotalPages > 1" class="mt-3">
              <ul class="pagination pagination-sm justify-content-center mb-0">
                <li class="page-item" :class="{ disabled: pageState.overview === 1 }">
                  <button class="page-link" @click="setPage('overview', pageState.overview - 1)">前へ</button>
                </li>
                <li v-for="p in overviewTotalPages" :key="p" class="page-item" :class="{ active: pageState.overview === p }">
                  <button class="page-link" @click="setPage('overview', p)">{{ p }}</button>
                </li>
                <li class="page-item" :class="{ disabled: pageState.overview === overviewTotalPages }">
                  <button class="page-link" @click="setPage('overview', pageState.overview + 1)">次へ</button>
                </li>
              </ul>
            </nav>
          </div>

          <!-- 新着 -->
          <div class="mb-4">
            <div class="p-3 bg-light border-start border-success rounded">
              <h2>{{ label }} に関する新着情報</h2>
            </div>

            <div class="label-row">
              <span class="post-labels-title">投稿ラベル</span>
              <label-box :labels="[label]"></label-box>
            </div>

            <div class="d-flex flex-wrap gap-2 mt-3 mb-3">
              <button type="button"
                      class="btn btn-outline-success btn-sm rounded-pill"
                      @click="copyAndNavigate([label])">
                新しい記事を投稿し、ここに表示する
              </button>
              <button type="button"
                      class="btn btn-outline-secondary btn-sm rounded-pill"
                      @click="openHelpModal(label)">
                ヘルプ
              </button>
            </div>

            <div v-if="latestTotal > latestLimit" class="mb-3">
              <button type="button"
                      class="btn btn-outline-primary btn-sm rounded-pill"
                      @click="toggleShowList('latest')">
                {{ showListState.latest ? '閉じる' : '一覧を見る (全' + latestTotal + '件)' }}
              </button>
            </div>

            <div class="row row-cols-1 row-cols-md-2 g-3">
              <div v-for="item in displayLatest" :key="item.id" class="col">
                <div class="card h-100">
                  <div class="card-body">
                    <h5 class="card-title">
                      <a :href="item.link" class="fw-bold text-primary text-decoration-none">
                        <span v-if="item.categories.includes('重要')" class="badge-pill-important">重要</span>
                        <span v-if="item.categories.includes('基本')" class="badge-pill-basic">基本</span>
                        {{ item.title }}
                      </a>
                    </h5>
                    <div class="text-muted small mb-2">
                      <i class="bi bi-calendar3 me-1"></i>{{ formatDate(item.published) }}
                    </div>
                    <p class="card-text small text-secondary">{{ item.content.slice(0, 200) }}...</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 新着: ページネーション -->
            <nav v-if="showListState.latest && latestTotalPages > 1" class="mt-3">
              <ul class="pagination pagination-sm justify-content-center mb-0">
                <li class="page-item" :class="{ disabled: pageState.latest === 1 }">
                  <button class="page-link" @click="setPage('latest', pageState.latest - 1)">前へ</button>
                </li>
                <li v-for="p in latestTotalPages" :key="p" class="page-item" :class="{ active: pageState.latest === p }">
                  <button class="page-link" @click="setPage('latest', p)">{{ p }}</button>
                </li>
                <li class="page-item" :class="{ disabled: pageState.latest === latestTotalPages }">
                  <button class="page-link" @click="setPage('latest', pageState.latest + 1)">次へ</button>
                </li>
              </ul>
            </nav>
          </div>

          <!-- 重要 -->
          <div class="mb-4">
            <div class="p-3 bg-light border-start border-danger rounded">
              <h2>{{ label }} に関する重要な情報</h2>
            </div>

            <div class="label-row">
              <span class="post-labels-title">投稿ラベル</span>
              <label-box :labels="[label, importantSub]"></label-box>
            </div>

            <div class="d-flex flex-wrap gap-2 mt-3 mb-3">
              <button type="button"
                      class="btn btn-outline-success btn-sm rounded-pill"
                      @click="copyAndNavigate([label, importantSub])">
                新しい記事を投稿し、ここに表示する
              </button>
              <button type="button"
                      class="btn btn-outline-secondary btn-sm rounded-pill"
                      @click="openHelpModal(label + ' と ' + importantSub)">
                ヘルプ
              </button>
            </div>

            <div v-if="importantTotal > importantLimit" class="mb-3">
              <button type="button"
                      class="btn btn-outline-primary btn-sm rounded-pill"
                      @click="toggleShowList('important')">
                {{ showListState.important ? '閉じる' : '一覧を見る (全' + importantTotal + '件)' }}
              </button>
            </div>

            <div class="row row-cols-1 row-cols-md-2 g-3">
              <div v-for="item in displayImportant" :key="item.id" class="col">
                <div class="card h-100">
                  <div class="card-body">
                    <h5 class="card-title">
                      <a :href="item.link" class="fw-bold text-primary text-decoration-none">
                        <span v-if="item.categories.includes('重要')" class="badge-pill-important">重要</span>
                        <span v-if="item.categories.includes('基本')" class="badge-pill-basic">基本</span>
                        {{ item.title }}
                      </a>
                    </h5>
                    <div class="text-muted small mb-2">
                      <i class="bi bi-calendar3 me-1"></i>{{ formatDate(item.published) }}
                    </div>
                    <p class="card-text small text-secondary">{{ item.content.slice(0, 200) }}...</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 重要: ページネーション -->
            <nav v-if="showListState.important && importantTotalPages > 1" class="mt-3">
              <ul class="pagination pagination-sm justify-content-center mb-0">
                <li class="page-item" :class="{ disabled: pageState.important === 1 }">
                  <button class="page-link" @click="setPage('important', pageState.important - 1)">前へ</button>
                </li>
                <li v-for="p in importantTotalPages" :key="p" class="page-item" :class="{ active: pageState.important === p }">
                  <button class="page-link" @click="setPage('important', p)">{{ p }}</button>
                </li>
                <li class="page-item" :class="{ disabled: pageState.important === importantTotalPages }">
                  <button class="page-link" @click="setPage('important', pageState.important + 1)">次へ</button>
                </li>
              </ul>
            </nav>
          </div>

          <!-- 基本 -->
          <div class="mb-4">
            <div class="p-3 bg-light border-start border-danger rounded">
              <h2>{{ label }} に関する基本の情報</h2>
            </div>

            <div class="label-row">
              <span class="post-labels-title">投稿ラベル</span>
              <label-box :labels="[label, basicSub]"></label-box>
            </div>

            <div class="d-flex flex-wrap gap-2 mt-3 mb-3">
              <button type="button"
                      class="btn btn-outline-success btn-sm rounded-pill"
                      @click="copyAndNavigate([label, basicSub])">
                新しい記事を投稿し、ここに表示する
              </button>
              <button type="button"
                      class="btn btn-outline-secondary btn-sm rounded-pill"
                      @click="openHelpModal(label + ' と ' + basicSub)">
                ヘルプ
              </button>
            </div>

            <div v-if="basicTotal > basicLimit" class="mb-3">
              <button type="button"
                      class="btn btn-outline-primary btn-sm rounded-pill"
                      @click="toggleShowList('basic')">
                {{ showListState.basic ? '閉じる' : '一覧を見る (全' + basicTotal + '件)' }}
              </button>
            </div>

            <div class="row row-cols-1 row-cols-md-2 g-3">
              <div v-for="item in displayBasic" :key="item.id" class="col">
                <div class="card h-100">
                  <div class="card-body">
                    <h5 class="card-title">
                      <a :href="item.link" class="fw-bold text-primary text-decoration-none">
                        <span v-if="item.categories.includes('重要')" class="badge-pill-important">重要</span>
                        <span v-if="item.categories.includes('基本')" class="badge-pill-basic">基本</span>
                        {{ item.title }}
                      </a>
                    </h5>
                    <div class="text-muted small mb-2">
                      <i class="bi bi-calendar3 me-1"></i>{{ formatDate(item.published) }}
                    </div>
                    <p class="card-text small text-secondary">{{ item.content.slice(0, 200) }}...</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 基本: ページネーション -->
            <nav v-if="showListState.basic && basicTotalPages > 1" class="mt-3">
              <ul class="pagination pagination-sm justify-content-center mb-0">
                <li class="page-item" :class="{ disabled: pageState.basic === 1 }">
                  <button class="page-link" @click="setPage('basic', pageState.basic - 1)">前へ</button>
                </li>
                <li v-for="p in basicTotalPages" :key="p" class="page-item" :class="{ active: pageState.basic === p }">
                  <button class="page-link" @click="setPage('basic', p)">{{ p }}</button>
                </li>
                <li class="page-item" :class="{ disabled: pageState.basic === basicTotalPages }">
                  <button class="page-link" @click="setPage('basic', pageState.basic + 1)">次へ</button>
                </li>
              </ul>
            </nav>
          </div>

          <!-- ヘルプモーダル -->
          <div v-if="isHelpModalOpen" class="custom-modal-overlay" @click.self="closeHelpModal">
            <div class="custom-modal-content">
              <h4 class="mb-3">投稿手順のヘルプ</h4>
              
              <!-- 一語のみの場合 -->
              <ol v-if="!helpModalText.includes(' と ')">
                <li>この[ヘルプ]のボタンの隣にある[新しい記事を投稿し、ここに表示する]ボタンをクリックしてください。</li>
                <li>Google Blogger にログイン(サインイン)していない場合には、ログイン(サインイン)してください。</li>
                <li>ダッシュボード(管理画面)を開いて[投稿]を選択します。</li>
                <li>[+新しい投稿]ボタンをクリックして投稿エディタを開きます。</li>
                <li><b>{{ helpModalText }}</b> をラベルの欄に書き込みます。<b>{{ helpModalText }}</b> の文字列が自動的にクリップボードにコピーされていますので、ラベルの欄に貼り付けて(ペーストして)ください。</li>
                <li>続いて、記事のタイトルと本文を書き、書き終わったら、[公開]ボタンをクリックして公開してください。</li>
              </ol>

              <!-- 複数語の場合 -->
              <ol v-else>
                <li>この[ヘルプ]のボタンの隣にある[新しい記事を投稿し、ここに表示する]ボタンをクリックしてください。</li>
                <li>Google Blogger にログイン(サインイン)していない場合には、ログイン(サインイン)してください。</li>
                <li>ダッシュボード(管理画面)を開いて[投稿]を選択します。</li>
                <li>[+新しい投稿]ボタンをクリックして投稿エディタを開きます。</li>
                <li><b>{{ helpModalText }}</b> をカンマ(,)で区切ってラベルの欄に書き込みます。<b>{{ helpModalText }}</b> の文字列が自動的にクリップボードにコピーされていますので、ラベルの欄に貼り付けて(ペーストして)ください。</li>
                <li>続いて、記事のタイトルと本文を書き、書き終わったら、[公開]ボタンをクリックして公開してください。</li>
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