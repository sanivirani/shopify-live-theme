import { morph } from "@theme/morph";
import { Component } from "@theme/component";
import { CartUpdateEvent, ThemeEvents } from "@theme/events";
import { DialogComponent, DialogCloseEvent } from "@theme/dialog";
import { mediaQueryLarge, isMobileBreakpoint } from "@theme/utilities";

const GIFT_VARIANT_ID = "50498751037656"; // ← Your gift variant ID


export class QuickAddComponent extends Component {
  /** @type {AbortController | null} */
  #abortController = null;
  /** @type {Document | null} */
  #cachedProductHtml = null;

  get cachedProductHtml() {
    return this.#cachedProductHtml;
  }

  get productPageUrl() {
    return /** @type {HTMLAnchorElement} */ (
      this.closest("product-card")?.querySelector('a[ref="productCardLink"]')
    )?.href;
  }

  connectedCallback() {
    super.connectedCallback();

    mediaQueryLarge.addEventListener("change", this.#closeQuickAddModal);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    mediaQueryLarge.removeEventListener("change", this.#closeQuickAddModal);
  }

  /**
   * Handles quick add button click
   * @param {Event} event - The click event
   */
  // handleClick = async (event) => {
  //   event.preventDefault();

  //   if (!this.#cachedProductHtml) {
  //     await this.fetchProductPage(this.productPageUrl);
  //   }

  //   if (this.#cachedProductHtml) {
  //     // Create a fresh copy of the cached HTML to avoid modifying the original
  //     const freshHtmlCopy = new DOMParser().parseFromString(
  //       this.#cachedProductHtml.documentElement.outerHTML,
  //       'text/html'
  //     );

  //     await this.updateQuickAddModal(freshHtmlCopy);
  //   }

  //   this.#openQuickAddModal();
  // };

  // custom script for open model
  handleClick = async (event) => {
    event.preventDefault();

    if (!this.#cachedProductHtml) {
      await this.fetchProductPage(this.productPageUrl);
    }

    if (!this.#cachedProductHtml) return;

      const freshHtmlCopy = new DOMParser().parseFromString(
        this.#cachedProductHtml.documentElement.outerHTML,
      "text/html"
    );

    const variantElements = freshHtmlCopy.querySelectorAll('[name="id"]');
    const hasMultipleVariants = variantElements.length > 1;

    // If only one variant, submit the form directly
    // if (!hasMultipleVariants) {
    //   const form = this.querySelector('form');
    //   if (form) {
    //     form.requestSubmit(); // Triggers native submit
    //   }
    //   return;
    // }

    // custom toast message
    if (!hasMultipleVariants) {
      const form = this.closest("product-card")?.querySelector(
        'form[action="/cart/add"]'
      );

      if (form) {
        const formData = new FormData(form);

        try {
          const response = await fetch(form.action, {
            method: form.method,
            headers: {
              Accept: "application/json",
            },
            body: formData,
          });

          const data = await response.json();

          if (response.ok) {
            // Dispatch a cart update event for theme to listen
            const cartUpdateEvent = new CustomEvent(ThemeEvents.cartUpdate, {
              detail: { data },
              bubbles: true,
            });
            this.dispatchEvent(cartUpdateEvent);

            // Optionally: show toast manually
            this.#showSuccessToast();
            this.#addGiftProductIfEligible(); // 🎁 Add gift via AJAX

          } else {
            console.warn("Add to cart failed", data);
          }
        } catch (err) {
          console.error("Cart add error:", err);
        } 
      }

      return;
    }

    // Otherwise, open modal
    await this.updateQuickAddModal(freshHtmlCopy);
    this.#openQuickAddModal();
  };

  // custom toast meassge trigger fn
  #showSuccessToast() {
    const toast = document.createElement("div");
    toast.className = "quick-add-toast";
    toast.textContent = "Added to cart!";
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("visible"), 10);

    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  /** @param {QuickAddDialog} dialogComponent */
  #stayVisibleUntilDialogCloses(dialogComponent) {
    this.toggleAttribute("stay-visible", true);

    dialogComponent.addEventListener(
      DialogCloseEvent.eventName,
      () => this.toggleAttribute("stay-visible", false),
      {
      once: true,
      }
    );
  }

  #openQuickAddModal = () => {
    const dialogComponent = document.getElementById("quick-add-dialog");
    if (!(dialogComponent instanceof QuickAddDialog)) return;

    this.#stayVisibleUntilDialogCloses(dialogComponent);

