import { expect } from '@esm-bundle/chai';
import { ActionManager } from '../../../main/resources/META-INF/resources/js/jtags/core/action-manager.js';
import { SelectionManager } from '../../../main/resources/META-INF/resources/js/jtags/core/selection-manager.js';

describe('ActionManager', () => {
  let manager;
  let selectionManager;
  const tableId = 'test-table';

  beforeEach(() => {
    selectionManager = new SelectionManager(tableId);
    manager = new ActionManager(tableId, selectionManager);
  });

  describe('constructor', () => {
    it('should initialize with no pending action', () => {
      expect(manager.pendingAction).to.be.null;
    });

    it('should store reference to selection manager', () => {
      expect(manager.selectionManager).to.equal(selectionManager);
    });

    it('should store table ID', () => {
      expect(manager.tableId).to.equal(tableId);
    });
  });

  describe('setPendingAction()', () => {
    it('should store action details', () => {
      const action = {
        url: '/api/delete',
        method: 'DELETE',
        isSelectionBased: true,
        confirmMessage: 'Delete items?'
      };
      manager.setPendingAction(action);
      expect(manager.pendingAction).to.deep.equal(action);
    });
  });

  describe('clearPendingAction()', () => {
    it('should clear pending action', () => {
      manager.setPendingAction({ url: '/test' });
      manager.clearPendingAction();
      expect(manager.pendingAction).to.be.null;
    });
  });

  describe('hasPendingAction()', () => {
    it('should return false when no pending action', () => {
      expect(manager.hasPendingAction()).to.be.false;
    });

    it('should return true when action is pending', () => {
      manager.setPendingAction({ url: '/test' });
      expect(manager.hasPendingAction()).to.be.true;
    });
  });

  describe('needsConfirmation()', () => {
    it('should return true when confirm attribute is true', () => {
      const button = document.createElement('button');
      button.dataset.confirm = 'true';
      expect(manager.needsConfirmation(button)).to.be.true;
    });

    it('should return false when confirm attribute is false', () => {
      const button = document.createElement('button');
      button.dataset.confirm = 'false';
      expect(manager.needsConfirmation(button)).to.be.false;
    });

    it('should return false when confirm attribute is not set', () => {
      const button = document.createElement('button');
      expect(manager.needsConfirmation(button)).to.be.false;
    });
  });

  describe('getActionFromButton()', () => {
    it('should extract action configuration from button', () => {
      const button = document.createElement('button');
      button.dataset.url = '/api/delete';
      button.dataset.method = 'DELETE';
      button.dataset.confirmMessage = 'Are you sure?';
      button.classList.add('jtags-table__action--selection');

      const action = manager.getActionFromButton(button);
      expect(action.url).to.equal('/api/delete');
      expect(action.method).to.equal('DELETE');
      expect(action.confirmMessage).to.equal('Are you sure?');
      expect(action.isSelectionBased).to.be.true;
    });

    it('should default method to POST', () => {
      const button = document.createElement('button');
      button.dataset.url = '/api/action';

      const action = manager.getActionFromButton(button);
      expect(action.method).to.equal('POST');
    });

    it('should detect non-selection actions', () => {
      const button = document.createElement('button');
      button.dataset.url = '/api/export';
      button.classList.add('jtags-table__action--global');

      const action = manager.getActionFromButton(button);
      expect(action.isSelectionBased).to.be.false;
    });
  });

  describe('buildActionParams()', () => {
    it('should return empty object for non-selection actions', () => {
      const params = manager.buildActionParams(false);
      expect(params).to.deep.equal({});
    });

    it('should include selection mode and ids for ids mode', () => {
      selectionManager.selectAll(['1', '2', '3']);
      const params = manager.buildActionParams(true);
      expect(params.selectionMode).to.equal('ids');
      expect(params.ids).to.deep.equal(['1', '2', '3']);
    });

    it('should include selection mode for filter mode', () => {
      selectionManager.setFilterMode();
      const params = manager.buildActionParams(true);
      expect(params.selectionMode).to.equal('filter');
      expect(params.ids).to.be.undefined;
    });

    it('should include filter elements when provided in filter mode', () => {
      selectionManager.setFilterMode();

      const searchField = document.createElement('select');
      const option = document.createElement('option');
      option.value = 'name';
      option.selected = true;
      searchField.appendChild(option);

      const search = document.createElement('input');
      search.value = 'test query';

      const params = manager.buildActionParams(true, { searchField, search });
      expect(params.selectionMode).to.equal('filter');
      expect(params.searchField).to.equal('name');
      expect(params.search).to.equal('test query');
    });
  });

  describe('getConfirmationMessage()', () => {
    it('should return plain message for non-selection actions', () => {
      const msg = manager.getConfirmationMessage('Export all?', false, 100);
      expect(msg).to.equal('Export all?');
    });

    it('should return message with count for ids mode', () => {
      selectionManager.selectAll(['1', '2', '3']);
      const msg = manager.getConfirmationMessage('Delete items?', true, 100);
      expect(msg).to.equal('Delete items? (3 items selected)');
    });

    it('should return message with total for filter mode', () => {
      selectionManager.setFilterMode();
      const msg = manager.getConfirmationMessage('Delete items?', true, 100);
      expect(msg).to.equal('Delete items? (100 items matching filter)');
    });
  });
});
