/**
 * ActionManager - Handles action execution and confirmation modals for jtags tables.
 *
 * Manages pending actions, confirmation dialogs, and HTMX-based action execution.
 */
export class ActionManager {
  /**
   * @param {string} tableId - Unique identifier for the table
   * @param {SelectionManager} selectionManager - Reference to the selection manager
   */
  constructor(tableId, selectionManager) {
    this.tableId = tableId;
    this.selectionManager = selectionManager;
    this.pendingAction = null;
  }

  /**
   * Store action details for confirmation.
   * @param {object} action - Action configuration
   * @param {string} action.url - Action URL
   * @param {string} action.method - HTTP method
   * @param {boolean} action.isSelectionBased - Whether action operates on selected items
   * @param {string} [action.confirmMessage] - Confirmation message
   */
  setPendingAction(action) {
    this.pendingAction = action;
  }

  /**
   * Clear pending action.
   */
  clearPendingAction() {
    this.pendingAction = null;
  }

  /**
   * Check if there is a pending action.
   * @returns {boolean}
   */
  hasPendingAction() {
    return this.pendingAction !== null;
  }

  /**
   * Check if an action button requires confirmation.
   * @param {HTMLElement} button - Action button element
   * @returns {boolean}
   */
  needsConfirmation(button) {
    return button.dataset.confirm === 'true';
  }

  /**
   * Extract action configuration from button element.
   * @param {HTMLElement} button - Action button element
   * @returns {object} Action configuration
   */
  getActionFromButton(button) {
    return {
      url: button.dataset.url,
      method: button.dataset.method || 'POST',
      isSelectionBased: button.classList.contains('jtags-table__action--selection'),
      confirmMessage: button.dataset.confirmMessage
    };
  }

  /**
   * Build request parameters for action execution.
   * @param {boolean} isSelectionBased - Whether action operates on selected items
   * @param {object} [filterElements] - Optional DOM elements for filter values
   * @param {HTMLElement} [filterElements.searchField] - Search field select element
   * @param {HTMLElement} [filterElements.search] - Search input element
   * @returns {object} Request parameters
   */
  buildActionParams(isSelectionBased, filterElements = {}) {
    if (!isSelectionBased) {
      return {};
    }

    const params = {
      selectionMode: this.selectionManager.selectionMode
    };

    if (this.selectionManager.selectionMode === 'ids') {
      params.ids = this.selectionManager.selectedIds;
    } else {
      // Include filter params for filter mode
      if (filterElements.searchField) {
        params.searchField = filterElements.searchField.value;
      }
      if (filterElements.search) {
        params.search = filterElements.search.value;
      }
    }

    return params;
  }

  /**
   * Generate confirmation message with item count.
   * @param {string} baseMessage - Base confirmation message
   * @param {boolean} isSelectionBased - Whether action operates on selected items
   * @param {number} totalItems - Total items matching current filter
   * @returns {string} Full confirmation message
   */
  getConfirmationMessage(baseMessage, isSelectionBased, totalItems) {
    if (!isSelectionBased) {
      return baseMessage;
    }

    if (this.selectionManager.selectionMode === 'filter') {
      return `${baseMessage} (${totalItems} items matching filter)`;
    } else {
      return `${baseMessage} (${this.selectionManager.getSelectedCount()} items selected)`;
    }
  }
}