    dialogComponent.showDialog();
  };

  #closeQuickAddModal = () => {
    const dialogComponent = document.getElementById("quick-add-dialog");
    if (!(dialogComponent instanceof QuickAddDialog)) return;

    dialogComponent.closeDialog();
  };

  /**
   * Fetches the product page content
   * @param {string} productPageUrl - The URL of the product page to fetch
   * @returns {Promise<void>}
   * @throws {Error} If the fetch request fails or returns a non-200 response
   */
  async fetchProductPage(productPageUrl) {
    if (!productPageUrl) return;

    // We use this to abort the previous fetch request if it's still pending.
    this.#abortController?.abort();
    this.#abortController = new AbortController();

    try {
      const response = await fetch(productPageUrl, {
        signal: this.#abortController.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch product page: HTTP error ${response.status}`
        );
      }

      const responseText = await response.text();
      const html = new DOMParser().parseFromString(responseText, "text/html");

      // Store the HTML for later use
      this.#cachedProductHtml = html;
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      } else {
        throw error;
      }
    } finally {
      this.#abortController = null;
    }
  }

  /**
   * Re-renders the variant picker.
   * @param {Document} newHtml - The new HTML.
   */
  async updateQuickAddModal(newHtml) {
    const productGrid = newHtml.querySelector("[data-product-grid-content]");
    const modalContent = document.getElementById("quick-add-modal-content");

    if (!productGrid || !modalContent) return;

    if (isMobileBreakpoint()) {
      const productDetails = productGrid.querySelector(".product-details");
      if (!productDetails) return;
      const productFormComponent = productGrid.querySelector(
        "product-form-component"
      );
      const variantPicker = productGrid.querySelector("variant-picker");
      const productPrice = productGrid.querySelector("product-price");
      const productTitle = document.createElement("a");
      productTitle.textContent = this.dataset.productTitle || "";

      // Make product title as a link to the product page
      productTitle.href = this.productPageUrl;

      if (
        !productFormComponent ||
        !variantPicker ||
        !productPrice ||
        !productTitle
      )
        return;

      const productHeader = document.createElement("div");
      productHeader.classList.add("product-header");

      productHeader.appendChild(productTitle);
      productHeader.appendChild(productPrice);
      productGrid.appendChild(productHeader);
      productGrid.appendChild(variantPicker);
      productGrid.appendChild(productFormComponent);
      productDetails.remove();
    }

    morph(modalContent, productGrid);
  }

   #addGiftProductIfEligible = async () => {
    try {
      const cart = await fetch("/cart.js").then((res) => res.json());
      const giftInCart = cart.items.find(
        (item) => String(item.variant_id) === GIFT_VARIANT_ID
      );

      if (giftInCart) return;

      const giftData = new FormData();
      giftData.append("id", GIFT_VARIANT_ID);
      giftData.append("quantity", "1");
      giftData.append("properties[_is_gift]", "true");

      const giftResponse = await fetch("/cart/add.js", {
        method: "POST",
        body: giftData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!giftResponse.ok) {
        console.warn("Gift add failed", await giftResponse.json());
      } else {
        console.log("🎁 Gift added successfully");
      }
    } catch (err) {
      console.error("Gift add error", err);
    }
  };


}

if (!customElements.get("quick-add-component")) {
  customElements.define("quick-add-component", QuickAddComponent);
}

class QuickAddDialog extends DialogComponent {
  #abortController = new AbortController();

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener(ThemeEvents.cartUpdate, this.handleCartUpdate, {
      signal: this.#abortController.signal,
    });
    this.addEventListener(
      ThemeEvents.variantUpdate,
      this.#updateProductTitleLink
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.#abortController.abort();
  }

  /**
   * Closes the dialog
   * @param {CartUpdateEvent} event - The cart update event
   */
  handleCartUpdate = (event) => {
    if (event.detail.data.didError) return;
    this.closeDialog();
  };

  #updateProductTitleLink = (/** @type {CustomEvent} */ event) => {
    const anchorElement = /** @type {HTMLAnchorElement} */ (
      event.detail.data.html?.querySelector(".view-product-title a")
    );
    const viewMoreDetailsLink = /** @type {HTMLAnchorElement} */ (
      this.querySelector(".view-product-title a")
    );
    const mobileProductTitle = /** @type {HTMLAnchorElement} */ (
      this.querySelector(".product-header a")
    );

    if (!anchorElement) return;

    if (viewMoreDetailsLink) viewMoreDetailsLink.href = anchorElement.href;
    if (mobileProductTitle) mobileProductTitle.href = anchorElement.href;
  };
}

if (!customElements.get('quick-add-dialog')) {
  customElements.define('quick-add-dialog', QuickAddDialog);
}
