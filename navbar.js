// navbar.js — Bootstrap5 Navbar を Blogger 固定ページに自動挿入する

document.addEventListener("DOMContentLoaded", () => {

  // Navbar HTML を #navbar に挿入
  const navbarHTML = `
<nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
  <div class="container">
    <a class="navbar-brand" href="/">My Blogger</a>

    <button class="navbar-toggler" type="button"
      data-bs-toggle="collapse" data-bs-target="#mainNavbar"
      aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="mainNavbar">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">

        <li class="nav-item">
          <a class="nav-link" href="/">ホーム</a>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="/search/label/News">ニュース</a>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="/p/about.html">このブログについて</a>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="/p/contact.html">お問い合わせ</a>
        </li>

      </ul>
    </div>
  </div>
</nav>

<!-- navbar が fixed-top なので本文が隠れないように余白を追加 -->
<div style="height:70px;"></div>
`;

  const target = document.getElementById("navbar");
  if (target) {
    target.innerHTML = navbarHTML;
  }
});

