const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

let currentModal = null;

$$("[data-modal]").forEach((btn) => {
  btn.onclick = function () {
    // Do tên attribute là data-modal nên có thể dùng dataset để lấy
    const modal = $(this.dataset.modal);
    if (modal) {
      modal.classList.add("show");
      currentModal = modal;
    } else {
      console.error(`${this.dataset.modal} dose not exist`);
    }
  };
});

$$(".modal-close").forEach((btn) => {
  btn.onclick = function () {
    const modal = this.closest(".modal-backdrop");
    if (modal) {
      modal.classList.remove("show");
      currentModal = null;
    }
  };
});

$$(".modal-backdrop").forEach((modal) => {
  modal.onclick = function (e) {
    if (e.target === this) {
      this.classList.remove("show");
      currentModal = null;
    }
  };
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    currentModal.classList.remove("show");
    currentModal = null;
  }
});
