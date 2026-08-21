(function () {
  // ① Vue を読み込む
  const vueScript = document.createElement("script");
  vueScript.src = "https://unpkg.com/vue@3/dist/vue.global.prod.js";
  vueScript.defer = true;

  vueScript.onload = function () {
    // Vue 読み込み完了後に実行
    const { createApp } = Vue;

    const NAVBAR_JSON_URL = "https://imada-test.github.io/blogger-dev/navbar.json";

    const Navbar1 = {
      data() {
        return {
          items: [],
          loaded: false,
          error: null
        };
      },
      created() {
        fetch(NAVBAR_JSON_URL)
          .then(res => res.json())
          .then(json => {
            this.items = json;
            this.loaded = true;
          })
          .catch(err => {
            console.error("Navbar JSON load error:", err);
            this.error = err;
          });
      },
      template: `
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container">

    <a class="navbar-brand" href="/">My Blogger</a>

    <button class="navbar-toggler" type="button"
      data-bs-toggle="collapse" data-bs-target="#mainNavbar">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="mainNavbar">

      <ul class="navbar-nav me-auto mb-2 mb-lg-0">

        <li v-if="!loaded && !error" class="nav-item">
          <span class="nav-link">Loading...</span>
        </li>

        <li v-if="error" class="nav-item">
          <span class="nav-link text-danger">Error loading menu</span>
        </li>

        <li v-for="item in items" :key="item.text" class="nav-item">
          <a class="nav-link" :href="item.href">{{ item.text }}</a>
        </li>

      </ul>

    </div>
  </div>
</nav>
      `
    };

    // DOM が準備できたら <navbar1> にマウント
    document.addEventListener("DOMContentLoaded", function () {
      const el = document.querySelector("navbar1");
      if (el) {
        createApp(Navbar1).mount(el);
      } else {
        console.warn("<navbar1> 要素が見つかりませんでした");
      }
    });
  };

  // ② head に Vue スクリプトを追加
  document.head.appendChild(vueScript);
})();
