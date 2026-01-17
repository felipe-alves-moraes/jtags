/**
 * JtagsModal Web Component
 *
 * A modal dialog component for confirmations and alerts.
 * Library-agnostic - HTTP behavior attributes should be set in templates.
 *
 * Events emitted:
 * - jtags-modal-confirm: When confirm button is clicked (for non-HTTP confirms)
 * - jtags-modal-cancel: When cancel/escape/backdrop is clicked
 *
 * @example With slotted buttons (template adds HTTP attributes)
 * <jtags-modal open>
 *     <p slot="message">Delete 5 selected users?</p>
 *     <button slot="confirm">Confirm</button>
 *     <button slot="cancel">Cancel</button>
 * </jtags-modal>
 *
 * @example Simple usage with default buttons
 * <jtags-modal open message="Are you sure?"
 *              confirm-text="Yes" cancel-text="No">
 * </jtags-modal>
 */

export class JtagsModal extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'message', 'confirm-text', 'cancel-text'];
  }

  constructor() {
    super();
    this._initialized = false;
    this._backdrop = null;
    this._content = null;
    this._messageEl = null;
    this._confirmBtn = null;
    this._cancelBtn = null;
  }

  connectedCallback() {
    // Prevent re-initialization when element is moved
    if (this._initialized) return;
    this._initialized = true;

    this.classList.add('jtags-modal');

    // Start hidden unless open attribute is present
    if (!this.hasAttribute('open')) {
      this.classList.add('jtags-hidden');
    }

    this._buildStructure();
    this._attachEventListeners();
  }

  disconnectedCallback() {
    this._removeEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'open') {
      if (this.open) {
        this._show();
      } else {
        this._hide();
      }
    }

    if (name === 'message' && this._messageEl) {
      this._messageEl.textContent = newValue || '';
    }

    if (name === 'confirm-text' && this._confirmBtn && !this._hasSlottedConfirm()) {
      this._confirmBtn.textContent = newValue || 'Confirm';
    }

    if (name === 'cancel-text' && this._cancelBtn && !this._hasSlottedCancel()) {
      this._cancelBtn.textContent = newValue || 'Cancel';
    }
  }

  /**
   * Build the modal structure.
   * @private
   */
  _buildStructure() {
    this._content = document.createElement('div');
    this._content.classList.add('jtags-modal__content');

    // Check for slotted content
    const slottedMessage = this.querySelector('[slot="message"]');
    const slottedConfirm = this.querySelector('[slot="confirm"]');
    const slottedCancel = this.querySelector('[slot="cancel"]');

    // Message
    if (slottedMessage) {
      this._content.appendChild(slottedMessage);
      this._messageEl = slottedMessage;
    } else {
      this._messageEl = document.createElement('p');
      this._messageEl.id = 'jtags-modal-message';
      this._messageEl.textContent = this.message || '';
      this._content.appendChild(this._messageEl);
    }

    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('jtags-modal__buttons');

    // Confirm button
    if (slottedConfirm) {
      buttonContainer.appendChild(slottedConfirm);
      this._confirmBtn = slottedConfirm;
    } else {
      this._confirmBtn = document.createElement('button');
      this._confirmBtn.type = 'button';
      this._confirmBtn.classList.add('jtags-modal__confirm');
      this._confirmBtn.textContent = this.confirmText || 'Confirm';
      buttonContainer.appendChild(this._confirmBtn);
    }

    // Cancel button
    if (slottedCancel) {
      buttonContainer.appendChild(slottedCancel);
      this._cancelBtn = slottedCancel;
    } else {
      this._cancelBtn = document.createElement('button');
      this._cancelBtn.type = 'button';
      this._cancelBtn.classList.add('jtags-modal__cancel');
      this._cancelBtn.textContent = this.cancelText || 'Cancel';
      buttonContainer.appendChild(this._cancelBtn);
    }

    this._content.appendChild(buttonContainer);
    this.appendChild(this._content);
  }

  /**
   * Attach event listeners.
   * @private
   */
  _attachEventListeners() {
    // Cancel button closes modal
    this._cancelBtn?.addEventListener('click', this._handleCancel);

    // Click on backdrop closes modal
    this.addEventListener('click', this._handleBackdropClick);

    // Escape key closes modal
    this._handleEscapeKey = this._handleEscapeKey.bind(this);
    document.addEventListener('keydown', this._handleEscapeKey);

    // Confirm button emits event (HTTP behavior handled externally)
    this._confirmBtn?.addEventListener('click', this._handleConfirm);
  }

  /**
   * Remove event listeners.
   * @private
   */
  _removeEventListeners() {
    this._cancelBtn?.removeEventListener('click', this._handleCancel);
    this.removeEventListener('click', this._handleBackdropClick);
    document.removeEventListener('keydown', this._handleEscapeKey);
    this._confirmBtn?.removeEventListener('click', this._handleConfirm);
  }

  /**
   * Handle cancel button click.
   * @private
   */
  _handleCancel = () => {
    this.close();
    this.dispatchEvent(new CustomEvent('jtags-modal-cancel', { bubbles: true }));
  };

  /**
   * Handle confirm button click.
   * Emits a cancelable event - if not prevented, closes the modal.
   * External code can call event.preventDefault() to handle closing manually.
   * @private
   */
  _handleConfirm = () => {
    const event = new CustomEvent('jtags-modal-confirm', {
      bubbles: true,
      cancelable: true
    });
    const notPrevented = this.dispatchEvent(event);
    if (notPrevented) {
      this.close();
    }
  };

  /**
   * Handle backdrop click.
   * @private
   */
  _handleBackdropClick = (event) => {
    // Only close if clicking directly on the modal backdrop, not content
    if (event.target === this) {
      this.close();
      this.dispatchEvent(new CustomEvent('jtags-modal-cancel', { bubbles: true }));
    }
  };

  /**
   * Handle escape key.
   * @private
   */
  _handleEscapeKey(event) {
    if (event.key === 'Escape' && this.open) {
      this.close();
      this.dispatchEvent(new CustomEvent('jtags-modal-cancel', { bubbles: true }));
    }
  }

  /**
   * Show the modal.
   * @private
   */
  _show() {
    this.classList.remove('jtags-hidden');
    // Focus the cancel button for accessibility
    this._cancelBtn?.focus();
  }

  /**
   * Hide the modal.
   * @private
   */
  _hide() {
    this.classList.add('jtags-hidden');
  }

  /**
   * Check if there's a slotted confirm button.
   * @private
   */
  _hasSlottedConfirm() {
    return this.querySelector('[slot="confirm"]') !== null;
  }

  /**
   * Check if there's a slotted cancel button.
   * @private
   */
  _hasSlottedCancel() {
    return this.querySelector('[slot="cancel"]') !== null;
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Open the modal.
   */
  open() {
    this.setAttribute('open', '');
  }

  /**
   * Close the modal.
   */
  close() {
    this.removeAttribute('open');
  }

  /**
   * Show the modal (alias for setting open attribute).
   */
  show() {
    this.setAttribute('open', '');
  }

  // ===========================================================================
  // Property getters/setters
  // ===========================================================================

  /**
   * Whether the modal is open.
   * @type {boolean}
   */
  get open() {
    return this.hasAttribute('open');
  }

  set open(value) {
    if (value) {
      this.setAttribute('open', '');
    } else {
      this.removeAttribute('open');
    }
  }

  /**
   * The message to display.
   * @type {string}
   */
  get message() {
    return this.getAttribute('message') || '';
  }

  set message(value) {
    if (value) {
      this.setAttribute('message', value);
    } else {
      this.removeAttribute('message');
    }
  }

  /**
   * The confirm button text.
   * @type {string}
   */
  get confirmText() {
    return this.getAttribute('confirm-text') || 'Confirm';
  }

  set confirmText(value) {
    if (value) {
      this.setAttribute('confirm-text', value);
    } else {
      this.removeAttribute('confirm-text');
    }
  }

  /**
   * The cancel button text.
   * @type {string}
   */
  get cancelText() {
    return this.getAttribute('cancel-text') || 'Cancel';
  }

  set cancelText(value) {
    if (value) {
      this.setAttribute('cancel-text', value);
    } else {
      this.removeAttribute('cancel-text');
    }
  }

  /**
   * Get the confirm button element.
   * @returns {HTMLButtonElement|null}
   */
  get confirmButton() {
    return this._confirmBtn;
  }

  /**
   * Get the cancel button element.
   * @returns {HTMLButtonElement|null}
   */
  get cancelButton() {
    return this._cancelBtn;
  }

  /**
   * Get the message element.
   * @returns {HTMLElement|null}
   */
  get messageElement() {
    return this._messageEl;
  }
}

customElements.define('jtags-modal', JtagsModal);