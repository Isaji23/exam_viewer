// sidebar.js

const body = document.body;
const menuBtn = document.getElementById("menu-btn");
const overlay = document.getElementById("overlay");

function openSidebar() {
  body.classList.add("sidebar-open");
  body.classList.remove("sidebar-closed");
}

function closeSidebar() {
  body.classList.remove("sidebar-open");
  body.classList.add("sidebar-closed");
}

function toggleSidebar() {
  if (body.classList.contains("sidebar-open")) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

// Botón hamburguesa
menuBtn.addEventListener("click", toggleSidebar);

// Click fuera (overlay)
overlay.addEventListener("click", closeSidebar);

// Estado inicial
function initSidebarState() {
  if (window.innerWidth > 900) {
    body.classList.add("sidebar-open");
  } else {
    body.classList.add("sidebar-closed");
  }
}

window.addEventListener("resize", initSidebarState);
initSidebarState();
