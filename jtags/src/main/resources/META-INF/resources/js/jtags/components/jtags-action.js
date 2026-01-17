/**
 * JtagsAction Web Component
 *
 * A button component for toolbar actions that renders icon and label.
 * Accepts HTMX attributes directly from the template.
 *
 * @example
 * <jtags-action key="delete" label="Delete" icon="trash"
 *               selection-based
 *               hx-get="/api/delete/confirm"
 *               hx-target="#modal-container"
 *               hx-include="[name=select-item]:checked">
 * </jtags-action>
 */

export class JtagsAction extends HTMLElement {
  static get observedAttributes() {
    return [
      'key',
      'label',
      'icon',
      'selection-based',
      'show-label'
    ];
  }

  constructor() {
    super();
    this._initialized = false;
  }

  connectedCallback() {
    // Prevent re-initialization when element is moved
    if (this._initialized) return;
    this._initialized = true;

    // Make it behave like a button
    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', '0');

    // Add base class
    this.classList.add('jtags-table__action');

    // Add type-specific class
    if (this.selectionBased) {
      this.classList.add('jtags-table__action--selection');
      // Selection-based actions start hidden
      this.classList.add('jtags-hidden');
    } else {
      this.classList.add('jtags-table__action--global');
    }

    // Set title from label
    if (this.label) {
      this.setAttribute('title', this.label);
    }

    // Render content
    this._renderContent();

    // Handle keyboard events for button behavior
    this.addEventListener('keydown', this._handleKeydown.bind(this));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._initialized) return;

    if (name === 'icon' || name === 'label' || name === 'show-label') {
      this._renderContent();
    }
    if (name === 'label') {
      this.setAttribute('title', newValue || '');
    }
  }

  /**
   * Render the button content (icon + label).
   * @private
   */
  _renderContent() {
    // Clear existing content
    this.innerHTML = '';

    // Get icon value - treat empty string as no icon
    const iconValue = this.icon;
    const hasIcon = iconValue && iconValue.trim() !== '';

    // Add icon if specified and not empty
    if (hasIcon) {
      const iconBasePath = this._getIconBasePath();
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('jtags-icon');
      svg.setAttribute('aria-hidden', 'true');

      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `${iconBasePath}#jtags-icon-${iconValue}`);
      svg.appendChild(use);

      this.appendChild(svg);
    }

    // Add label if show-label is set or no icon
    if (this.showLabel || !hasIcon) {
      const span = document.createElement('span');
      span.classList.add('jtags-table__action-label');
      span.textContent = this.label;
      this.appendChild(span);
    }
  }

  /**
   * Get the icon base path from parent table.
   * @private
   * @returns {string}
   */
  _getIconBasePath() {
    const table = this.closest('jtags-table');
    return table?.getAttribute('icon-base-path') || '/icons/jtags/icons.svg';
  }

  /**
   * Handle keyboard events for button behavior.
   * @private
   * @param {KeyboardEvent} event
   */
  _handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.click();
    }
  }

  /**
   * Get action configuration as a plain object.
   * @returns {Object} Action configuration
   */
  getConfig() {
    return {
      key: this.getAttribute('key') || '',
      label: this.getAttribute('label') || '',
      icon: this.getAttribute('icon') || null,
      selectionBased: this.hasAttribute('selection-based'),
      showLabel: this.hasAttribute('show-label')
    };
  }

  // ===========================================================================
  // Property getters/setters for direct access
  // ===========================================================================

  get key() {
    return this.getAttribute('key') || '';
  }

  set key(value) {
    this.setAttribute('key', value);
  }

  get label() {
    return this.getAttribute('label') || '';
  }

  set label(value) {
    this.setAttribute('label', value);
  }

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

  get selectionBased() {
    return this.hasAttribute('selection-based');
  }

  set selectionBased(value) {
    if (value) {
      this.setAttribute('selection-based', '');
    } else {
      this.removeAttribute('selection-based');
    }
  }

  get showLabel() {
    return this.hasAttribute('show-label');
  }

  set showLabel(value) {
    if (value) {
      this.setAttribute('show-label', '');
    } else {
      this.removeAttribute('show-label');
    }
  }
}

customElements.define('jtags-action', JtagsAction);