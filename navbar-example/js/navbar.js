document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("navbar-container");

  if (!container) {
    return;
  }

  try {
    const response = await fetch("https://blogger-dev.imada-test.workers.dev/navbar-example/navbar.html");

    if (!response.ok) {
      throw new Error(`navbar.html の読み込みに失敗しました: ${response.status}`);
    }

    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    console.error(error);
  }
});
