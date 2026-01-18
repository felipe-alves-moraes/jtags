/**
 * JtagsCell Web Component
 *
 * A structural component representing a table cell.
 * Renders content passed as children (Light DOM).
 *
 * @example
 * <jtags-cell column="name">{item.name}</jtags-cell>
 * <jtags-cell column="actions"><a href="/edit">Edit</a></jtags-cell>
 */

export class JtagsCell extends HTMLElement {
  static get observedAttributes() {
    return ['width'];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    // Apply table-cell display
    this.style.display = 'table-cell';
    this.classList.add('jtags-table__cell');

    // Apply width if specified or from column config
    this._applyWidth();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'width') {
      this._applyWidth();
    }
  }

  /**
   * Apply width from attribute or parent column config.
   * @private
   */
  _applyWidth() {
    const width = this._getWidth();
    if (width) {
      this.style.width = width;
    } else {
      this.style.width = '';
    }
  }

  /**
   * Get width from attribute or parent's column config.
   * @private
   * @returns {string|null}
   */
  _getWidth() {
    // Direct width attribute takes precedence
    if (this.hasAttribute('width')) {
      return this.getAttribute('width');
    }

    // Try to get width from parent table's column config
    const columnKey = this.column;
    if (!columnKey) return null;

    const table = this.closest('jtags-table');
    if (!table || !table.columns) return null;

    const columnConfig = table.columns.find(col => col.key === columnKey);
    return columnConfig?.width || null;
  }

  // ===========================================================================
  // Property getters/setters
  // ===========================================================================

  /**
   * The column key this cell belongs to.
   * @type {string}
   */
  get column() {
    return this.getAttribute('column') || '';
  }

  set column(value) {
    if (value) {
      this.setAttribute('column', value);
    } else {
      this.removeAttribute('column');
    }
  }

  /**
   * The explicit width for this cell.
   * @type {string|null}
   */
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

  /**
   * Get the column configuration from parent table.
   * @returns {Object|null}
   */
  getColumnConfig() {
    const columnKey = this.column;
    if (!columnKey) return null;

    const table = this.closest('jtags-table');
    if (!table || !table.columns) return null;

    return table.columns.find(col => col.key === columnKey) || null;
  }
}

customElements.define('jtags-cell', JtagsCell);