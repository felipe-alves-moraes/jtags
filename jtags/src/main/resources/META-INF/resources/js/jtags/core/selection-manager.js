/**
 * SelectionManager - Handles row selection state for jtags tables.
 *
 * Manages selection of individual rows, select all functionality,
 * and filter-based selection mode.
 */
export class SelectionManager {
  /**
   * @param {string} tableId - Unique identifier for the table
   */
  constructor(tableId) {
    this.tableId = tableId;
    this.selectedIds = [];
    this.selectionMode = 'ids'; // 'ids' | 'filter'
  }

  /**
   * Select a single ID.
   * @param {string} id - ID to select
   */
  selectId(id) {
    if (!this.selectedIds.includes(id)) {
      this.selectedIds.push(id);
    }
  }

  /**
   * Deselect a single ID.
   * @param {string} id - ID to deselect
   */
  deselectId(id) {
    this.selectedIds = this.selectedIds.filter(i => i !== id);
    // Revert to ids mode when manually deselecting
    this.selectionMode = 'ids';
  }

  /**
   * Select all provided IDs.
   * @param {string[]} ids - Array of IDs to select
   */
  selectAll(ids) {
    this.selectedIds = [...ids];
  }

  /**
   * Clear all selections and reset to ids mode.
   */
  clearSelection() {
    this.selectedIds = [];
    this.selectionMode = 'ids';
  }

  /**
   * Switch to filter mode (select all matching current filter).
   */
  setFilterMode() {
    this.selectionMode = 'filter';
  }

  /**
   * Check if a specific ID is selected.
   * @param {string} id - ID to check
   * @returns {boolean}
   */
  isSelected(id) {
    return this.selectedIds.includes(id);
  }

  /**
   * Get the count of selected items.
   * @returns {number}
   */
  getSelectedCount() {
    return this.selectedIds.length;
  }

  /**
   * Check if there is any selection (ids or filter mode).
   * @returns {boolean}
   */
  hasSelection() {
    return this.selectionMode === 'filter' || this.selectedIds.length > 0;
  }

  /**
   * Check if in filter mode.
   * @returns {boolean}
   */
  isFilterMode() {
    return this.selectionMode === 'filter';
  }

  /**
   * Export current state for persistence.
   * @returns {object}
   */
  getState() {
    return {
      selectedIds: [...this.selectedIds],
      selectionMode: this.selectionMode
    };
  }

  /**
   * Restore state from persisted object.
   * @param {object} state - State object with selectedIds and selectionMode
   */
  setState(state) {
    if (state && Array.isArray(state.selectedIds)) {
      this.selectedIds = [...state.selectedIds];
    }
    if (state && (state.selectionMode === 'ids' || state.selectionMode === 'filter')) {
      this.selectionMode = state.selectionMode;
    }
  }
}
