// navbar-es.js
// Bootstrap 5 の Navbar を ES6 だけで生成して固定ページに挿入する

document.addEventListener("DOMContentLoaded", () => {

  // 固定ページ内の <navbar1> を探す
  const mountPoint = document.querySelector("navbar1");
  if (!mountPoint) return;

  // Blogger のブログタイトルをテーマXMLから取得
  const titleEl = document.getElementById("blog-title-source");
  const blogTitle = titleEl ? titleEl.textContent.trim() : "My Blogger";

  // Navbar の HTML（Bootstrap 5）
  const navbarHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark navbar-marine">
      <div class="container">

        <a class="navbar-brand" href="/">
          ${blogTitle}
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
  `;

  // mountPoint に挿入
  mountPoint.innerHTML = navbarHTML;
});
