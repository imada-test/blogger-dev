// --- Vue 読み込み（navbar.js 内で読み込む） ---
import('https://cdn.jsdelivr.net/npm/vue@3.4.0/dist/vue.global.prod.js').then(() => {

  const { createApp } = Vue;

  // --- 外部 JSON の URL（ GitHub Pages に置く想定） ---
  const NAVBAR_JSON_URL = "https://imada-test.github.io/blogger-dev/navbar.json";

  // --- Navbar コンポーネント ---
  const Navbar1 = {
    data() {
      return {
        items: [],       // JSON のメニュー項目
        loaded: false,   // 読み込み完了フラグ
        error: null      // エラー内容
      };
    },

    created() {
      // JSON を読み込む
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

        <!-- JSON 読み込み中 -->
        <li v-if="!loaded && !error" class="nav-item">
          <span class="nav-link">Loading...</span>
        </li>

        <!-- JSON 読み込みエラー -->
        <li v-if="error" class="nav-item">
          <span class="nav-link text-danger">Error loading menu</span>
        </li>

        <!-- JSON の項目をループ -->
        <li v-for="item in items" :key="item.text" class="nav-item">
          <a class="nav-link" :href="item.href">{{ item.text }}</a>
        </li>

      </ul>

    </div>
  </div>
</nav>
    `
  };

  // --- Vue アプリを Blogger の <navbar1></navbar1> にマウント ---
  document.addEventListener("DOMContentLoaded", () => {
    const el = document.querySelector("navbar1");
    if (el) {
      createApp(Navbar1).mount(el);
    }
  });

});
