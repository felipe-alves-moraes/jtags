import { expect } from '@esm-bundle/chai';
import { SelectionManager } from '../../../main/resources/META-INF/resources/js/jtags/core/selection-manager.js';

describe('SelectionManager', () => {
  let manager;
  const tableId = 'test-table';

  beforeEach(() => {
    manager = new SelectionManager(tableId);
  });

  describe('constructor', () => {
    it('should initialize with empty selection', () => {
      expect(manager.selectedIds).to.deep.equal([]);
      expect(manager.selectionMode).to.equal('ids');
    });

    it('should store the table ID', () => {
      expect(manager.tableId).to.equal(tableId);
    });
  });

  describe('selectId()', () => {
    it('should add ID to selection', () => {
      manager.selectId('1');
      expect(manager.selectedIds).to.include('1');
    });

    it('should not add duplicate IDs', () => {
      manager.selectId('1');
      manager.selectId('1');
      expect(manager.selectedIds).to.deep.equal(['1']);
    });

    it('should add multiple different IDs', () => {
      manager.selectId('1');
      manager.selectId('2');
      expect(manager.selectedIds).to.deep.equal(['1', '2']);
    });
  });

  describe('deselectId()', () => {
    it('should remove ID from selection', () => {
      manager.selectId('1');
      manager.selectId('2');
      manager.deselectId('1');
      expect(manager.selectedIds).to.deep.equal(['2']);
    });

    it('should revert to ids mode when deselecting', () => {
      manager.setFilterMode();
      manager.deselectId('1');
      expect(manager.selectionMode).to.equal('ids');
    });

    it('should handle deselecting non-existent ID', () => {
      manager.selectId('1');
      manager.deselectId('999');
      expect(manager.selectedIds).to.deep.equal(['1']);
    });
  });

  describe('selectAll()', () => {
    it('should set all provided IDs as selected', () => {
      manager.selectAll(['1', '2', '3']);
      expect(manager.selectedIds).to.deep.equal(['1', '2', '3']);
    });

    it('should replace existing selection', () => {
      manager.selectId('99');
      manager.selectAll(['1', '2']);
      expect(manager.selectedIds).to.deep.equal(['1', '2']);
    });
  });

  describe('clearSelection()', () => {
    it('should clear all selected IDs', () => {
      manager.selectAll(['1', '2', '3']);
      manager.clearSelection();
      expect(manager.selectedIds).to.deep.equal([]);
    });

    it('should reset to ids mode', () => {
      manager.setFilterMode();
      manager.clearSelection();
      expect(manager.selectionMode).to.equal('ids');
    });
  });

  describe('setFilterMode()', () => {
    it('should switch to filter mode', () => {
      manager.setFilterMode();
      expect(manager.selectionMode).to.equal('filter');
    });
  });

  describe('isSelected()', () => {
    it('should return true for selected IDs', () => {
      manager.selectId('1');
      expect(manager.isSelected('1')).to.be.true;
    });

    it('should return false for non-selected IDs', () => {
      expect(manager.isSelected('999')).to.be.false;
    });
  });

  describe('getSelectedCount()', () => {
    it('should return count of selected IDs', () => {
      manager.selectAll(['1', '2', '3']);
      expect(manager.getSelectedCount()).to.equal(3);
    });

    it('should return 0 when no selection', () => {
      expect(manager.getSelectedCount()).to.equal(0);
    });
  });

  describe('hasSelection()', () => {
    it('should return false when no selection', () => {
      expect(manager.hasSelection()).to.be.false;
    });

    it('should return true when has selection', () => {
      manager.selectId('1');
      expect(manager.hasSelection()).to.be.true;
    });

    it('should return true in filter mode even with no IDs', () => {
      manager.setFilterMode();
      expect(manager.hasSelection()).to.be.true;
    });
  });

  describe('isFilterMode()', () => {
    it('should return false by default', () => {
      expect(manager.isFilterMode()).to.be.false;
    });

    it('should return true after setFilterMode', () => {
      manager.setFilterMode();
      expect(manager.isFilterMode()).to.be.true;
    });
  });

  describe('getState() / setState()', () => {
    it('should export current state', () => {
      manager.selectAll(['1', '2']);
      const state = manager.getState();
      expect(state.selectedIds).to.deep.equal(['1', '2']);
      expect(state.selectionMode).to.equal('ids');
    });

    it('should restore state from object', () => {
      manager.setState({ selectedIds: ['3', '4'], selectionMode: 'filter' });
      expect(manager.selectedIds).to.deep.equal(['3', '4']);
      expect(manager.selectionMode).to.equal('filter');
    });

    it('should handle null state gracefully', () => {
      manager.selectId('1');
      manager.setState(null);
      // Should keep existing state
      expect(manager.selectedIds).to.deep.equal(['1']);
    });

    it('should handle invalid selectionMode gracefully', () => {
      manager.setState({ selectedIds: ['1'], selectionMode: 'invalid' });
      expect(manager.selectedIds).to.deep.equal(['1']);
      expect(manager.selectionMode).to.equal('ids'); // Should keep default
    });

    it('should create a copy of selectedIds (no reference)', () => {
      const ids = ['1', '2'];
      manager.selectAll(ids);
      ids.push('3');
      expect(manager.selectedIds).to.deep.equal(['1', '2']); // Should not include '3'

      const state = manager.getState();
      state.selectedIds.push('4');
      expect(manager.selectedIds).to.deep.equal(['1', '2']); // Should not include '4'
    });
  });
});
