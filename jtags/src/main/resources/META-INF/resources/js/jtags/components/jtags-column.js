/**
 * JtagsColumn Web Component
 *
 * A declarative configuration element for table columns.
 * Does not render anything - provides column configuration to parent <jtags-table>.
 *
 * @example
 * <jtags-column key="name" label="Name" sortable searchable></jtags-column>
 */

export class JtagsColumn extends HTMLElement {
  static get observedAttributes() {
    return ['key', 'label', 'sortable', 'searchable', 'width'];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    // Hide element - it's purely declarative
    this.style.display = 'none';

    // Notify parent that configuration changed
    this._notifyParent();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this._notifyParent();
  }

  /**
   * Notify the parent jtags-table that column configuration changed.
   * @private
   */
  _notifyParent() {
    const parent = this.closest('jtags-table');
    if (parent && typeof parent._onColumnConfigChanged === 'function') {
      parent._onColumnConfigChanged();
    }
  }

  /**
   * Get column configuration as a plain object.
   * @returns {Object} Column configuration
   */
  getConfig() {
    return {
      key: this.getAttribute('key') || '',
      label: this.getAttribute('label') || '',
      sortable: this.hasAttribute('sortable'),
      searchable: this.hasAttribute('searchable'),
      width: this.getAttribute('width') || null
    };
  }

  // ===========================================================================
  // Property getters for direct access
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

  get sortable() {
    return this.hasAttribute('sortable');
  }

  set sortable(value) {
    if (value) {
      this.setAttribute('sortable', '');
    } else {
      this.removeAttribute('sortable');
    }
  }

  get searchable() {
    return this.hasAttribute('searchable');
  }

  set searchable(value) {
    if (value) {
      this.setAttribute('searchable', '');
    } else {
      this.removeAttribute('searchable');
    }
  }

  get width() {
    return this.getAttribute('width');
  }

  set width(value) {
    if (value) {
      this.setAttribute('width', value);
    } else {
      this.removeAttribute('width');
    }
  }
}

customElements.define('jtags-column', JtagsColumn);