/**
 * JtagsTable Web Component
 *
 * A Light DOM web component that manages table selection state and emits events.
 * HTMX handles all HTTP requests natively via hx-trigger on emitted events.
 *
 * Supports declarative configuration via child elements:
 * - <jtags-column> for column definitions
 * - <jtags-action> for toolbar action definitions
 */

import { SelectionManager } from '../core/selection-manager.js';
import { ActionManager } from '../core/action-manager.js';
import { StateManager } from '../core/state-manager.js';

// Import child components for side-effect registration
import './jtags-column.js';
import './jtags-action.js';

export class JtagsTable extends HTMLElement {
  static get observedAttributes() {
    return ['base-url', 'id-field', 'show-checkbox', 'show-search'];
  }

  constructor() {
    super();
    this.selectionManager = null;
    this.actionManager = null;
    this.stateManager = null;
    this._cleanupTimeout = null;
    this._columns = [];
    this._actions = [];
    // Child component references
    this._toolbar = null;
    this._grid = null;
    this._pagination = null;
  }

  // ===========================================================================
  // Lifecycle
  // ===========================================================================

  connectedCallback() {
    // Clear any pending cleanup (HTMX swap detection)
    if (this._cleanupTimeout) {
      clearTimeout(this._cleanupTimeout);
      this._cleanupTimeout = null;
    }

    // Generate ID if not present
    if (!this.id) {
      this.id = `jtags-table-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Parse declarative configuration from child elements
    this._parseColumns();
    this._parseActions();

    // Find and cache child structural components
    this._findChildComponents();

    // Initialize managers
    this.stateManager = new StateManager(this.id);
    this.selectionManager = new SelectionManager(this.id);
    this.actionManager = new ActionManager(this.id, this.selectionManager);

    // Restore state if exists
    this._restoreState();

    // Attach event listeners
    this.addEventListener('click', this._handleClick);
    this.addEventListener('change', this._handleChange);

    // Attach child component event listeners
    this._attachChildEventListeners();

    // Emit ready event
    this.dispatchEvent(new CustomEvent('jtags-table-ready', {
      bubbles: true,
      detail: { tableId: this.id, columns: this._columns, actions: this._actions }
    }));
  }

  disconnectedCallback() {
    // Save state for potential HTMX swap restoration
    this._saveState();

    // Remove listeners
    this.removeEventListener('click', this._handleClick);
    this.removeEventListener('change', this._handleChange);

    // Delay state cleanup to detect HTMX swap vs permanent removal
    this._cleanupTimeout = setTimeout(() => {
      this.stateManager?.clear();
    }, 100);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    // Could emit config-changed event if needed
  }

  // ===========================================================================
  // Declarative Configuration Parsing
  // ===========================================================================

  /**
   * Parse column configuration from <jtags-column> child elements.
   * @private
   */
  _parseColumns() {
    const columnElements = this.querySelectorAll('jtags-column');
    this._columns = Array.from(columnElements).map(el => {
      // Use getConfig if available (component already registered), otherwise parse attributes directly
      if (typeof el.getConfig === 'function') {
        return el.getConfig();
      }
      return {
        key: el.getAttribute('key') || '',
        label: el.getAttribute('label') || '',
        sortable: el.hasAttribute('sortable'),
        searchable: el.hasAttribute('searchable'),
        width: el.getAttribute('width') || null
      };
    });
  }

  /**
   * Parse action configuration from <jtags-action> child elements.
   * @private
   */
  _parseActions() {
    const actionElements = this.querySelectorAll('jtags-action');
    this._actions = Array.from(actionElements).map(el => {
      // Use getConfig if available (component already registered), otherwise parse attributes directly
      if (typeof el.getConfig === 'function') {
        return el.getConfig();
      }
      return {
        key: el.getAttribute('key') || '',
        label: el.getAttribute('label') || '',
        icon: el.getAttribute('icon') || null,
        url: el.getAttribute('url') || '',
        method: el.getAttribute('method') || 'GET',
        confirm: el.hasAttribute('confirm'),
        confirmMessage: el.getAttribute('confirm-message') || null,
        selectionBased: el.hasAttribute('selection-based'),
        showLabel: el.hasAttribute('show-label')
      };
    });
  }

  /**
   * Find and cache child structural components.
   * @private
   */
  _findChildComponents() {
    this._toolbar = this.querySelector('jtags-toolbar');
    this._grid = this.querySelector('jtags-grid');
    this._pagination = this.querySelector('jtags-pagination');
  }

  /**
   * Attach event listeners for child component events.
   * @private
   */
  _attachChildEventListeners() {
    // Listen for sort events from grid
    this.addEventListener('jtags-sort', this._handleSortEvent);

    // Listen for search events from toolbar
    this.addEventListener('jtags-search', this._handleSearchEvent);

    // Listen for pagination events
    this.addEventListener('jtags-page-change', this._handlePageChangeEvent);
    this.addEventListener('jtags-size-change', this._handleSizeChangeEvent);
  }

  /**
   * Callback for when a child <jtags-column> element changes.
   * Called by child components.
   */
  _onColumnConfigChanged() {
    this._parseColumns();
    this._emitConfigChanged();
  }

  /**
   * Callback for when a child <jtags-action> element changes.
   * Called by child components.
   */
  _onActionConfigChanged() {
    this._parseActions();
    this._emitConfigChanged();
  }

  /**
   * Emit config-changed event when declarative configuration updates.
   * @private
   */
  _emitConfigChanged() {
    this.dispatchEvent(new CustomEvent('jtags-config-changed', {
      bubbles: true,
      detail: {
        tableId: this.id,
        columns: this._columns,
        actions: this._actions
      }
    }));
  }

  // ===========================================================================
  // Event Handlers (arrow functions to preserve `this`)
  // ===========================================================================

  _handleClick = (event) => {
    const target = event.target;

    // "Select all X matching" link
    if (target.matches('#select-all-matching')) {
      event.preventDefault();
      this.selectionManager.setFilterMode();
      this._updateBannerForFilterMode();
      this._emitSelectionChanged();
      return;
    }

    // "Clear selection" link
    if (target.matches('#clear-selection')) {
      event.preventDefault();
      this.clearSelection();
      return;
    }

    // Action buttons (use closest() to handle clicks on icons inside buttons)
    const actionButton = target.closest('.jtags-table__action--selection, .jtags-table__action--global');
    if (actionButton) {
      this._handleAction(actionButton);
      return;
    }
  };

  _handleChange = (event) => {
    const target = event.target;

    // Select all checkbox
    if (target.matches('#select-all')) {
      this._handleSelectAll(target);
      return;
    }

    // Row checkbox
    if (target.matches('input[name="select-item"]')) {
      this._handleRowCheckbox(target);
      return;
    }
  };

  /**
   * Handle sort event from grid component.
   * Updates hidden inputs and re-emits as jtags-table-sort for HTMX integration.
   */
  _handleSortEvent = (event) => {
    // Update hidden inputs for HTMX
    this._updateHiddenInput('sort', event.detail.column);
    this._updateHiddenInput('asc', event.detail.ascending);
    this._updateHiddenInput('page', 1); // Reset to page 1 on sort

    // Re-emit as table-level event for HTMX
    this.dispatchEvent(new CustomEvent('jtags-table-sort', {
      bubbles: true,
      detail: {
        column: event.detail.column,
        ascending: event.detail.ascending,
        tableId: this.id
      }
    }));
  };

  /**
   * Handle search event from toolbar component.
   * Updates hidden inputs and re-emits as jtags-table-search for HTMX integration.
   */
  _handleSearchEvent = (event) => {
    // Update hidden inputs for HTMX
    this._updateHiddenInput('page', 1); // Reset to page 1 on search

    // Re-emit as table-level event for HTMX
    this.dispatchEvent(new CustomEvent('jtags-table-search', {
      bubbles: true,
      detail: {
        field: event.detail.field,
        value: event.detail.value,
        tableId: this.id
      }
    }));
  };

  /**
   * Handle page change event from pagination component.
   * Updates hidden inputs and re-emits as jtags-table-page for HTMX integration.
   */
  _handlePageChangeEvent = (event) => {
    // Update hidden inputs for HTMX
    this._updateHiddenInput('page', event.detail.page);

    // Re-emit as table-level event for HTMX
    this.dispatchEvent(new CustomEvent('jtags-table-page', {
      bubbles: true,
      detail: {
        page: event.detail.page,
        tableId: this.id
      }
    }));
  };

  /**
   * Handle size change event from pagination component.
   * Updates hidden inputs and re-emits as jtags-table-size for HTMX integration.
   */
  _handleSizeChangeEvent = (event) => {
    // Update hidden inputs for HTMX
    this._updateHiddenInput('page', 1); // Reset to page 1 on size change

    // Re-emit as table-level event for HTMX
    this.dispatchEvent(new CustomEvent('jtags-table-size', {
      bubbles: true,
      detail: {
        size: event.detail.size,
        tableId: this.id
      }
    }));
  };

  /**
   * Update a hidden input value for HTMX integration.
   * @private
   * @param {string} name - Input name/id
   * @param {*} value - New value
   */
  _updateHiddenInput(name, value) {
    const input = this.querySelector(`#${name}`);
    if (input) {
      input.value = String(value);
    }
  }

  // ===========================================================================
  // Selection Logic
  // ===========================================================================

  _handleSelectAll(checkbox) {
    const rowCheckboxes = this.querySelectorAll('input[name="select-item"]');

    rowCheckboxes.forEach(cb => {
      cb.checked = checkbox.checked;
    });

    if (checkbox.checked) {
      const ids = Array.from(rowCheckboxes).map(cb => cb.value);
      this.selectionManager.selectAll(ids);
      this._showSelectionActions();
      this._showBannerIfMorePages();
    } else {
      this.selectionManager.clearSelection();
      this._hideSelectionActions();
      this._hideBanner();
    }

    this._emitSelectionChanged();
  }

  _handleRowCheckbox(checkbox) {
    if (checkbox.checked) {
      this.selectionManager.selectId(checkbox.value);
    } else {
      this.selectionManager.deselectId(checkbox.value);
    }

    this._updateSelectAllState();
    this._updateUIState();
    this._emitSelectionChanged();
  }

  _updateSelectAllState() {
    const selectAll = this.querySelector('#select-all');
    const checkboxes = Array.from(this.querySelectorAll('input[name="select-item"]'));

    if (!selectAll || checkboxes.length === 0) return;

    const allChecked = checkboxes.every(cb => cb.checked);
    const noneChecked = checkboxes.every(cb => !cb.checked);

    selectAll.indeterminate = !allChecked && !noneChecked;
    selectAll.checked = allChecked;
  }

  _updateUIState() {
    if (this.selectionManager.hasSelection()) {
      this._showSelectionActions();
    } else {
      this._hideSelectionActions();
      this._hideBanner();
      return;
    }

    const checkboxes = Array.from(this.querySelectorAll('input[name="select-item"]'));
    const allChecked = checkboxes.length > 0 && checkboxes.every(cb => cb.checked);

    if (allChecked && !this.selectionManager.isFilterMode()) {
      this._showBannerIfMorePages();
    } else if (!this.selectionManager.isFilterMode()) {
      this._hideBanner();
    }
  }

  // ===========================================================================
  // UI Updates
  // ===========================================================================

  _showSelectionActions() {
    // Use toolbar component method if available
    if (this._toolbar) {
      this._toolbar.showSelectionActions();
    } else {
      // Fallback to direct DOM query
      this.querySelectorAll('.jtags-table__action--selection').forEach(el => {
        el.classList.remove('jtags-hidden');
      });
    }
  }

  _hideSelectionActions() {
    // Use toolbar component method if available
    if (this._toolbar) {
      this._toolbar.hideSelectionActions();
    } else {
      // Fallback to direct DOM query
      this.querySelectorAll('.jtags-table__action--selection').forEach(el => {
        el.classList.add('jtags-hidden');
      });
    }
  }

  _showBannerIfMorePages() {
    // Use toolbar component if available
    if (this._toolbar) {
      const totalItems = this._toolbar.totalItems;
      const pageSize = this._toolbar.pageSize;
      if (totalItems > pageSize) {
        this._toolbar.showBanner();
      }
      return;
    }

    // Fallback to direct DOM query
    const banner = this.querySelector('#selection-banner');
    if (!banner) return;

    const totalItems = parseInt(banner.dataset.totalItems) || 0;
    const pageSize = parseInt(banner.dataset.pageSize) || 0;

    if (totalItems > pageSize) {
      banner.classList.remove('jtags-hidden');
    }
  }

  _hideBanner() {
    // Use toolbar component method if available
    if (this._toolbar) {
      this._toolbar.hideBanner();
    } else {
      // Fallback to direct DOM query
      this.querySelector('#selection-banner')?.classList.add('jtags-hidden');
    }
  }

  _updateBannerForFilterMode() {
    // Use toolbar component method if available
    if (this._toolbar) {
      this._toolbar.showAllSelectedBanner(this._toolbar.totalItems);
      return;
    }

    // Fallback to direct DOM query
    const banner = this.querySelector('#selection-banner');
    if (!banner) return;

    const totalItems = banner.dataset.totalItems;
    banner.innerHTML = `<p>All ${totalItems} items selected. <a id="clear-selection" href="#">Clear selection</a></p>`;
  }

  _resetBannerContent() {
    // Use toolbar component method if available
    if (this._toolbar) {
      this._toolbar.resetBanner();
      return;
    }

    // Fallback to direct DOM query
    const banner = this.querySelector('#selection-banner');
    if (!banner) return;

    const totalItems = parseInt(banner.dataset.totalItems) || 0;
    const pageSize = parseInt(banner.dataset.pageSize) || 0;

    banner.innerHTML = `<p>All ${pageSize} items on this page selected.
      <a id="select-all-matching" href="#">Select all ${totalItems}?</a>
    </p>`;
  }

  // ===========================================================================
  // Action Handling
  // ===========================================================================

  _handleAction(button) {
    const action = this.actionManager.getActionFromButton(button);

    if (this.actionManager.needsConfirmation(button)) {
      // Store pending action and show modal
      this.actionManager.setPendingAction(action);
      const totalItems = this._toolbar?.totalItems || 0;
      const message = this.actionManager.getConfirmationMessage(
        action.confirmMessage || 'Are you sure?',
        action.isSelectionBased,
        totalItems
      );
      this._showConfirmationModal(message);
    } else {
      // Execute immediately
      this._executeAction(action);
    }
  }

  /**
   * Get or create the confirmation modal element.
   * @private
   * @returns {HTMLElement}
   */
  _getOrCreateModal() {
    let modal = document.getElementById('jtags-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'jtags-modal';
      modal.className = 'jtags-modal jtags-hidden';
      modal.innerHTML = `
        <div class="jtags-modal__content">
          <p id="jtags-modal-message"></p>
          <button id="jtags-modal-confirm-btn" type="button">Confirm</button>
          <button id="jtags-modal-cancel-btn" type="button">Cancel</button>
        </div>
      `;
      document.body.appendChild(modal);

      // Attach event listeners
      modal.querySelector('#jtags-modal-confirm-btn').addEventListener('click', () => {
        this._handleModalConfirm();
      });
      modal.querySelector('#jtags-modal-cancel-btn').addEventListener('click', () => {
        this._hideModal();
      });
    }
    return modal;
  }

  /**
   * Show confirmation modal with message.
   * @private
   * @param {string} message
   */
  _showConfirmationModal(message) {
    const modal = this._getOrCreateModal();
    modal.querySelector('#jtags-modal-message').textContent = message;
    modal.classList.remove('jtags-hidden');
  }

  /**
   * Hide the modal.
   * @private
   */
  _hideModal() {
    const modal = document.getElementById('jtags-modal');
    if (modal) {
      modal.classList.add('jtags-hidden');
    }
    this.actionManager.clearPendingAction();
  }

  /**
   * Handle modal confirm button click.
   * @private
   */
  _handleModalConfirm() {
    if (this.actionManager.hasPendingAction()) {
      this._executeAction(this.actionManager.pendingAction);
    }
    this._hideModal();
  }

  /**
   * Execute an action - emit event and/or make request.
   * @private
   * @param {object} action
   */
  _executeAction(action) {
    // Build request params
    const filterElements = {
      searchField: this.querySelector('#searchField'),
      search: this.querySelector('#search')
    };
    const params = this.actionManager.buildActionParams(action.isSelectionBased, filterElements);

    // Emit event for listeners (including potential HTMX handlers)
    this._emitActionTriggered(action, null);

    // Make the actual request
    if (action.url) {
      this._makeActionRequest(action, params);
    }
  }

  /**
   * Make HTTP request for action.
   * @private
   * @param {object} action
   * @param {object} params
   */
  async _makeActionRequest(action, params) {
    try {
      const url = new URL(action.url, window.location.origin);
      const method = action.method || 'POST';

      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (method !== 'GET' && method !== 'HEAD') {
        options.body = JSON.stringify(params);
      } else {
        // Add params to URL for GET requests
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => url.searchParams.append(key, v));
          } else {
            url.searchParams.set(key, value);
          }
        });
      }

      const response = await fetch(url.toString(), options);

      if (response.ok) {
        // Clear selection after successful action
        this.clearSelection();

        // Emit success event
        this.dispatchEvent(new CustomEvent('jtags-action-success', {
          bubbles: true,
          detail: { action, response }
        }));

        // Trigger table refresh via HTMX event
        this.dispatchEvent(new CustomEvent('jtags-table-refresh', {
          bubbles: true
        }));
      } else {
        this.dispatchEvent(new CustomEvent('jtags-action-error', {
          bubbles: true,
          detail: { action, response, status: response.status }
        }));
      }
    } catch (error) {
      console.error('[jtags] Action request failed:', error);
      this.dispatchEvent(new CustomEvent('jtags-action-error', {
        bubbles: true,
        detail: { action, error }
      }));
    }
  }

  // ===========================================================================
  // State Persistence
  // ===========================================================================

  _saveState() {
    this.stateManager?.save(this.selectionManager?.getState() || {});
  }

  _restoreState() {
    const savedState = this.stateManager?.restore();
    if (!savedState) return;

    this.selectionManager.setState(savedState);

    // Restore checkbox visual states
    this.selectionManager.selectedIds.forEach(id => {
      const checkbox = this.querySelector(`input[name="select-item"][value="${id}"]`);
      if (checkbox) checkbox.checked = true;
    });

    this._updateSelectAllState();
    this._updateUIState();
  }

  // ===========================================================================
  // Custom Events
  // ===========================================================================

  _emitSelectionChanged() {
    this.dispatchEvent(new CustomEvent('selection-changed', {
      bubbles: true,
      detail: {
        selectedIds: [...this.selectionManager.selectedIds],
        selectionMode: this.selectionManager.selectionMode,
        count: this.selectionManager.getSelectedCount()
      }
    }));
  }

  _emitActionTriggered(action, button) {
    this.dispatchEvent(new CustomEvent('action-triggered', {
      bubbles: true,
      detail: {
        action: action.key || action.url,
        url: action.url,
        method: action.method,
        isSelectionBased: action.isSelectionBased,
        confirm: action.confirm,
        confirmMessage: action.confirmMessage,
        selectedIds: [...this.selectionManager.selectedIds],
        selectionMode: this.selectionManager.selectionMode,
        triggerElement: button
      }
    }));
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /** Clear all selections */
  clearSelection() {
    this.selectionManager.clearSelection();

    this.querySelectorAll('input[name="select-item"]').forEach(cb => {
      cb.checked = false;
    });

    const selectAll = this.querySelector('#select-all');
    if (selectAll) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
    }

    this._resetBannerContent();
    this._hideSelectionActions();
    this._hideBanner();
    this._emitSelectionChanged();
  }

  /** Get selected IDs */
  get selectedIds() {
    return [...(this.selectionManager?.selectedIds || [])];
  }

  /** Get selection mode */
  get selectionMode() {
    return this.selectionManager?.selectionMode || 'ids';
  }

  /** Check if has selection */
  get hasSelection() {
    return this.selectionManager?.hasSelection() || false;
  }

  /** Get column configuration from declarative child elements */
  get columns() {
    return [...this._columns];
  }

  /** Get action configuration from declarative child elements */
  get actions() {
    return [...this._actions];
  }

  /** Get searchable columns from declarative configuration */
  get searchableColumns() {
    return this._columns.filter(col => col.searchable);
  }

  /** Get sortable columns from declarative configuration */
  get sortableColumns() {
    return this._columns.filter(col => col.sortable);
  }

  /** Get the ID field attribute */
  get idField() {
    return this.getAttribute('id-field') || 'id';
  }

  /** Get whether to show checkboxes */
  get showCheckbox() {
    return this.hasAttribute('show-checkbox');
  }

  /** Get whether to show search */
  get showSearch() {
    return this.hasAttribute('show-search');
  }

  /** Get the toolbar child component */
  get toolbar() {
    return this._toolbar;
  }

  /** Get the grid child component */
  get grid() {
    return this._grid;
  }

  /** Get the pagination child component */
  get pagination() {
    return this._pagination;
  }
}

customElements.define('jtags-table', JtagsTable);