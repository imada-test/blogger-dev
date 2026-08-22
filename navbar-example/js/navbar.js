document.addEventListener("DOMContentLoaded", async () => {
  const navbarContainer = document.getElementById("navbar-container");

  if (!navbarContainer) {
    console.error("#navbar-container が見つかりません。");
    return;
  }

  try {
    const response = await fetch("/navbar-example/navbar.html");

    if (!response.ok) {
      throw new Error(
        `navbar.html の読み込みに失敗しました。HTTPステータス: ${response.status}`
      );
    }

    const navbarHtml = await response.text();

    navbarContainer.innerHTML = navbarHtml;
  } catch (error) {
    console.error("Navigation Bar の読み込みに失敗しました:", error);

    navbarContainer.innerHTML = `
      <p style="color: red;">
        Navigation Bar を読み込めませんでした。
      </p>
    `;
  }
});
