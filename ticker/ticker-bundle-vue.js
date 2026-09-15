(function () {
  // 1. Vue 3 ライブラリを動的に読み込む関数
  function loadVue(callback) {
    if (window.Vue) {
      callback();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/vue@3/dist/vue.global.prod.js";
    script.onload = callback;
    document.head.appendChild(script);
  }

  // 2. CSS スタイルを動的に追加する関数
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      #tickerUnified .ticker-box {
        width: 100%;
        height: 40px;
        overflow: hidden;
        border: 2px solid #000;
        font-family: monospace;
        font-weight: bold;
        display: flex;
        align-items: center;
        position: relative;
      }
      #tickerUnified .ticker-box span {
        white-space: nowrap;
        position: absolute;
        left: 100%;
      }
      #tickerUnified .ticker-link {
        display: inline-block;
        font-size: 12px;
        color: #003366;
        background: #fff;
        border: 2px solid #003366;
        padding: 6px 14px;
        margin: 10px 0 20px 0;
        border-radius: 999px;
        text-decoration: none;
        font-weight: bold;
      }
      .ticker-emergency { background: #ffff00; color: #ff0000; }
      .ticker-emergency span { color: #ff0000; }
      .ticker-normal { background: #001a33; color: #fff; }
      .ticker-normal span { color: #fff; }
    `;
    document.head.appendChild(style);
  }

  // 3. アプリケーションの初期化
  function initApp() {
    injectStyles();

    // スクリプトが読み込まれた位置にマウント用コンテナを自動生成
    let targetEl = document.getElementById("tickerUnified");
    if (!targetEl) {
      targetEl = document.createElement("div");
      targetEl.id = "tickerUnified";
      // 現在の script タグの直前に挿入
      const currentScript = document.currentScript;
      if (currentScript && currentScript.parentNode) {
        currentScript.parentNode.insertBefore(targetEl, currentScript);
      } else {
        document.body.appendChild(targetEl);
      }
    }

    // Vue 3 Component (Options API)
    const TickerApp = {
      data() {
        return {
          activeTickers: [],
          animationFrameId: null,
        };
      },
      mounted() {
        this.fetchPosts();
      },
      beforeUnmount() {
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
        }
      },
      methods: {
        normalizeLabel(str) {
          if (!str) return "";
          return str
            .replace(/[\u200B\uFEFF\u00A0]/g, "")
            .replace(/\u3000/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        },
        async fetchPosts() {
          const isHome = window.location.pathname === "/";
          const today = new Date();

          try {
            const response = await fetch("/feeds/posts/default?alt=json&max-results=150");
            const data = await response.json();
            const entries = data.feed?.entry || [];
            const filtered = [];

            for (const entry of entries) {
              const rawLabels = (entry.category || []).map((c) => c.term);
              const labels = rawLabels.map((lb) => this.normalizeLabel(lb));

              const isTicker = labels.some(
                (lb) => lb.includes("電光掲示板") || lb.includes("緊急電光掲示板")
              );
              if (!isTicker) continue;

              const reStart = /表示開始日 *\d{4}-\d{1,2}-\d{1,2}/;
              const startLabel = labels.find((lb) => reStart.test(lb));
              if (startLabel) {
                const dateStr = startLabel.match(/\d{4}-\d{1,2}-\d{1,2}/)[0];
                if (today < new Date(dateStr)) continue;
              }

              const reExpire = /表示期限日 *\d{4}-\d{1,2}-\d{1,2}/;
              const expireLabel = labels.find((lb) => reExpire.test(lb));
              if (expireLabel) {
                const dateStr = expireLabel.match(/\d{4}-\d{1,2}-\d{1,2}/)[0];
                if (today > new Date(dateStr)) continue;
              }

              const hasEmergencyBoard = labels.includes("緊急電光掲示板");
              const hasEmergency = labels.includes("緊急");
              const hasAll = labels.includes("全記事");
              const hasDenkou = labels.includes("電光掲示板");

              let mode = "normal";
              if (hasEmergencyBoard || (hasDenkou && hasEmergency)) {
                mode = "emergency";
              } else if (hasDenkou && hasAll) {
                mode = "all";
              } else {
                mode = "home";
              }

              if (mode === "home" && !isHome) continue;

              filtered.push({
                title: entry.title?.$t || "",
                link: entry.link?.find((l) => l.rel === "alternate")?.href || "#",
                mode,
                pos: 0,
              });
            }

            this.activeTickers = filtered;

            this.$nextTick(() => {
              this.initScrollPositions();
              this.startAnimation();
            });
          } catch (e) {
            console.error("Ticker fetch error:", e);
          }
        },
        initScrollPositions() {
          const boxes = this.$refs.boxes;
          if (!boxes) return;
          this.activeTickers.forEach((item, index) => {
            const boxEl = Array.isArray(boxes) ? boxes[index] : boxes;
            if (boxEl) item.pos = boxEl.offsetWidth;
          });
        },
        startAnimation() {
          const step = () => {
            const boxes = this.$refs.boxes;
            const spans = this.$refs.spans;
            if (boxes && spans) {
              this.activeTickers.forEach((item, index) => {
                const boxEl = Array.isArray(boxes) ? boxes[index] : boxes;
                const spanEl = Array.isArray(spans) ? spans[index] : spans;
                if (boxEl && spanEl) {
                  item.pos -= 1.2;
                  if (item.pos < -spanEl.offsetWidth) {
                    item.pos = boxEl.offsetWidth;
                  }
                }
              });
            }
            this.animationFrameId = requestAnimationFrame(step);
          };
          this.animationFrameId = requestAnimationFrame(step);
        },
      },
      template: `
        <div>
          <div v-for="(item, index) in activeTickers" :key="index">
            <div ref="boxes" class="ticker-box" :class="item.mode === 'emergency' ? 'ticker-emergency' : 'ticker-normal'">
              <span ref="spans" :style="{ left: item.pos + 'px' }">{{ item.title }}</span>
            </div>
            <a :href="item.link" class="ticker-link">記事を読む</a>
          </div>
        </div>
      `,
    };

    // App の作成とマウント
    Vue.createApp(TickerApp).mount(targetEl);
  }

  // 実行指示：Vue の存在を確認してから起動
  loadVue(initApp);
})();