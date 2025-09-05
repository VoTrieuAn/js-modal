const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

Modal.elements = [];

function Modal(options = {}) {
  const {
    templateId,
    destroyOnClose = true,
    footer = false,
    cssClass = [],
    closeMethods = ["button", "overlay", "escape"],
    onOpen,
    onClose,
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
  this._getScrollbarWidth = () => {
    if (this._scrollbarWidth) return this._scrollbarWidth;

    const div = document.createElement("div");

    Object.assign(div.style, {
      overflow: "scroll",
      position: "absolute",
      top: "-9999px",
    });

    document.body.appendChild(div);

    this._scrollbarWidth = div.offsetWidth - div.clientWidth;

    document.body.removeChild(div);

    return this._scrollbarWidth;
  };

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
      const closeBtn = this._createButton("&times;", "modal-close", this.close);
      container.append(closeBtn);
    }

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    // Append content and elements
    modalContent.append(content);
    container.append(modalContent);

    if (footer) {
      this._modalFooter = document.createElement("div");
      this._modalFooter.className = "modal-footer";

      this._renderFooterContent();
      this._renderFooterButtons();

      container.append(this._modalFooter);
    }
    this._backdrop.append(container);
    document.body.append(this._backdrop);
  };

  this.setFooterContent = (html) => {
    this._footerContent = html;
    this._renderFooterContent();
  };

  this._footerButtons = [];

  this.addFooterButton = (title, cssClass, callback) => {
    const button = this._createButton(title, cssClass, callback);

    this._footerButtons.push(button);
    this._renderFooterButtons();
  };

  this._renderFooterContent = () => {
    if (this._modalFooter && this._footerContent) {
      this._modalFooter.innerHTML = this._footerContent;
    }
  };

  this._renderFooterButtons = () => {
    if (this._modalFooter) {
      this._footerButtons.forEach((button) => {
        this._modalFooter.append(button);
      });
    }
  };

  this._createButton = (title, cssClass, callback) => {
    const button = document.createElement("button");
    button.className = cssClass;
    button.innerHTML = title;
    button.onclick = callback;

    return button;
  };

  this.open = () => {
    Modal.elements.push(this);
    if (!this._backdrop) {
      this._build();
    }

    setTimeout(() => {
      this._backdrop.classList.add("show");
    }, 0);

    // Disable scrolling
    document.body.classList.add("no-scroll");
    document.body.style.paddingRight = this._getScrollbarWidth() + "px";

    // Attach event listeners
    if (this._allowBackdropClose) {
      this._backdrop.onclick = (e) => {
        if (e.target === this._backdrop) {
          this.close();
        }
      };
    }

    if (this._allowEscapeClose) {
      document.addEventListener("keydown", this._handleEscapeKey);
    }

    this._onTransitionEnd(onOpen);

    return this._backdrop;
  };

  this._handleEscapeKey = (e) => {
    const lastModal = Modal.elements[Modal.elements.length - 1];
    if (e.key === "Escape" && this === lastModal) {
      this.close();
    }
  };

  this.close = (destroy = destroyOnClose) => {
    Modal.elements.pop();

    this._backdrop.classList.remove("show");

    if (this._allowEscapeClose) {
      document.removeEventListener("keydown", this._handleEscapeKey);
    }

    this._onTransitionEnd(() => {
      // Sẽ bị nhân bản ra nhiều
      if (this._backdrop && destroy) {
        this._backdrop.remove();
        // Cách khắc phục
        this._backdrop = null;
        this._modalFooter = null;
      }

      // Enable scrolling
      if (!Modal.elements.length) {
        document.body.classList.remove("no-scroll");
        document.body.style.paddingRight = "";
      }

      if (typeof onClose === "function") {
        onClose();
      }
    });
  };

  this.destroy = () => {
    this.close(true);
  };

  this._onTransitionEnd = (callback) => {
    this._backdrop.ontransitionend = (e) => {
      if (e.propertyName !== "transform") return;
      if (typeof callback === "function") callback();
    };
  };
}

const modal = new Modal({
  templateId: "modal-1",
  destroyOnClose: false,
  cssClass: ["class-1", "class-2"],
  onOpen: () => {
    console.log("Modal Open 1");
  },
  onClose: () => {
    console.log("Modal close 1");
  },
});
// modal.open("<h1>Hello An Vo </h1>");
$("#open-modal-1").onclick = () => {
  modal.open();
};

const modal2 = new Modal({
  templateId: "modal-2",
  onOpen: () => {
    console.log("Modal Open 2");
  },
  onClose: () => {
    console.log("Modal close 2");
  },
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

const modal3 = new Modal({
  templateId: "modal-3",
  closeMethods: ["escape"],
  footer: true,
  onOpen: () => {
    console.log("Modal Open 3");
  },
  onClose: () => {
    console.log("Modal close 3");
  },
});

// modal3.setFooterContent("<h2>Xin chào Võ Triều An</h2>");
// modal3.addFooterButton("Danger", "modal-btn danger pull-left", (e) => {
//   alert("Danger clicked");
// });

modal3.addFooterButton("Cancel", "modal-btn", (e) => {
  modal3.close();
});

modal3.addFooterButton("<span>Agree</span>", "modal-btn primary", (e) => {
  // ...Something
  modal3.close();
});

$("#open-modal-3").onclick = () => {
  modal3.open();
};

// Yêu cầu
// 0. Tạo ra từng đối tượng modal để dễ quản lý (tick)
// 1. modal.open() (tick)
// 2. modal.close() ==> Chỉ gỡ class show chứ chưa gỡ khỏi DOM (tick)
// 3. modal.setFooterContent("Html string"); (tick)
// 4. modal.addFooterButton("Cancel", "class-1 class-2", (e) => {}) (tick)
// 5. modal.addFooterButton("Agree", "class-3 class-4", (e) => {}) (tick)
// 6. modal.destroy() ==> Gỡ khởi DOM luôn (tick)
// Chia yêu cầu làm 2 loại
// 1. Yêu cầu độc lập không phụ thuộc
// 2. Yêu cầu phụ thuộc
