/**
 * jtags Table - Main entry point (Facade)
 *
 * This file maintains backward compatibility with existing usage while
 * internally delegating to the new manager classes.
 */

import { SelectionManager } from './core/selection-manager.js';
import { ActionManager } from './core/action-manager.js';
import { StateManager } from './core/state-manager.js';
import { JtagsTable } from './components/jtags-table.js';
import { JtagsColumn } from './components/jtags-column.js';
import { JtagsAction } from './components/jtags-action.js';
import { JtagsCell } from './components/jtags-cell.js';
import { JtagsActionCell } from './components/jtags-action-cell.js';
import { JtagsRow } from './components/jtags-row.js';
import { JtagsGrid } from './components/jtags-grid.js';
import { JtagsToolbar } from './components/jtags-toolbar.js';
import { JtagsPagination } from './components/jtags-pagination.js';
import { JtagsModal } from './components/jtags-modal.js';

// Default table ID - will be updated when table is found
const DEFAULT_TABLE_ID = 'jtags-table-default';

// Manager instances - lazily initialized
let selectionManager = null;
let actionManager = null;
let stateManager = null;

/**
 * Initialize managers for the table.
 * Called lazily on first interaction.
 */
function initManagers() {
  if (selectionManager) return;

  const tableId = document.querySelector('[data-jtags-table-id]')?.dataset.jtagsTableId || DEFAULT_TABLE_ID;
  stateManager = new StateManager(tableId);
  selectionManager = new SelectionManager(tableId);
  actionManager = new ActionManager(tableId, selectionManager);
}

// ============================================================================
// Backward Compatibility Layer
// ============================================================================

// Expose state variables as getters/setters for backward compatibility
Object.defineProperty(window, 'selectionMode', {
  get: () => {
    initManagers();
    return selectionManager.selectionMode;
  },
  set: (value) => {
    initManagers();
    selectionManager.selectionMode = value;
  }
});

Object.defineProperty(window, 'selectedIds', {
  get: () => {
    initManagers();
    return selectionManager.selectedIds;
  },
  set: (value) => {
    initManagers();
    selectionManager.selectedIds = value;
  }
});

Object.defineProperty(window, 'pendingAction', {
  get: () => {
    initManagers();
    return actionManager.pendingAction;
  },
  set: (value) => {
    initManagers();
    actionManager.pendingAction = value;
  }
});

// ============================================================================
// Modal Functions
// ============================================================================

function closeModal() {
  document.getElementById('jtags-modal').classList.add('jtags-hidden');
}

function openActionModal(button) {
  initManagers();

  const message = button.dataset.confirmMessage;
  const isSelectionBased = button.classList.contains('jtags-table__action--selection');

  const banner = document.getElementById('selection-banner');
  const totalItems = parseInt(banner.dataset.totalItems);

  actionManager.setPendingAction({
    url: button.dataset.url,
    method: button.dataset.method,
    isSelectionBased: isSelectionBased
  });

  const confirmMessage = actionManager.getConfirmationMessage(message, isSelectionBased, totalItems);
  document.getElementById('jtags-modal-message').textContent = confirmMessage;
  document.getElementById('jtags-modal').classList.remove('jtags-hidden');
}

function confirmAction() {
  initManagers();

  const filterElements = {
    searchField: document.getElementById('searchField'),
    search: document.getElementById('search')
  };

  const params = actionManager.buildActionParams(
    actionManager.pendingAction.isSelectionBased,
    filterElements
  );

  htmx.ajax(actionManager.pendingAction.method, actionManager.pendingAction.url, {
    target: '#table-container',
    swap: 'outerHTML',
    values: params
  }).then(() => {
    closeModal();
    // Reset selection state after successful action
    if (actionManager.pendingAction.isSelectionBased) {
      selectionManager.clearSelection();
    }
    actionManager.clearPendingAction();
  });
}

function executeAction(button) {
  const url = button.dataset.url;
  const method = button.dataset.method;

  htmx.ajax(method, url, {
    target: '#table-container',
    swap: 'outerHTML'
  });
}

function handleAction(button) {
  initManagers();

  if (actionManager.needsConfirmation(button)) {
    openActionModal(button);
  } else {
    executeAction(button);
  }
}

// ============================================================================
// Selection Functions
// ============================================================================

function handleSelectAll(checkbox) {
  initManagers();

  const rowCheckboxes = document.querySelectorAll('input[name="select-item"]');

  rowCheckboxes.forEach(cb => {
    cb.checked = checkbox.checked;
  });

  if (checkbox.checked) {
    const ids = Array.from(rowCheckboxes).map(cb => cb.value);
    selectionManager.selectAll(ids);
    showSelectionActions();
    showBannerIfMorePages();
  } else {
    selectionManager.clearSelection();
    hideSelectionActions();
    hideBanner();
  }
}

function handleRowCheckbox(checkbox) {
  initManagers();

  const id = checkbox.value;

  if (checkbox.checked) {
    selectionManager.selectId(id);
  } else {
    selectionManager.deselectId(id);
  }

  updateSelectAllState();
  updateUIState();
}

