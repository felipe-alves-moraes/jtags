/**
 * JtagsPagination Web Component
 *
 * A structural component for table pagination controls.
 * Renders navigation buttons, page info, and page size selector.
 *
 * @example
 * <jtags-table>
 *     <jtags-pagination current="1" total="10" size="25"
 *                       total-items="250" sizes="10,25,50,100"
 *                       show-labels></jtags-pagination>
 * </jtags-table>
 */

export class JtagsPagination extends HTMLElement {
  static get observedAttributes() {
    return ['current', 'total', 'size', 'total-items', 'sizes', 'show-labels'];
  }

  constructor() {
    super();
    this._infoElement = null;
    this._navElement = null;
    this._sizeElement = null;
    this._prevButton = null;
    this._nextButton = null;
    this._sizeSelect = null;
    this._initialized = false;
  }

  connectedCallback() {
    // Prevent re-initialization when element is moved
    if (this._initialized) return;
    this._initialized = true;

    this.classList.add('jtags-pagination');
    this._buildStructure();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    // Update UI when attributes change
    if (this._infoElement) {
      this._updateInfo();
    }
    if (this._navElement) {
      this._updateNavigation();
    }
    if (name === 'size' && this._sizeSelect) {
      this._sizeSelect.value = newValue;
    }
    if (name === 'sizes' && this._sizeSelect) {
      this._rebuildSizeOptions();
    }
  }

  /**
   * Build the pagination structure.
   * @private
   */
  _buildStructure() {
    // Create page info
    this._buildInfo();

    // Create navigation
    this._buildNavigation();

    // Create size selector
    this._buildSizeSelector();

    // Append all sections
    this.appendChild(this._infoElement);
    this.appendChild(this._navElement);
    this.appendChild(this._sizeElement);
  }

  /**
   * Build the page info element.
   * @private
   */
  _buildInfo() {
    this._infoElement = document.createElement('span');
    this._infoElement.classList.add('jtags-pagination__info');
    this._updateInfo();
  }

  /**
   * Update the page info text.
   * @private
   */
  _updateInfo() {
    const current = this.currentPage;
    const size = this.pageSize;
    const totalItems = this.totalItems;

    const start = (current - 1) * size + 1;
    const end = Math.min(current * size, totalItems);

    if (totalItems === 0) {
      this._infoElement.textContent = 'No items';
    } else {
      this._infoElement.textContent = `Showing ${start}-${end} of ${totalItems}`;
    }
  }

  /**
   * Build the navigation buttons.
   * @private
   */
  _buildNavigation() {
    const iconBasePath = this._getIconBasePath();
    const showLabels = this.hasAttribute('show-labels');

    this._navElement = document.createElement('nav');
    this._navElement.classList.add('jtags-pagination__list');

    // Previous button
    this._prevButton = document.createElement('button');
    this._prevButton.type = 'button';
    this._prevButton.classList.add('jtags-pagination__link', 'jtags-pagination__link--prev');
    this._prevButton.dataset.page = 'prev';
    this._prevButton.title = 'Previous page';
    this._prevButton.innerHTML = `
      <svg class="jtags-icon" aria-hidden="true">
        <use href="${iconBasePath}#jtags-icon-chevron-left"></use>
      </svg>
      ${showLabels ? '<span>Previous</span>' : ''}
    `;
    this._prevButton.addEventListener('click', () => this._handlePrevClick());

    // Page indicator
    const pageIndicator = document.createElement('span');
    pageIndicator.classList.add('jtags-pagination__pages');
    this._pageIndicator = pageIndicator;
    this._updatePageIndicator();

    // Next button
    this._nextButton = document.createElement('button');
    this._nextButton.type = 'button';
    this._nextButton.classList.add('jtags-pagination__link', 'jtags-pagination__link--next');
    this._nextButton.dataset.page = 'next';
    this._nextButton.title = 'Next page';
    this._nextButton.innerHTML = `
      ${showLabels ? '<span>Next</span>' : ''}
      <svg class="jtags-icon" aria-hidden="true">
        <use href="${iconBasePath}#jtags-icon-chevron-right"></use>
      </svg>
    `;
    this._nextButton.addEventListener('click', () => this._handleNextClick());

    this._navElement.appendChild(this._prevButton);
    this._navElement.appendChild(pageIndicator);
    this._navElement.appendChild(this._nextButton);

    this._updateNavigation();
  }

  /**
   * Update navigation button states.
   * @private
   */
  _updateNavigation() {
    if (this._prevButton) {
      this._prevButton.disabled = !this.hasPrevious;
      this._prevButton.classList.toggle('jtags-pagination__link--disabled', !this.hasPrevious);
    }
    if (this._nextButton) {
      this._nextButton.disabled = !this.hasNext;
      this._nextButton.classList.toggle('jtags-pagination__link--disabled', !this.hasNext);
    }
    this._updatePageIndicator();
  }

