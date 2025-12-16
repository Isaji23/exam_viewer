const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.dataset.theme = "dark";
    themeToggle.querySelector(".theme-toggle__icon").textContent = "☀️";
  } else {
    delete document.body.dataset.theme;
    themeToggle.querySelector(".theme-toggle__icon").textContent = "🌙";
  }
}

themeToggle.addEventListener("click", () => {
  const isDark = document.body.dataset.theme === "dark";
  const newTheme = isDark ? "light" : "dark";

  applyTheme(newTheme);
  localStorage.setItem("theme", newTheme);
});

/* Cargar preferencia */
const savedTheme = localStorage.getItem("theme");
applyTheme(savedTheme === "dark" ? "dark" : "light");
