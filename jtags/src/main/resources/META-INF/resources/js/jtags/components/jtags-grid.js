/**
 * JtagsGrid Web Component
 *
 * A structural component representing the table grid.
 * Generates header row from sibling <jtags-column> elements.
 * Contains <jtags-row> children as the table body.
 *
 * @example
 * <jtags-table>
 *     <jtags-column key="name" label="Name" sortable></jtags-column>
 *     <jtags-column key="email" label="Email"></jtags-column>
 *
 *     <jtags-grid sort-by="name" sort-asc>
 *         <jtags-row item-id="1">...</jtags-row>
 *         <jtags-row item-id="2">...</jtags-row>
 *     </jtags-grid>
 * </jtags-table>
 */

export class JtagsGrid extends HTMLElement {
  static get observedAttributes() {
    return ['sort-by', 'sort-asc', 'empty-message'];
  }

  constructor() {
    super();
    this._thead = null;
    this._tbody = null;
    this._initialized = false;
  }

  connectedCallback() {
    // Prevent re-initialization when element is moved
    if (this._initialized) return;
    this._initialized = true;

    // Apply table display
    this.style.display = 'table';
    this.classList.add('jtags-table__grid');

    // Build table structure
    this._buildStructure();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'sort-by' || name === 'sort-asc') {
      this._updateSortIndicators();
    }
  }

  /**
   * Build the table structure with thead and tbody.
   * @private
   */
  _buildStructure() {
    // Get columns from parent table's sibling elements
    const columns = this._getColumns();

    // Create thead
    this._thead = this._createThead(columns);

    // Create tbody wrapper for existing row children
    this._tbody = document.createElement('div');
    this._tbody.style.display = 'table-row-group';
    this._tbody.classList.add('jtags-table__body');

    // Move existing children (jtags-row elements) to tbody
    const children = Array.from(this.children);
    children.forEach(child => {
      if (child !== this._thead) {
        this._tbody.appendChild(child);
      }
    });

    // Check for empty state
    if (this._tbody.children.length === 0) {
      this._showEmptyMessage(columns.length);
    }

    // Insert thead at the beginning, then tbody
    this.insertBefore(this._thead, this.firstChild);
    this.appendChild(this._tbody);
  }

  /**
   * Get columns from parent table's jtags-column children.
   * @private
   * @returns {Array}
   */
  _getColumns() {
    const table = this.closest('jtags-table');
    if (!table) return [];

    return table.columns || [];
  }

  /**
   * Check if parent table has show-checkbox.
   * @private
   * @returns {boolean}
   */
  _shouldShowCheckbox() {
    const table = this.closest('jtags-table');
    return table?.hasAttribute('show-checkbox') || false;
  }

  /**
   * Get icon base path from parent table or default.
   * @private
   * @returns {string}
   */
  _getIconBasePath() {
    const table = this.closest('jtags-table');
    return table?.getAttribute('icon-base-path') || '/icons/jtags/icons.svg';
  }

  /**
   * Create the thead element with header cells.
   * @private
   * @param {Array} columns
   * @returns {HTMLElement}
   */
  _createThead(columns) {
    const thead = document.createElement('div');
    thead.style.display = 'table-header-group';
    thead.classList.add('jtags-table__header-group');

    const headerRow = document.createElement('div');
    headerRow.style.display = 'table-row';
    headerRow.classList.add('jtags-table__row', 'jtags-table__row--header');

    // Add select-all checkbox header if needed
    if (this._shouldShowCheckbox()) {
      const checkboxHeader = this._createCheckboxHeader();
      headerRow.appendChild(checkboxHeader);
    }

    // Add column headers
    columns.forEach(column => {
      const headerCell = this._createHeaderCell(column);
      headerRow.appendChild(headerCell);
    });

    thead.appendChild(headerRow);
    return thead;
  }

  /**
   * Create the select-all checkbox header cell.
   * @private
   * @returns {HTMLElement}
   */
  _createCheckboxHeader() {
    const cell = document.createElement('div');
    cell.style.display = 'table-cell';
    cell.classList.add('jtags-table__header', 'jtags-table__header--checkbox');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'select-all';
    checkbox.classList.add('jtags-grid__select-all');

    cell.appendChild(checkbox);
    return cell;
  }

  /**
   * Create a header cell for a column.
   * @private
   * @param {Object} column
   * @returns {HTMLElement}
   */
  _createHeaderCell(column) {
    const cell = document.createElement('div');
    cell.style.display = 'table-cell';
    cell.classList.add('jtags-table__header');
    cell.dataset.column = column.key;

    if (column.sortable) {
      cell.classList.add('jtags-table__header--sortable');
      cell.style.cursor = 'pointer';
      cell.addEventListener('click', () => this._handleSort(column.key));
    }

    // Label
    const label = document.createElement('span');
    label.classList.add('jtags-table__header-label');
    label.textContent = column.label;
    cell.appendChild(label);

    // Sort indicator
    if (column.sortable) {
      const indicator = this._createSortIndicator(column.key);
      cell.appendChild(indicator);
    }

    // Apply width if specified
    if (column.width) {
      cell.style.width = column.width;
    }

    return cell;
  }

  /**
   * Create sort indicator element.
   * @private
   * @param {string} columnKey
   * @returns {HTMLElement}
   */
  _createSortIndicator(columnKey) {
    const indicator = document.createElement('span');
    indicator.classList.add('jtags-table__sort-indicator');
    indicator.dataset.column = columnKey;

    // Set initial state
    this._updateIndicator(indicator, columnKey);

    return indicator;
  }

  /**
   * Update a sort indicator based on current sort state.
   * @private
   * @param {HTMLElement} indicator
   * @param {string} columnKey
   */
  _updateIndicator(indicator, columnKey) {
    const iconBasePath = this._getIconBasePath();
    const isSorted = this.sortBy === columnKey;

    if (isSorted) {
      const iconName = this.sortAsc ? 'sort-asc' : 'sort-desc';
      indicator.innerHTML = `
        <svg class="jtags-icon" aria-hidden="true">
          <use href="${iconBasePath}#jtags-icon-${iconName}"></use>
        </svg>
      `;
      indicator.classList.add('jtags-table__sort-indicator--active');
    } else {
      indicator.innerHTML = '';
      indicator.classList.remove('jtags-table__sort-indicator--active');
    }
  }

  /**
   * Update all sort indicators.
   * @private
   */
  _updateSortIndicators() {
    const indicators = this.querySelectorAll('.jtags-table__sort-indicator');
    indicators.forEach(indicator => {
      const columnKey = indicator.dataset.column;
      this._updateIndicator(indicator, columnKey);
    });
  }

  /**
   * Handle sort click on a column header.
   * @private
   * @param {string} columnKey
   */
  _handleSort(columnKey) {
    // Toggle direction if same column, otherwise ascending
    const newAsc = this.sortBy === columnKey ? !this.sortAsc : true;

    // Emit sort event
    this.dispatchEvent(new CustomEvent('jtags-sort', {
      bubbles: true,
      detail: {
        column: columnKey,
        ascending: newAsc
      }
    }));
  }

  /**
   * Show empty message when no rows.
   * @private
   * @param {number} columnCount
   */
  _showEmptyMessage(columnCount) {
    const emptyRow = document.createElement('div');
    emptyRow.style.display = 'table-row';
    emptyRow.classList.add('jtags-table__row', 'jtags-table__row--empty');

    const emptyCell = document.createElement('div');
    emptyCell.style.display = 'table-cell';
    emptyCell.classList.add('jtags-table__cell', 'jtags-table__cell--empty');
    emptyCell.textContent = this.emptyMessage;

    // Span all columns (including checkbox if present)
    const totalColumns = this._shouldShowCheckbox() ? columnCount + 1 : columnCount;
    emptyCell.style.textAlign = 'center';

    emptyRow.appendChild(emptyCell);
    this._tbody.appendChild(emptyRow);
  }

  // ===========================================================================
  // Property getters/setters
  // ===========================================================================

  /**
   * Current sort column key.
   * @type {string}
   */
  get sortBy() {
    return this.getAttribute('sort-by') || '';
  }

  set sortBy(value) {
    if (value) {
      this.setAttribute('sort-by', value);
    } else {
      this.removeAttribute('sort-by');
    }
  }

  /**
   * Whether sort is ascending.
   * @type {boolean}
   */
  get sortAsc() {
    return this.hasAttribute('sort-asc');
  }

  set sortAsc(value) {
    if (value) {
      this.setAttribute('sort-asc', '');
    } else {
      this.removeAttribute('sort-asc');
    }
  }

  /**
   * Message shown when no rows.
   * @type {string}
   */
  get emptyMessage() {
    return this.getAttribute('empty-message') || 'No data found';
  }

  set emptyMessage(value) {
    if (value) {
      this.setAttribute('empty-message', value);
    } else {
      this.removeAttribute('empty-message');
    }
  }

  /**
   * Get all rows in the grid.
   * @returns {NodeList}
   */
  get rows() {
    return this.querySelectorAll('jtags-row');
  }

  /**
   * Get the select-all checkbox.
   * @returns {HTMLInputElement|null}
   */
  get selectAllCheckbox() {
    return this.querySelector('#select-all');
  }

  /**
   * Get the header element.
   * @returns {HTMLElement|null}
   */
  get header() {
    return this._thead;
  }

  /**
   * Get the body element.
   * @returns {HTMLElement|null}
   */
  get body() {
    return this._tbody;
  }
}

customElements.define('jtags-grid', JtagsGrid);