  /**
   * Update the page indicator text.
   * @private
   */
  _updatePageIndicator() {
    if (this._pageIndicator) {
      this._pageIndicator.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    }
  }

  /**
   * Build the page size selector.
   * @private
   */
  _buildSizeSelector() {
    this._sizeElement = document.createElement('div');
    this._sizeElement.classList.add('jtags-pagination__size');

    const label = document.createElement('label');
    label.htmlFor = 'pageSize';
    label.textContent = 'Show';

    this._sizeSelect = document.createElement('select');
    this._sizeSelect.id = 'pageSize';
    this._sizeSelect.name = 'size';
    this._rebuildSizeOptions();

    this._sizeSelect.addEventListener('change', () => this._handleSizeChange());

    const suffix = document.createElement('span');
    suffix.textContent = 'per page';

    this._sizeElement.appendChild(label);
    this._sizeElement.appendChild(this._sizeSelect);
    this._sizeElement.appendChild(suffix);
  }

  /**
   * Rebuild size selector options.
   * @private
   */
  _rebuildSizeOptions() {
    if (!this._sizeSelect) return;

    this._sizeSelect.innerHTML = '';
    const sizes = this.pageSizes;
    const currentSize = this.pageSize;

    sizes.forEach(size => {
      const option = document.createElement('option');
      option.value = String(size);
      option.textContent = String(size);
      if (size === currentSize) {
        option.selected = true;
      }
      this._sizeSelect.appendChild(option);
    });
  }

  /**
   * Handle previous button click.
   * @private
   */
  _handlePrevClick() {
    if (this.hasPrevious) {
      this.dispatchEvent(new CustomEvent('jtags-page-change', {
        bubbles: true,
        detail: { page: this.currentPage - 1 }
      }));
    }
  }

  /**
   * Handle next button click.
   * @private
   */
  _handleNextClick() {
    if (this.hasNext) {
      this.dispatchEvent(new CustomEvent('jtags-page-change', {
        bubbles: true,
        detail: { page: this.currentPage + 1 }
      }));
    }
  }

  /**
   * Handle page size change.
   * @private
   */
  _handleSizeChange() {
    const newSize = parseInt(this._sizeSelect.value, 10);
    this.dispatchEvent(new CustomEvent('jtags-size-change', {
      bubbles: true,
      detail: { size: newSize }
    }));
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

  // ===========================================================================
  // Property getters/setters
  // ===========================================================================

  get currentPage() {
    return parseInt(this.getAttribute('current'), 10) || 1;
  }

  set currentPage(value) {
    this.setAttribute('current', String(value));
  }

  get totalPages() {
    return parseInt(this.getAttribute('total'), 10) || 1;
  }

  set totalPages(value) {
    this.setAttribute('total', String(value));
  }

  get pageSize() {
    return parseInt(this.getAttribute('size'), 10) || 10;
  }

  set pageSize(value) {
    this.setAttribute('size', String(value));
  }

  get totalItems() {
    return parseInt(this.getAttribute('total-items'), 10) || 0;
  }

  set totalItems(value) {
    this.setAttribute('total-items', String(value));
  }

  get pageSizes() {
    const sizesAttr = this.getAttribute('sizes') || '10,25,50,100';
    return sizesAttr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  }

  set pageSizes(value) {
    if (Array.isArray(value)) {
      this.setAttribute('sizes', value.join(','));
    }
  }

  get showLabels() {
    return this.hasAttribute('show-labels');
  }

  set showLabels(value) {
    if (value) {
      this.setAttribute('show-labels', '');
    } else {
      this.removeAttribute('show-labels');
    }
  }

  get hasPrevious() {
    return this.currentPage > 1;
  }

  get hasNext() {
    return this.currentPage < this.totalPages;
  }

  /**
   * Get the previous button element.
   * @returns {HTMLButtonElement|null}
   */
  get prevButton() {
    return this._prevButton || null;
  }

  /**
   * Get the next button element.
   * @returns {HTMLButtonElement|null}
   */
  get nextButton() {
    return this._nextButton || null;
  }

  /**
   * Get the page size select element.
   * @returns {HTMLSelectElement|null}
   */
  get sizeSelect() {
    return this._sizeSelect || null;
  }

  /**
   * Get the info element.
   * @returns {HTMLElement|null}
   */
  get infoElement() {
    return this._infoElement || null;
  }

  /**
   * Get the navigation element.
   * @returns {HTMLElement|null}
   */
  get navElement() {
    return this._navElement || null;
  }
}

customElements.define('jtags-pagination', JtagsPagination);