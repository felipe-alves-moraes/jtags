/**
 * JtagsActionCell Web Component
 *
 * A specialized cell component for row-level actions.
 * Renders an icon button with optional label.
 * All non-component attributes are passed through to the inner button,
 * making this component library-agnostic (works with HTMX, Alpine.js, vanilla JS, etc.)
 *
 * @example
 * // With HTMX
 * <jtags-action-cell action="edit" icon="edit" label="Edit"
 *                    hx-get="/users/1/edit" hx-target="#modal">
 * </jtags-action-cell>
 *
 * // With vanilla JS data attributes
 * <jtags-action-cell action="delete" icon="trash"
 *                    data-url="/users/1" data-method="DELETE">
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

    // Pass through all non-component attributes to the button
    this._copyPassthroughAttributes(button);

    // Clear and append
    this.innerHTML = '';
    this.appendChild(button);
    this._rendered = true;

    // Dispatch event for external libraries to process the new element
    this.dispatchEvent(new CustomEvent('jtags-render', {
      bubbles: true,
      detail: { element: button }
    }));
  }

  /**
   * Copy all non-component attributes to the target element.
   * This enables passthrough for any library (HTMX, Alpine.js, vanilla JS, etc.)
   * @private
   * @param {HTMLElement} target
   */
  _copyPassthroughAttributes(target) {
    const componentAttributes = new Set([
      'action', 'icon', 'label', 'icon-base-path',
      'class', 'style', 'id'
    ]);

    for (const attr of this.attributes) {
      if (!componentAttributes.has(attr.name)) {
        target.setAttribute(attr.name, attr.value);
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