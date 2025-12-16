const imgModal = document.getElementById("img-modal");
const imgModalTarget = document.getElementById("img-modal-target");

if (!imgModal || !imgModalTarget) {
    console.warn("Zoom modal no encontrado en el DOM");
} else {
    const imgModalBackdrop = imgModal.querySelector(".img-modal__backdrop");
    const imgModalClose = imgModal.querySelector(".img-modal__close");

    window.openImageModal = function (src, alt = "") {
        console.log("ZOOM");
        imgModalTarget.src = src;
        imgModalTarget.alt = alt;
        imgModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    };

    function closeImageModal() {
        // limpiar después de la animación
        setTimeout(() => {
            imgModalTarget.src = "";
        }, 200);
        document.body.style.overflow = "";

        imgModalClose.blur(); // 🔑 quitar foco antes
        imgModal.setAttribute("aria-hidden", "true");
    }

    imgModalBackdrop?.addEventListener("click", (e) => {
        e.stopPropagation();
        closeImageModal();
    });
    imgModalClose?.addEventListener("click", closeImageModal);

    document.addEventListener("keydown", (e) => {
        if (
            e.key === "Escape" &&
            imgModal.getAttribute("aria-hidden") === "false"
        ) {
            closeImageModal();
        }
    });
}
