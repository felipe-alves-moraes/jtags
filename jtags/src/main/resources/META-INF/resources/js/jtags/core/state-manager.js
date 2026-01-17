/**
 * StateManager - Handles state persistence for jtags tables.
 *
 * Saves and restores selection state across HTMX swaps using sessionStorage.
 */
export class StateManager {
  /**
   * @param {string} tableId - Unique identifier for the table
   */
  constructor(tableId) {
    this.tableId = tableId;
    this.stateKey = `jtags-table-${tableId}-state`;
  }

  /**
   * Save state to sessionStorage.
   * @param {object} state - State object to save
   */
  save(state) {
    try {
      sessionStorage.setItem(this.stateKey, JSON.stringify(state));
    } catch (e) {
      console.warn(`[jtags] Failed to save state for table ${this.tableId}:`, e);
    }
  }

  /**
   * Restore state from sessionStorage.
   * @returns {object|null} - Restored state or null if not found/invalid
   */
  restore() {
    try {
      const saved = sessionStorage.getItem(this.stateKey);
      if (!saved) return null;
      return JSON.parse(saved);
    } catch (e) {
      console.warn(`[jtags] Failed to restore state for table ${this.tableId}:`, e);
      return null;
    }
  }

  /**
   * Clear saved state from sessionStorage.
   */
  clear() {
    sessionStorage.removeItem(this.stateKey);
  }
}
