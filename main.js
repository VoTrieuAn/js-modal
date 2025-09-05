const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

Popin.elements = [];

function Popin(options = {}) {
  this.opt = Object.assign(
    {
      destroyOnClose: true,
      footer: false,
      cssClass: [],
      closeMethods: ["button", "overlay", "escape"],
    },
    options
  );

  this.template = $(`#${this.opt.templateId}`);

  if (!this.template) {
    console.error(`#${this.opt.templateId} dose not exist`);
    return;
  }
  // Khi đặt tên dấu gạch dưới trước phương thức, thì sẽ ngầm hiểu là không dùng nó ở đối tượng new [Object]()._allowBackdropClose
  const { closeMethods } = this.opt;
  this._allowButtonClose = closeMethods.includes("button");
  this._allowBackdropClose = closeMethods.includes("overlay");
  this._allowEscapeClose = closeMethods.includes("escape");
  this._footerButtons = [];

  this._handleEscapeKey = this._handleEscapeKey.bind(this);
}

Popin.prototype._build = function () {
  /**
   * cloneNode(boolean)
   * Dùng để nhân bản Node
   * true: Nếu muốn nhân bản luôn phần tử con, chỉ nhân bản phần tử KHÔNG nhân bản phần xử lý sự kiện
   * false: Nếu chỉ muốn lấy cha (default)
   */
  const content = this.template.content.cloneNode(true);

  // Create modal elements
  this._backdrop = document.createElement("div");
  this._backdrop.className = "popin__backdrop";

  const container = document.createElement("div");
  container.className = "popin__container";

  this.opt.cssClass.forEach((className) => {
    if (typeof className === "string") {
      container.classList.add(className);
    }
  });

  if (this._allowButtonClose) {
    const closeBtn = this._createButton("&times;", "popin__close", () =>
      this.close()
    );
    container.append(closeBtn);
  }

  const modalContent = document.createElement("div");
  modalContent.className = "popin__content";
  // Append content and elements
  modalContent.append(content);
  container.append(modalContent);

  if (this.opt.footer) {
    this._modalFooter = document.createElement("div");
    this._modalFooter.className = "popin__footer";

    this._renderFooterContent();
    this._renderFooterButtons();

    container.append(this._modalFooter);
  }
  this._backdrop.append(container);
  document.body.append(this._backdrop);
};

Popin.prototype.setFooterContent = function (html) {
  this._footerContent = html;
  this._renderFooterContent();
};

Popin.prototype.addFooterButton = function (title, cssClass, callback) {
  const button = this._createButton(title, cssClass, callback);

  this._footerButtons.push(button);
  this._renderFooterButtons();
};

Popin.prototype._renderFooterContent = function () {
  if (this._modalFooter && this._footerContent) {
    this._modalFooter.innerHTML = this._footerContent;
  }
};

Popin.prototype._renderFooterButtons = function () {
  if (this._modalFooter) {
    this._footerButtons.forEach((button) => {
      this._modalFooter.append(button);
    });
  }
};

Popin.prototype._createButton = function (title, cssClass, callback) {
  const button = document.createElement("button");
  button.className = cssClass;
  button.innerHTML = title;
  button.onclick = callback;

  return button;
};

Popin.prototype.open = function () {
  Popin.elements.push(this);
  if (!this._backdrop) {
    this._build();
  }

  setTimeout(() => {
    this._backdrop.classList.add("popin--show");
  }, 0);

  // Disable scrolling
  document.body.classList.add("popin--no-scroll");
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

  this._onTransitionEnd(this.opt.onOpen);

  return this._backdrop;
};

Popin.prototype._handleEscapeKey = function (e) {
  const lastPopin = Popin.elements[Popin.elements.length - 1];
  if (e.key === "Escape" && this === lastPopin) {
    this.close();
  }
};

Popin.prototype.close = function (destroy = this.opt.destroyOnClose) {
  Popin.elements.pop();

  this._backdrop.classList.remove("popin--show");

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
    if (!Popin.elements.length) {
      document.body.classList.remove("no-scroll");
      document.body.style.paddingRight = "";
    }

    if (typeof this.opt.onClose === "function") {
      this.opt.onClose();
    }
  });
};

Popin.prototype.destroy = function () {
  this.close(true);
};

Popin.prototype._onTransitionEnd = function (callback) {
  this._backdrop.ontransitionend = (e) => {
    if (e.propertyName !== "transform") return;
    if (typeof callback === "function") callback();
  };
};

Popin.prototype._getScrollbarWidth = function () {
  // Caching value
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

const modal = new Popin({
  templateId: "modal-1",
  destroyOnClose: false,
  cssClass: ["class-1", "class-2"],
  onOpen: () => {
    console.log("Popin Open 1");
  },
  onClose: () => {
    console.log("Popin close 1");
  },
});
// modal.open("<h1>Hello An Vo </h1>");
$("#open-modal-1").onclick = () => {
  modal.open();
};

const modal2 = new Popin({
  templateId: "modal-2",
  onOpen: () => {
    console.log("Popin Open 2");
  },
  onClose: () => {
    console.log("Popin close 2");
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

const modal3 = new Popin({
  templateId: "modal-3",
  closeMethods: ["escape"],
  footer: true,
  onOpen: () => {
    console.log("Popin Open 3");
  },
  onClose: () => {
    console.log("Popin close 3");
  },
});

// modal3.setFooterContent("<h2>Xin chào Võ Triều An</h2>");
// modal3.addFooterButton("Danger", "popin__btn popin__btn--danger popin__btn--pull-left", (e) => {
//   alert("Danger clicked");
// });

modal3.addFooterButton("Cancel", "popin__btn", (e) => {
  modal3.close();
});

modal3.addFooterButton(
  "<span>Agree</span>",
  "popin__btn popin__btn--primary",
  (e) => {
    // ...Something
    modal3.close();
  }
);

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
