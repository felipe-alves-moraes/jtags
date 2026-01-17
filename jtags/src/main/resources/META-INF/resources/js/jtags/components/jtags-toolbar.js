/**
 * JtagsToolbar Web Component
 *
 * A structural component for the table toolbar.
 * Generates search controls and action buttons from sibling config elements.
 *
 * @example
 * <jtags-table show-search>
 *     <jtags-column key="name" label="Name" searchable></jtags-column>
 *     <jtags-action key="delete" label="Delete" icon="trash" selection-based></jtags-action>
 *     <jtags-action key="export" label="Export" icon="download"></jtags-action>
 *     <jtags-toolbar search-field="name" search-value="john"></jtags-toolbar>
 * </jtags-table>
 */

export class JtagsToolbar extends HTMLElement {
  static get observedAttributes() {
    return ['search-field', 'search-value', 'total-items', 'page-size'];
  }

  constructor() {
    super();
    this._leftSection = null;
    this._rightSection = null;
    this._banner = null;
    this._initialized = false;
  }

  connectedCallback() {
    // Prevent re-initialization when element is moved
    if (this._initialized) return;
    this._initialized = true;

    this.classList.add('jtags-table__toolbar');

    // Build toolbar structure
    this._buildStructure();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'search-field' && this._searchFieldSelect) {
      this._searchFieldSelect.value = newValue || '';
    }
    if (name === 'search-value' && this._searchInput) {
      this._searchInput.value = newValue || '';
    }
  }

  /**
   * Build the toolbar structure.
   * @private
   */
  _buildStructure() {
    // Create left section (checkbox area + selection-based actions)
    this._leftSection = document.createElement('div');
    this._leftSection.classList.add('jtags-table__toolbar-left');

    // Create right section (search + global actions)
    this._rightSection = document.createElement('div');
    this._rightSection.classList.add('jtags-table__toolbar-right');

    // Build content
    this._buildLeftSection();
    this._buildRightSection();
    this._buildBanner();

    // Append sections
    this.appendChild(this._leftSection);
    this.appendChild(this._rightSection);
    this.appendChild(this._banner);
  }

  /**
   * Build left section with selection-based actions.
   * Moves jtags-action elements with selection-based attribute to left section.
   * Also handles any element with explicit slot="left".
   * @private
   */
  _buildLeftSection() {
    // Move jtags-action elements that are selection-based
    const actions = this.querySelectorAll('jtags-action[selection-based]');
    actions.forEach(el => {
      el.removeAttribute('slot'); // Clean up slot attribute if present
      this._leftSection.appendChild(el);
    });

    // Also move any other elements with explicit slot="left"
    const slottedLeft = this.querySelectorAll('[slot="left"]');
    slottedLeft.forEach(el => {
      el.removeAttribute('slot');
      this._leftSection.appendChild(el);
    });
  }

  /**
   * Build right section with search and global actions.
   * Moves jtags-action elements without selection-based to right section.
   * Also handles any element with explicit slot="right".
   * @private
   */
  _buildRightSection() {
    const table = this.closest('jtags-table');
    const showSearch = table?.hasAttribute('show-search');

    // Add search controls if enabled
    if (showSearch) {
      this._buildSearchControls();
    }

    // Move jtags-action elements that are NOT selection-based (global)
    const actions = this.querySelectorAll('jtags-action:not([selection-based])');
    actions.forEach(el => {
      el.removeAttribute('slot'); // Clean up slot attribute if present
      this._rightSection.appendChild(el);
    });

    // Also move any other elements with explicit slot="right"
    const slottedRight = this.querySelectorAll('[slot="right"]');
    slottedRight.forEach(el => {
      el.removeAttribute('slot');
      this._rightSection.appendChild(el);
    });
  }

  /**
   * Build search controls (field select + input).
   * @private
   */
  _buildSearchControls() {
    const searchableColumns = this._getSearchableColumns();

    // Create field selector
    const fieldLabel = document.createElement('label');
    fieldLabel.htmlFor = 'searchField';
    fieldLabel.textContent = 'Search Field';
    fieldLabel.classList.add('jtags-sr-only'); // Screen reader only

    this._searchFieldSelect = document.createElement('select');
    this._searchFieldSelect.id = 'searchField';
    this._searchFieldSelect.name = 'searchField';
    this._searchFieldSelect.classList.add('jtags-toolbar__search-field');

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a Field';
    this._searchFieldSelect.appendChild(defaultOption);

    // Add searchable column options
    searchableColumns.forEach(col => {
      const option = document.createElement('option');
      option.value = col.key;
      option.textContent = col.label;
      if (col.key === this.searchField) {
        option.selected = true;
      }
      this._searchFieldSelect.appendChild(option);
    });

    // Create search input
    const inputLabel = document.createElement('label');
    inputLabel.htmlFor = 'search';
    inputLabel.textContent = 'Search';
    inputLabel.classList.add('jtags-sr-only');

    this._searchInput = document.createElement('input');
    this._searchInput.type = 'text';
    this._searchInput.id = 'search';
    this._searchInput.name = 'search';
    this._searchInput.placeholder = 'Search...';
    this._searchInput.classList.add('jtags-toolbar__search-input');
    this._searchInput.value = this.searchValue || '';

    // Add event listener for search
    this._searchInput.addEventListener('input', this._debounce(() => {
      this._emitSearch();
    }, 300));

    this._searchFieldSelect.addEventListener('change', () => {
      this._emitSearch();
    });

    // Append to right section
    this._rightSection.appendChild(fieldLabel);
    this._rightSection.appendChild(this._searchFieldSelect);
    this._rightSection.appendChild(inputLabel);
    this._rightSection.appendChild(this._searchInput);
  }

  /**
   * Build the selection banner.
   * @private
   */
  _buildBanner() {
    this._banner = document.createElement('div');
    this._banner.id = 'selection-banner';
    this._banner.classList.add('jtags-table__banner', 'jtags-hidden');
    this._banner.dataset.totalItems = this.totalItems || '0';
    this._banner.dataset.pageSize = this.pageSize || '0';

    this._updateBannerContent();
  }

  /**
   * Update banner content based on state.
   * @private
   */
  _updateBannerContent() {
    const totalItems = this.totalItems || 0;
    const pageSize = this.pageSize || 0;

    this._banner.innerHTML = `
      <p>All ${pageSize} items on this page selected.
        <a id="select-all-matching" href="#">Select all ${totalItems}?</a>
      </p>
    `;
  }

  /**
   * Get searchable columns from parent table.
   * @private
   * @returns {Array}
   */
  _getSearchableColumns() {
    const table = this.closest('jtags-table');
    if (!table) return [];
    return table.searchableColumns || [];
  }

  /**
   * Emit search event.
   * @private
   */
  _emitSearch() {
    this.dispatchEvent(new CustomEvent('jtags-search', {
      bubbles: true,
      detail: {
        field: this._searchFieldSelect?.value || '',
        value: this._searchInput?.value || ''
      }
    }));
  }

  /**
   * Simple debounce function.
   * @private
   * @param {Function} fn
   * @param {number} delay
   * @returns {Function}
   */
  _debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ===========================================================================
  // Public Methods
  // ===========================================================================

  /**
   * Show selection-based actions.
   */
  showSelectionActions() {
    this.querySelectorAll('.jtags-table__action--selection').forEach(btn => {
      btn.classList.remove('jtags-hidden');
    });
  }

  /**
   * Hide selection-based actions.
   */
  hideSelectionActions() {
    this.querySelectorAll('.jtags-table__action--selection').forEach(btn => {
      btn.classList.add('jtags-hidden');
    });
  }

  /**
   * Show the selection banner.
   */
  showBanner() {
    this._banner?.classList.remove('jtags-hidden');
  }

  /**
   * Hide the selection banner.
   */
  hideBanner() {
    this._banner?.classList.add('jtags-hidden');
  }

  /**
   * Update banner to show "all selected" mode.
   * @param {number} totalItems
   */
  showAllSelectedBanner(totalItems) {
    if (!this._banner) return;
    this._banner.innerHTML = `
      <p>All ${totalItems} items selected.
        <a id="clear-selection" href="#">Clear selection</a>
      </p>
    `;
    this._banner.classList.remove('jtags-hidden');
  }

  /**
   * Reset banner to page selection mode.
   */
  resetBanner() {
    this._updateBannerContent();
  }

  // ===========================================================================
  // Property getters/setters
  // ===========================================================================

  get searchField() {
    return this.getAttribute('search-field') || '';
  }

  set searchField(value) {
    if (value) {
      this.setAttribute('search-field', value);
    } else {
      this.removeAttribute('search-field');
    }
  }

  get searchValue() {
    return this.getAttribute('search-value') || '';
  }

  set searchValue(value) {
    if (value) {
      this.setAttribute('search-value', value);
    } else {
      this.removeAttribute('search-value');
    }
  }

  get totalItems() {
    return parseInt(this.getAttribute('total-items')) || 0;
  }

  set totalItems(value) {
    this.setAttribute('total-items', String(value));
    if (this._banner) {
      this._banner.dataset.totalItems = String(value);
      this._updateBannerContent();
    }
  }

  get pageSize() {
    return parseInt(this.getAttribute('page-size')) || 0;
  }

  set pageSize(value) {
    this.setAttribute('page-size', String(value));
    if (this._banner) {
      this._banner.dataset.pageSize = String(value);
      this._updateBannerContent();
    }
  }

  /**
   * Get the search field select element.
   * @returns {HTMLSelectElement|null}
   */
  get searchFieldSelect() {
    return this._searchFieldSelect || null;
  }

  /**
   * Get the search input element.
   * @returns {HTMLInputElement|null}
   */
  get searchInput() {
    return this._searchInput || null;
  }

  /**
   * Get the banner element.
   * @returns {HTMLElement|null}
   */
  get banner() {
    return this._banner || null;
  }

  /**
   * Get all action buttons.
   * @returns {NodeList}
   */
  get actionButtons() {
    return this.querySelectorAll('.jtags-table__action');
  }

  /**
   * Get selection-based action buttons.
   * @returns {NodeList}
   */
  get selectionActions() {
    return this.querySelectorAll('.jtags-table__action--selection');
  }

  /**
   * Get global action buttons.
   * @returns {NodeList}
   */
  get globalActions() {
    return this.querySelectorAll('.jtags-table__action--global');
  }
}

customElements.define('jtags-toolbar', JtagsToolbar);