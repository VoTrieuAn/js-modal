const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function Modal() {
  this.openModal = (options = {}) => {
    const { templateId, allowBackdropClose = true } = options;
    const template = $(`#${templateId}`);

    if (!template) {
      console.error(`#${templateId} dose not exist`);
      return;
    }

    /**
     * cloneNode(boolean)
     * Dùng để nhân bản Node
     * true: Nếu muốn nhân bản luôn phần tử con, chỉ nhân bản phần tử KHÔNG nhân bản phần xử lý sự kiện
     * false: Nếu chỉ muốn lấy cha (default)
     */
    const content = template.content.cloneNode(true);

    // Create modal elements
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    const container = document.createElement("div");
    container.className = "modal-container";
    const closeBtn = document.createElement("div");
    closeBtn.className = "modal-close";
    closeBtn.innerHTML = "&times;";
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    // Append content and elements
    modalContent.append(content);
    container.append(closeBtn, modalContent);
    backdrop.append(container);
    document.body.append(backdrop);

    setTimeout(() => {
      backdrop.classList.add("show");
    }, 0);

    // Attach event listeners
    closeBtn.onclick = () => {
      this.closeModal(backdrop);
    };

    if (allowBackdropClose) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) {
          this.closeModal(backdrop);
        }
      };
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal(backdrop);
      }
    });

    // Disable scrolling
    document.body.classList.add("no-scroll");
    return backdrop;
  };

  this.closeModal = (modalElement) => {
    modalElement.classList.remove("show");
    modalElement.ontransitionend = function () {
      modalElement.remove();

      // Enable scrolling
      document.body.classList.remove("no-scroll");
    };
  };
}

const modal = new Modal();
// modal.openModal("<h1>Hello An Vo </h1>");
$("#open-modal-1").onclick = () => {
  modal.openModal({
    templateId: "modal-1",
  });
};

$("#open-modal-2").onclick = () => {
  const modalElement = modal.openModal({
    templateId: "modal-2",
    allowBackdropClose: false,
  });

  const form = modalElement.querySelector("#login-form");
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const formData = {
        email: $("#email").value.trim(),
        password: $("#password").value.trim(),
      };

      console.log(formData);
    };
  }
};

// 1. Xử lý được sự kiện submit form, lấy được các giá trị của input khi submit
// 2. Thêm tùy chọn bật/tắt cho phép click vào overlay để đóng modal
// 3. Không cho phép cuộn trang khi modal hiện thị
