/**
 * jtags Table - Main entry point
 *
 * Exports all web components and provides HTMX integration layer.
 */

// Core managers
import { SelectionManager } from './core/selection-manager.js';
import { ActionManager } from './core/action-manager.js';
import { StateManager } from './core/state-manager.js';

// Web Components
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

// ============================================================================
// HTMX Integration Layer
// ============================================================================

// Process HTMX on dynamically rendered elements (from jtags-action-cell, etc.)
document.body.addEventListener('jtags-render', function(event) {
  if (typeof htmx !== 'undefined' && event.detail?.element) {
    htmx.process(event.detail.element);
  }
});

// Handle modal confirm with HTMX - prevent auto-close, let HTMX close after request
document.body.addEventListener('jtags-modal-confirm', function(event) {
  const modal = event.target.closest('jtags-modal');
  const confirmBtn = modal?.confirmButton || event.target;

  // Check if confirm button has HTMX attributes
  const hasHtmxAction = confirmBtn.hasAttribute('hx-get') ||
                        confirmBtn.hasAttribute('hx-post') ||
                        confirmBtn.hasAttribute('hx-delete') ||
                        confirmBtn.hasAttribute('hx-put') ||
                        confirmBtn.hasAttribute('hx-patch');

  if (hasHtmxAction) {
    // Prevent default close - HTMX will handle the request
    event.preventDefault();

    // Add one-time listener to close modal after HTMX request completes
    confirmBtn.addEventListener('htmx:afterRequest', function closeAfterRequest() {
      confirmBtn.removeEventListener('htmx:afterRequest', closeAfterRequest);
      modal?.close();
    }, { once: true });
  }
});

// ============================================================================
// Exports
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
  // Manager classes (for advanced usage)
  SelectionManager,
  ActionManager,
  StateManager
};