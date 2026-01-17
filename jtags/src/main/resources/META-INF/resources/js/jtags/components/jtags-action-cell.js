/**
 * JtagsActionCell Web Component
 *
 * A specialized cell component for row-level actions.
 * Renders an icon button with optional label.
 * HTTP behavior is handled by HTMX attributes (hx-get, hx-delete, etc.)
 *
 * @example
 * <jtags-action-cell action="edit" icon="edit" label="Edit"
 *                    hx-get="/users/1/edit"
 *                    hx-target="#modal">
 * </jtags-action-cell>
 *
 * <jtags-action-cell action="delete" icon="trash"
 *                    hx-delete="/users/1"
 *                    hx-confirm="Delete this user?"
 *                    hx-swap="delete">
 * </jtags-action-cell>
 */

export class JtagsActionCell extends HTMLElement {
  static get observedAttributes() {
    return ['action', 'icon', 'label', 'icon-base-path'];
  }

  constructor() {
    super();
    this._rendered = false;
  }

  connectedCallback() {
    // Validate required attributes
    if (!this.action) {
      console.warn('[jtags] <jtags-action-cell> requires "action" attribute');
    }

    // Apply table-cell display
    this.style.display = 'table-cell';
    this.classList.add('jtags-table__cell', 'jtags-table__cell--actions');

    // Render the button
    this._render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this._rendered) {
      this._render();
    }
  }

  /**
   * Render the action button.
   * @private
   */
  _render() {
    const icon = this.icon;
    const label = this.label;
    const iconBasePath = this._getIconBasePath();

    // Build button content
    let buttonContent = '';

    if (icon) {
      buttonContent += `
        <svg class="jtags-icon" aria-hidden="true">
          <use href="${iconBasePath}#jtags-icon-${icon}"></use>
        </svg>
      `;
    }

    if (label) {
      buttonContent += `<span class="jtags-action-cell__label">${this._escapeHtml(label)}</span>`;
    }

    // Create button element
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'jtags-action-cell__button';
    button.innerHTML = buttonContent;

    // Set accessibility attributes
    if (label) {
      button.setAttribute('title', label);
    }
    button.setAttribute('data-action', this.action);

    // Copy all hx-* attributes to the button (HTMX passthrough)
    this._copyHtmxAttributes(button);

    // Clear and append
    this.innerHTML = '';
    this.appendChild(button);
    this._rendered = true;

    // Process HTMX on the new button if htmx is available
    if (typeof htmx !== 'undefined') {
      htmx.process(button);
    }
  }

  /**
   * Copy hx-* attributes from the cell to the button.
   * @private
   * @param {HTMLElement} button
   */
  _copyHtmxAttributes(button) {
    for (const attr of this.attributes) {
      if (attr.name.startsWith('hx-')) {
        button.setAttribute(attr.name, attr.value);
      }
    }
  }

  /**
   * Get the icon base path from attribute or parent table.
   * @private
   * @returns {string}
   */
  _getIconBasePath() {
    // Direct attribute
    if (this.hasAttribute('icon-base-path')) {
      return this.getAttribute('icon-base-path');
    }

    // From parent table
    const table = this.closest('jtags-table');
    if (table && table.hasAttribute('icon-base-path')) {
      return table.getAttribute('icon-base-path');
    }

    // Default
    return '/icons/jtags/icons.svg';
  }

  /**
   * Escape HTML to prevent XSS.
   * @private
   * @param {string} str
   * @returns {string}
   */
  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ===========================================================================
  // Property getters/setters
  // ===========================================================================

  /**
   * The action identifier (required).
   * @type {string}
   */
  get action() {
    return this.getAttribute('action') || '';
  }

  set action(value) {
    if (value) {
      this.setAttribute('action', value);
    } else {
      this.removeAttribute('action');
    }
  }

  /**
   * The icon name from the sprite.
   * @type {string|null}
   */
  get icon() {
    return this.getAttribute('icon');
  }

  set icon(value) {
    if (value) {
      this.setAttribute('icon', value);
    } else {
      this.removeAttribute('icon');
    }
  }

  /**
   * The button label text.
   * @type {string|null}
   */
  get label() {
    return this.getAttribute('label');
  }

  set label(value) {
    if (value) {
      this.setAttribute('label', value);
    } else {
      this.removeAttribute('label');
    }
  }

  /**
   * Get the button element.
   * @returns {HTMLButtonElement|null}
   */
  get button() {
    return this.querySelector('.jtags-action-cell__button');
  }
}

customElements.define('jtags-action-cell', JtagsActionCell);