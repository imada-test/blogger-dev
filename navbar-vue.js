// navbar-vue.js
// Vue 3 は既に script-no-w3css.js 内で読み込まれている前提

// Bootstrap Navbar を Vue コンポーネント化
const Navbar1 = {
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark navbar-marine">
      <div class="container">

        <!-- ブログタイトル（テーマXML内の #blog-title-source から取得） -->
        <a class="navbar-brand" href="/">
          {{ blogTitle }}
        </a>

        <button class="navbar-toggler" type="button"
          data-bs-toggle="collapse" data-bs-target="#mainNavbar">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNavbar">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">

            <li class="nav-item">
              <a class="nav-link" href="/">ホーム</a>
            </li>

            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="dropdownMenu"
                 role="button" data-bs-toggle="dropdown" aria-expanded="false">
                メニュー
              </a>

              <ul class="dropdown-menu" aria-labelledby="dropdownMenu">
                <li><a class="dropdown-item" href="/search/label/News">ニュース</a></li>
                <li><a class="dropdown-item" href="/p/about.html">このブログについて</a></li>
                <li><a class="dropdown-item" href="/p/contact.html">お問い合わせ</a></li>
              </ul>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  `,
  data() {
    return {
      blogTitle: ""
    };
  },
  mounted() {
    const titleEl = document.getElementById("blog-title-source");
    if (titleEl) {
      this.blogTitle = titleEl.textContent.trim();
    }
  }
};

// Vue アプリを作成して navbar1 タグにマウント
document.addEventListener("DOMContentLoaded", () => {
  const el = document.querySelector("navbar1");
  if (el) {
    Vue.createApp({ components: { Navbar1 } }).mount(el);
  }
});
