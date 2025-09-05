const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function Modal(options = {}) {
  const {
    templateId,
    destroyOnClose = true,
    cssClass = [],
    closeMethods = ["button", "overlay", "escape"],
  } = options;
  const template = $(`#${templateId}`);

  if (!template) {
    console.error(`#${templateId} dose not exist`);
    return;
  }

  // Khi đặt tên dấu gạch dưới trước phương thức, thì sẽ ngầm hiểu là không dùng nó ở đối tượng new [Object]()._allowBackdropClose
  this._allowButtonClose = closeMethods.includes("button");
  this._allowBackdropClose = closeMethods.includes("overlay");
  this._allowEscapeClose = closeMethods.includes("escape");
  // Caching value
  function getScrollbarWidth() {
    if (getScrollbarWidth.value) {
      return getScrollbarWidth.value;
    }
    const div = document.createElement("div");

    Object.assign(div.style, {
      overflow: "scroll",
      position: "absolute",
      top: "-9999px",
    });

    document.body.appendChild(div);

    const scrollbarWidth = div.offsetWidth - div.clientWidth;

    document.body.removeChild(div);

    getScrollbarWidth.value = scrollbarWidth;

    return scrollbarWidth;
  }
  this._build = () => {
    /**
     * cloneNode(boolean)
     * Dùng để nhân bản Node
     * true: Nếu muốn nhân bản luôn phần tử con, chỉ nhân bản phần tử KHÔNG nhân bản phần xử lý sự kiện
     * false: Nếu chỉ muốn lấy cha (default)
     */
    const content = template.content.cloneNode(true);

    // Create modal elements
    this._backdrop = document.createElement("div");
    this._backdrop.className = "modal-backdrop";

    const container = document.createElement("div");
    container.className = "modal-container";

    cssClass.forEach((className) => {
      if (typeof className === "string") {
        container.classList.add(className);
      }
    });

    if (this._allowButtonClose) {
      const closeBtn = document.createElement("div");
      closeBtn.className = "modal-close";
      closeBtn.innerHTML = "&times;";

      container.append(closeBtn);

      closeBtn.onclick = () => {
        this.close(this._backdrop);
      };
    }

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    // Append content and elements
    modalContent.append(content);
    container.append(modalContent);
    this._backdrop.append(container);
    document.body.append(this._backdrop);
  };

  this.open = () => {
    if (!this._backdrop) {
      this._build();
    }

    setTimeout(() => {
      this._backdrop.classList.add("show");
    }, 0);

    // Disable scrolling
    document.body.classList.add("no-scroll");
    document.body.style.paddingRight = getScrollbarWidth() + "px";

    // Attach event listeners
    if (this._allowBackdropClose) {
      this._backdrop.onclick = (e) => {
        if (e.target === this._backdrop) {
          this.close();
        }
      };
    }

    if (this._allowEscapeClose) {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.close();
        }
      });
    }

    return this._backdrop;
  };

  this.close = (destroy = destroyOnClose) => {
    this._backdrop.classList.remove("show");
    this._backdrop.ontransitionend = () => {
      // Sẽ bị nhân bản ra nhiều
      if (this._backdrop && destroy) {
        this._backdrop.remove();
        // Cách khắc phục
        this._backdrop = null;
      }

      // Enable scrolling
      document.body.classList.remove("no-scroll");
      document.body.style.paddingRight = "";
    };
  };

  this.destroy = () => {
    this.close(true);
  };
}

const modal = new Modal({
  templateId: "modal-1",
  destroyOnClose: false,
  cssClass: ["class-1", "class-2"],
});
// modal.open("<h1>Hello An Vo </h1>");
$("#open-modal-1").onclick = () => {
  modal.open();
};

const modal2 = new Modal({
  templateId: "modal-2",
});

$("#open-modal-2").onclick = () => {
  const modalElement = modal2.open();

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

// Yêu cầu
// 0. Tạo ra từng đối tượng modal để dễ quản lý
// 1. modal.open()
// 2. modal.close() ==> Chỉ gỡ class show chứ chưa gỡ khỏi DOM
// 3. modal.setFooterContent("Html string");
// 4. modal.addFooterButton("Cancel", "class-1 class-2", (e) => {})
// 5. modal.addFooterButton("Agree", "class-3 class-4", (e) => {})
// 6. modal.destroy() ==> Gỡ khởi DOM luôn
// Chia yêu cầu làm 2 loại
// 1. Yêu cầu độc lập không phụ thuộc
// 2. Yêu cầu phụ thuộc
