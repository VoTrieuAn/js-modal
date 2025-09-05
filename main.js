const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

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

    if (footer) {
      this._modalFooter = document.createElement("div");
      this._modalFooter.className = "modal-footer";
      console.log(this._footerContent);

      if (this._footerContent) {
        this._modalFooter.innerHTML = this._footerContent;
      }

      this._footerButtons.forEach((button) => {
        this._modalFooter.append(button);
      });
      container.append(this._modalFooter);
    }
    this._backdrop.append(container);
    document.body.append(this._backdrop);
  };

  this.setFooterContent = (html) => {
    this._footerContent = html;
    if (this._modalFooter) {
      this._modalFooter.innerHTML = html;
    }
  };

  this._footerButtons = [];

  this.addFooterButton = (title, cssClass, callback) => {
    const button = document.createElement("button");
    button.className = cssClass;
    button.innerHTML = title;
    button.onclick = callback;

    this._footerButtons.push(button);
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

    this._onTransitionEnd(() => {
      if (typeof onOpen === "function") onOpen();
    });

    return this._backdrop;
  };

  this.close = (destroy = destroyOnClose) => {
    this._backdrop.classList.remove("show");

    this._onTransitionEnd(() => {
      // Sẽ bị nhân bản ra nhiều
      if (this._backdrop && destroy) {
        this._backdrop.remove();
        // Cách khắc phục
        this._backdrop = null;
        this._modalFooter = null;
      }

      // Enable scrolling
      document.body.classList.remove("no-scroll");
      document.body.style.paddingRight = "";

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
  closeMethods: [],
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
modal3.open();

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