function handleSelectAllMatching() {
  initManagers();
  selectionManager.setFilterMode();
  updateBannerForFilterMode();
}

function handleClearSelection() {
  initManagers();
  selectionManager.clearSelection();

  document.querySelectorAll('input[name="select-item"]').forEach(cb => {
    cb.checked = false;
  });
  document.getElementById('select-all').checked = false;
  document.getElementById('select-all').indeterminate = false;

  const banner = document.getElementById('selection-banner');
  const totalItems = parseInt(banner.dataset.totalItems);
  const pageSize = parseInt(banner.dataset.pageSize);

  banner.innerHTML = `<p>All ${pageSize} items on this page selected.
            <a id="select-all-matching" href="#">Select all ${totalItems}?</a>
        </p>`;

  hideSelectionActions();
  hideBanner();
}

function updateSelectAllState() {
  const checkboxes = Array.from(
    document.querySelectorAll('input[name="select-item"]'));
  const selectAll = document.getElementById('select-all');

  const allChecked = checkboxes.every(cb => cb.checked);
  const noneChecked = checkboxes.every(cb => !cb.checked);

  if (allChecked) {
    selectAll.indeterminate = false;
    selectAll.checked = true;
  } else if (noneChecked) {
    selectAll.indeterminate = false;
    selectAll.checked = false;
  } else {
    selectAll.indeterminate = true;
  }
}

function updateUIState() {
  initManagers();

  if (selectionManager.hasSelection()) {
    showSelectionActions();
  } else {
    hideSelectionActions();
    hideBanner();
  }

  // Only show banner if all visible are selected AND more pages exist
  const checkboxes = Array.from(
    document.querySelectorAll('input[name="select-item"]'));
  const allChecked = checkboxes.every(cb => cb.checked);

  if (allChecked && !selectionManager.isFilterMode()) {
    showBannerIfMorePages();
  } else if (!selectionManager.isFilterMode()) {
    hideBanner();
  }
}

function showSelectionActions() {
  document.querySelectorAll('.jtags-table__action--selection')
    .forEach(it => {
      it.classList.remove('jtags-hidden');
    });
}

function hideSelectionActions() {
  document.querySelectorAll('.jtags-table__action--selection')
    .forEach(it => {
      it.classList.add('jtags-hidden');
    });
}

function showBannerIfMorePages() {
  const banner = document.getElementById('selection-banner');
  const totalItems = parseInt(banner.dataset.totalItems);
  const pageSize = parseInt(banner.dataset.pageSize);

  if (totalItems > pageSize) {
    banner.classList.remove('jtags-hidden');
  }
}

function hideBanner() {
  document.getElementById('selection-banner').classList.add('jtags-hidden');
}

function updateBannerForFilterMode() {
  const banner = document.getElementById('selection-banner');
  const totalItems = banner.dataset.totalItems;
  banner.innerHTML = `<p>All ${totalItems} items selected. <a id="clear-selection" href="#">Clear selection</a></p>`;
}

// ============================================================================
// Event Listeners
// ============================================================================

// Modal handlers - these elements are outside swap zone, attach once
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('jtags-modal');
  if (modal) {
    modal.addEventListener('click', closeModal);
    const modalContent = modal.querySelector('.jtags-modal__content');
    if (modalContent) {
      modalContent.addEventListener('click', function(event) {
        event.stopPropagation();
      });
    }
  }
});

// Delegated handlers - work for elements inside swap zone
document.body.addEventListener('click', function(event) {
  // Select all checkbox
  if (event.target.matches('#select-all')) {
    handleSelectAll(event.target);
  }

  // Row checkbox
  if (event.target.matches('input[name="select-item"]')) {
    handleRowCheckbox(event.target);
  }

  // "Select all X matching" link in banner
  if (event.target.matches('#select-all-matching')) {
    handleSelectAllMatching();
  }

  // "Clear selection" link in banner
  if (event.target.matches('#clear-selection')) {
    handleClearSelection();
  }

  // Action buttons
  if (event.target.matches('.jtags-table__action--selection')) {
    handleAction(event.target);
  }

  if (event.target.matches('.jtags-table__action--global')) {
    handleAction(event.target);
  }
});

// Reset selection state on HTMX swap
document.body.addEventListener('htmx:afterSwap', function(event) {
  if (event.detail.target.id === 'table-container') {
    initManagers();
    selectionManager.clearSelection();
  }
});

// ============================================================================
// Exports for ES Module usage
// ============================================================================

export {
  // Web Components
  JtagsTable,
  JtagsColumn,
  JtagsAction,
  JtagsCell,
  JtagsActionCell,
  JtagsRow,
  JtagsGrid,
  JtagsToolbar,
  JtagsPagination,
  JtagsModal,
  // Manager classes
  SelectionManager,
  ActionManager,
  StateManager,
  // Functions
  closeModal,
  handleAction,
  confirmAction,
  executeAction,
  handleSelectAll,
  handleRowCheckbox,
  handleSelectAllMatching,
  handleClearSelection,
  updateSelectAllState,
  updateUIState,
  showSelectionActions,
  hideSelectionActions,
  showBannerIfMorePages,
  hideBanner,
  updateBannerForFilterMode
};
