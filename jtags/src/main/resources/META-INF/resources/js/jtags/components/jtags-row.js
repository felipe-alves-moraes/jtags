/**
 * JtagsRow Web Component
 *
 * A structural component representing a table row.
 * Optionally prepends a selection checkbox if parent table has show-checkbox.
 *
 * @example
 * <jtags-row item-id="123">
 *     <jtags-cell column="name">John</jtags-cell>
 *     <jtags-cell column="email">john@example.com</jtags-cell>
 * </jtags-row>
 */

export class JtagsRow extends HTMLElement {
  static get observedAttributes() {
    return ['selected'];
  }

  constructor() {
    super();
    this._checkboxCell = null;
    this._initialized = false;
  }

  connectedCallback() {
    // Prevent re-initialization when element is moved (e.g., by grid building structure)
    if (this._initialized) return;
    this._initialized = true;

    // Apply table-row display
    this.style.display = 'table-row';
    this.classList.add('jtags-table__row');

    // Add checkbox if parent table has show-checkbox
    if (this._shouldShowCheckbox()) {
      this._insertCheckboxCell();
    }

    // Apply selected state if set
    if (this.selected) {
      this._updateSelectedState(true);
    }
  }

  disconnectedCallback() {
    // Clean up checkbox cell reference
    this._checkboxCell = null;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'selected') {
      this._updateSelectedState(this.selected);
    }
  }

  /**
   * Check if parent table has show-checkbox attribute.
   * @private
   * @returns {boolean}
   */
  _shouldShowCheckbox() {
    const table = this.closest('jtags-table');
    return table?.hasAttribute('show-checkbox') || false;
  }

  /**
   * Insert checkbox cell as first child.
   * @private
   */
  _insertCheckboxCell() {
    // Create checkbox cell
    const cell = document.createElement('jtags-cell');
    cell.classList.add('jtags-table__cell--checkbox');

    // Create checkbox input
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'select-item';
    checkbox.value = this.itemId || '';
    checkbox.classList.add('jtags-row__checkbox');

    // Set checked state if row is selected
    if (this.selected) {
      checkbox.checked = true;
    }

    cell.appendChild(checkbox);

    // Insert as first child
    this.insertBefore(cell, this.firstChild);
    this._checkboxCell = cell;
  }

  /**
   * Update the visual selected state.
   * @private
   * @param {boolean} isSelected
   */
  _updateSelectedState(isSelected) {
    if (isSelected) {
      this.classList.add('jtags-table__row--selected');
    } else {
      this.classList.remove('jtags-table__row--selected');
    }

    // Update checkbox if exists
    const checkbox = this.querySelector('input[name="select-item"]');
    if (checkbox) {
      checkbox.checked = isSelected;
    }
  }

  /**
   * Get the checkbox element.
   * @returns {HTMLInputElement|null}
   */
  getCheckbox() {
    return this.querySelector('input[name="select-item"]');
  }

  // ===========================================================================
  // Property getters/setters
  // ===========================================================================

  /**
   * The row item identifier.
   * @type {string}
   */
  get itemId() {
    return this.getAttribute('item-id') || '';
  }

  set itemId(value) {
    if (value) {
      this.setAttribute('item-id', value);
      // Update checkbox value if exists
      const checkbox = this.getCheckbox();
      if (checkbox) {
        checkbox.value = value;
      }
    } else {
      this.removeAttribute('item-id');
    }
  }

  /**
   * Whether the row is selected.
   * @type {boolean}
   */
  get selected() {
    return this.hasAttribute('selected');
  }

  set selected(value) {
    if (value) {
      this.setAttribute('selected', '');
    } else {
      this.removeAttribute('selected');
    }
  }

  /**
   * Get the cells in this row (excluding checkbox cell).
   * @returns {NodeList}
   */
  get cells() {
    return this.querySelectorAll('jtags-cell:not(.jtags-table__cell--checkbox), jtags-action-cell');
  }
}

customElements.define('jtags-row', JtagsRow);