import { expect } from '@esm-bundle/chai';
import { StateManager } from '../../../main/resources/META-INF/resources/js/jtags/core/state-manager.js';

describe('StateManager', () => {
  let manager;
  const tableId = 'test-table';
  const stateKey = `jtags-table-${tableId}-state`;

  beforeEach(() => {
    sessionStorage.clear();
    manager = new StateManager(tableId);
  });

  describe('constructor', () => {
    it('should initialize with table ID', () => {
      expect(manager.tableId).to.equal(tableId);
      expect(manager.stateKey).to.equal(stateKey);
    });
  });

  describe('save()', () => {
    it('should save state to sessionStorage', () => {
      const state = { selectedIds: ['1', '2'], selectionMode: 'ids' };
      manager.save(state);
      const saved = sessionStorage.getItem(stateKey);
      expect(JSON.parse(saved)).to.deep.equal(state);
    });

    it('should overwrite existing state', () => {
      manager.save({ selectedIds: ['1'] });
      manager.save({ selectedIds: ['2', '3'] });
      const saved = JSON.parse(sessionStorage.getItem(stateKey));
      expect(saved.selectedIds).to.deep.equal(['2', '3']);
    });
  });

  describe('restore()', () => {
    it('should return null if no saved state', () => {
      expect(manager.restore()).to.be.null;
    });

    it('should restore saved state', () => {
      const state = { selectedIds: ['1', '2'], selectionMode: 'filter' };
      sessionStorage.setItem(stateKey, JSON.stringify(state));
      const restored = manager.restore();
      expect(restored).to.deep.equal(state);
    });

    it('should handle corrupted JSON gracefully', () => {
      sessionStorage.setItem(stateKey, 'not valid json');
      expect(manager.restore()).to.be.null;
    });
  });

  describe('clear()', () => {
    it('should remove state from sessionStorage', () => {
      sessionStorage.setItem(stateKey, JSON.stringify({ test: true }));
      manager.clear();
      expect(sessionStorage.getItem(stateKey)).to.be.null;
    });
  });
});
