import { expect } from '@esm-bundle/chai';
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-table.js';
// Import child components for integration tests
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-toolbar.js';
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-grid.js';
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-pagination.js';

describe('JtagsTable', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    sessionStorage.clear();
  });

  afterEach(() => {
    container.remove();
  });

  function createTable(html) {
    container.innerHTML = html;
    return container.querySelector('jtags-table');
  }

  describe('initialization', () => {
    it('should register as custom element', () => {
      expect(customElements.get('jtags-table')).to.exist;
    });

    it('should generate ID if not provided', () => {
      const table = createTable('<jtags-table></jtags-table>');
      expect(table.id).to.match(/^jtags-table-[a-z0-9]+$/);
    });

    it('should keep provided ID', () => {
      const table = createTable('<jtags-table id="my-table"></jtags-table>');
      expect(table.id).to.equal('my-table');
    });

    it('should emit jtags-table-ready event', (done) => {
      container.innerHTML = '';
      container.addEventListener('jtags-table-ready', (e) => {
        expect(e.detail.tableId).to.exist;
        done();
      }, { once: true });
      container.innerHTML = '<jtags-table></jtags-table>';
    });
  });

  describe('selection', () => {
    const tableHtml = `
      <jtags-table id="test-table">
        <input type="checkbox" id="select-all" />
        <input type="checkbox" name="select-item" value="1" />
        <input type="checkbox" name="select-item" value="2" />
        <input type="checkbox" name="select-item" value="3" />
        <div id="selection-banner" class="jtags-hidden" data-total-items="100" data-page-size="10">
          <p>All 10 items on this page selected.
            <a id="select-all-matching" href="#">Select all 100?</a>
          </p>
        </div>
        <button class="jtags-table__action--selection jtags-hidden">Delete</button>
      </jtags-table>
    `;

    it('should select individual row', () => {
      const table = createTable(tableHtml);
      const checkbox = table.querySelector('input[value="1"]');

      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      expect(table.selectedIds).to.deep.equal(['1']);
    });

    it('should emit selection-changed on row select', (done) => {
      const table = createTable(tableHtml);
      const checkbox = table.querySelector('input[value="1"]');

      table.addEventListener('selection-changed', (e) => {
        expect(e.detail.selectedIds).to.deep.equal(['1']);
        expect(e.detail.count).to.equal(1);
        done();
      }, { once: true });

      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    });

    it('should select all rows', () => {
      const table = createTable(tableHtml);
      const selectAll = table.querySelector('#select-all');

      selectAll.checked = true;
      selectAll.dispatchEvent(new Event('change', { bubbles: true }));

      expect(table.selectedIds).to.deep.equal(['1', '2', '3']);
    });

    it('should deselect all rows', () => {
      const table = createTable(tableHtml);
      const selectAll = table.querySelector('#select-all');

      // Select all first
      selectAll.checked = true;
      selectAll.dispatchEvent(new Event('change', { bubbles: true }));

      // Then deselect
      selectAll.checked = false;
      selectAll.dispatchEvent(new Event('change', { bubbles: true }));

      expect(table.selectedIds).to.deep.equal([]);
    });

    it('should update select-all indeterminate state', () => {
      const table = createTable(tableHtml);
      const selectAll = table.querySelector('#select-all');
      const checkbox1 = table.querySelector('input[value="1"]');

      checkbox1.checked = true;
      checkbox1.dispatchEvent(new Event('change', { bubbles: true }));

      expect(selectAll.indeterminate).to.be.true;
    });

    it('should show selection actions when items selected', () => {
      const table = createTable(tableHtml);
      const checkbox = table.querySelector('input[value="1"]');
      const action = table.querySelector('.jtags-table__action--selection');

      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      expect(action.classList.contains('jtags-hidden')).to.be.false;
    });

    it('should hide selection actions when cleared', () => {
      const table = createTable(tableHtml);
      const checkbox = table.querySelector('input[value="1"]');
      const action = table.querySelector('.jtags-table__action--selection');

      // Select
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      // Deselect
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      expect(action.classList.contains('jtags-hidden')).to.be.true;
    });

    it('should show banner when all on page selected and more pages exist', () => {
      const table = createTable(tableHtml);
      const selectAll = table.querySelector('#select-all');
      const banner = table.querySelector('#selection-banner');

      selectAll.checked = true;
      selectAll.dispatchEvent(new Event('change', { bubbles: true }));

      expect(banner.classList.contains('jtags-hidden')).to.be.false;
    });

    it('should switch to filter mode on select-all-matching click', () => {
      const table = createTable(tableHtml);
      const selectAll = table.querySelector('#select-all');
      const selectAllMatching = table.querySelector('#select-all-matching');

      // First select all on page
      selectAll.checked = true;
      selectAll.dispatchEvent(new Event('change', { bubbles: true }));

      // Then click select all matching
      selectAllMatching.click();

      expect(table.selectionMode).to.equal('filter');
    });
  });

  describe('clearSelection', () => {
    it('should clear all selections via public API', () => {
      const table = createTable(`
        <jtags-table id="test-table">
          <input type="checkbox" id="select-all" />
          <input type="checkbox" name="select-item" value="1" checked />
          <input type="checkbox" name="select-item" value="2" checked />
          <div id="selection-banner" class="jtags-hidden" data-total-items="10" data-page-size="10"></div>
        </jtags-table>
      `);

      // Manually trigger to register the selections
      table.querySelector('input[value="1"]').dispatchEvent(new Event('change', { bubbles: true }));
      table.querySelector('input[value="2"]').dispatchEvent(new Event('change', { bubbles: true }));

      table.clearSelection();

      expect(table.selectedIds).to.deep.equal([]);
      expect(table.querySelector('input[value="1"]').checked).to.be.false;
      expect(table.querySelector('input[value="2"]').checked).to.be.false;
    });
  });

  describe('action events', () => {
    it('should emit action-triggered on action button click', (done) => {
      const table = createTable(`
        <jtags-table id="test-table">
          <button class="jtags-table__action--global"
                  data-url="/api/export"
                  data-method="POST">
            Export
          </button>
        </jtags-table>
      `);

      table.addEventListener('action-triggered', (e) => {
        expect(e.detail.url).to.equal('/api/export');
        expect(e.detail.method).to.equal('POST');
        expect(e.detail.isSelectionBased).to.be.false;
        done();
      }, { once: true });

      table.querySelector('button').click();
    });

    it('should include selected IDs in action event', (done) => {
      const table = createTable(`
        <jtags-table id="test-table">
          <input type="checkbox" name="select-item" value="1" />
          <input type="checkbox" name="select-item" value="2" />
          <button class="jtags-table__action--selection jtags-hidden"
                  data-url="/api/delete"
                  data-method="DELETE">
            Delete
          </button>
          <div id="selection-banner" class="jtags-hidden" data-total-items="10" data-page-size="10"></div>
        </jtags-table>
      `);

      // Select items
      const cb1 = table.querySelector('input[value="1"]');
      const cb2 = table.querySelector('input[value="2"]');
      cb1.checked = true;
      cb1.dispatchEvent(new Event('change', { bubbles: true }));
      cb2.checked = true;
      cb2.dispatchEvent(new Event('change', { bubbles: true }));

      table.addEventListener('action-triggered', (e) => {
        expect(e.detail.selectedIds).to.deep.equal(['1', '2']);
        expect(e.detail.isSelectionBased).to.be.true;
        done();
      }, { once: true });

      table.querySelector('button').click();
    });
  });

  describe('state persistence', () => {
    it('should save state on disconnect', () => {
      const table = createTable(`
        <jtags-table id="persist-test">
          <input type="checkbox" name="select-item" value="1" />
        </jtags-table>
      `);

      const checkbox = table.querySelector('input[value="1"]');
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      table.remove();

      const saved = sessionStorage.getItem('jtags-table-persist-test-state');
      expect(saved).to.exist;
      expect(JSON.parse(saved).selectedIds).to.deep.equal(['1']);
    });

    it('should restore state on reconnect', (done) => {
      // Pre-save state
      sessionStorage.setItem('jtags-table-restore-test-state', JSON.stringify({
        selectedIds: ['2'],
        selectionMode: 'ids'
      }));

      const table = createTable(`
        <jtags-table id="restore-test">
          <input type="checkbox" name="select-item" value="1" />
          <input type="checkbox" name="select-item" value="2" />
          <div id="selection-banner" class="jtags-hidden" data-total-items="10" data-page-size="10"></div>
        </jtags-table>
      `);

      // Use setTimeout to allow connectedCallback to complete
      setTimeout(() => {
        expect(table.selectedIds).to.deep.equal(['2']);
        expect(table.querySelector('input[value="2"]').checked).to.be.true;
        done();
      }, 0);
    });
  });

  describe('public API', () => {
    it('should expose selectedIds getter', () => {
      const table = createTable(`
        <jtags-table id="test">
          <input type="checkbox" name="select-item" value="1" />
          <div id="selection-banner" class="jtags-hidden" data-total-items="10" data-page-size="10"></div>
        </jtags-table>
      `);

      const checkbox = table.querySelector('input[value="1"]');
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      expect(table.selectedIds).to.deep.equal(['1']);
    });

    it('should expose selectionMode getter', () => {
      const table = createTable('<jtags-table></jtags-table>');
      expect(table.selectionMode).to.equal('ids');
    });

    it('should expose hasSelection getter', () => {
      const table = createTable(`
        <jtags-table>
          <input type="checkbox" name="select-item" value="1" />
          <div id="selection-banner" class="jtags-hidden" data-total-items="10" data-page-size="10"></div>
        </jtags-table>
      `);

      expect(table.hasSelection).to.be.false;

      const checkbox = table.querySelector('input[value="1"]');
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      expect(table.hasSelection).to.be.true;
    });
  });

  describe('declarative configuration', () => {
    it('should parse jtags-column child elements', () => {
      const table = createTable(`
        <jtags-table id="config-test">
          <jtags-column key="id" label="ID"></jtags-column>
          <jtags-column key="name" label="Name" sortable searchable></jtags-column>
          <jtags-column key="email" label="Email" sortable></jtags-column>
        </jtags-table>
      `);

      expect(table.columns).to.have.length(3);
      expect(table.columns[0]).to.deep.equal({
        key: 'id',
        label: 'ID',
        sortable: false,
        searchable: false,
        width: null
      });
      expect(table.columns[1]).to.deep.equal({
        key: 'name',
        label: 'Name',
        sortable: true,
        searchable: true,
        width: null
      });
    });

    it('should parse jtags-action child elements', () => {
      const table = createTable(`
        <jtags-table id="action-config-test">
          <jtags-action key="delete" label="Delete" icon="trash"
                        url="/api/delete" method="DELETE"
                        confirm confirm-message="Delete selected?"
                        selection-based></jtags-action>
          <jtags-action key="export" label="Export" icon="download"
                        url="/api/export" method="POST"></jtags-action>
        </jtags-table>
      `);

      expect(table.actions).to.have.length(2);
      expect(table.actions[0]).to.deep.equal({
        key: 'delete',
        label: 'Delete',
        icon: 'trash',
        url: '/api/delete',
        method: 'DELETE',
        confirm: true,
        confirmMessage: 'Delete selected?',
        selectionBased: true,
        showLabel: false
      });
      expect(table.actions[1]).to.deep.equal({
        key: 'export',
        label: 'Export',
        icon: 'download',
        url: '/api/export',
        method: 'POST',
        confirm: false,
        confirmMessage: null,
        selectionBased: false,
        showLabel: false
      });
    });

    it('should expose searchable columns', () => {
      const table = createTable(`
        <jtags-table>
          <jtags-column key="id" label="ID"></jtags-column>
          <jtags-column key="name" label="Name" searchable></jtags-column>
          <jtags-column key="email" label="Email" searchable></jtags-column>
          <jtags-column key="role" label="Role"></jtags-column>
        </jtags-table>
      `);

      const searchable = table.searchableColumns;
      expect(searchable).to.have.length(2);
      expect(searchable.map(c => c.key)).to.deep.equal(['name', 'email']);
    });

    it('should expose sortable columns', () => {
      const table = createTable(`
        <jtags-table>
          <jtags-column key="id" label="ID"></jtags-column>
          <jtags-column key="name" label="Name" sortable></jtags-column>
          <jtags-column key="email" label="Email" sortable></jtags-column>
          <jtags-column key="role" label="Role"></jtags-column>
        </jtags-table>
      `);

      const sortable = table.sortableColumns;
      expect(sortable).to.have.length(2);
      expect(sortable.map(c => c.key)).to.deep.equal(['name', 'email']);
    });

    it('should expose idField attribute', () => {
      const table = createTable('<jtags-table id-field="userId"></jtags-table>');
      expect(table.idField).to.equal('userId');
    });

    it('should default idField to "id"', () => {
      const table = createTable('<jtags-table></jtags-table>');
      expect(table.idField).to.equal('id');
    });

    it('should expose showCheckbox attribute', () => {
      const table = createTable('<jtags-table show-checkbox></jtags-table>');
      expect(table.showCheckbox).to.be.true;
    });

    it('should default showCheckbox to false', () => {
      const table = createTable('<jtags-table></jtags-table>');
      expect(table.showCheckbox).to.be.false;
    });

    it('should expose showSearch attribute', () => {
      const table = createTable('<jtags-table show-search></jtags-table>');
      expect(table.showSearch).to.be.true;
    });

    it('should default showSearch to false', () => {
      const table = createTable('<jtags-table></jtags-table>');
      expect(table.showSearch).to.be.false;
    });

    it('should include columns and actions in ready event', (done) => {
      container.innerHTML = '';
      container.addEventListener('jtags-table-ready', (e) => {
        expect(e.detail.columns).to.have.length(2);
        expect(e.detail.actions).to.have.length(1);
        done();
      }, { once: true });

      container.innerHTML = `
        <jtags-table>
          <jtags-column key="id" label="ID"></jtags-column>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-action key="delete" label="Delete" url="/api/delete"></jtags-action>
        </jtags-table>
      `;
    });

    it('should return empty arrays when no child config elements', () => {
      const table = createTable('<jtags-table></jtags-table>');
      expect(table.columns).to.deep.equal([]);
      expect(table.actions).to.deep.equal([]);
    });
  });

  describe('child component integration', () => {
    it('should find toolbar child component', () => {
      const table = createTable(`
        <jtags-table>
          <jtags-toolbar></jtags-toolbar>
        </jtags-table>
      `);

      expect(table.toolbar).to.exist;
      expect(table.toolbar.tagName.toLowerCase()).to.equal('jtags-toolbar');
    });

    it('should find grid child component', () => {
      const table = createTable(`
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `);

      expect(table.grid).to.exist;
      expect(table.grid.tagName.toLowerCase()).to.equal('jtags-grid');
    });

    it('should find pagination child component', () => {
      const table = createTable(`
        <jtags-table>
          <jtags-pagination current="1" total="10"></jtags-pagination>
        </jtags-table>
      `);

      expect(table.pagination).to.exist;
      expect(table.pagination.tagName.toLowerCase()).to.equal('jtags-pagination');
    });

    it('should return null when child components not present', () => {
      const table = createTable('<jtags-table></jtags-table>');

      expect(table.toolbar).to.be.null;
      expect(table.grid).to.be.null;
      expect(table.pagination).to.be.null;
    });

    it('should re-emit jtags-sort as jtags-table-sort', (done) => {
      const table = createTable(`
        <jtags-table id="sort-test">
          <jtags-column key="name" label="Name" sortable></jtags-column>
          <jtags-grid sort-by="name"></jtags-grid>
        </jtags-table>
      `);

      table.addEventListener('jtags-table-sort', (e) => {
        expect(e.detail.column).to.equal('name');
        expect(e.detail.ascending).to.exist;
        expect(e.detail.tableId).to.equal('sort-test');
        done();
      }, { once: true });

      // Trigger sort event from grid
      table.grid.dispatchEvent(new CustomEvent('jtags-sort', {
        bubbles: true,
        detail: { column: 'name', ascending: true }
      }));
    });

    it('should re-emit jtags-search as jtags-table-search', (done) => {
      const table = createTable(`
        <jtags-table id="search-test" show-search>
          <jtags-column key="name" label="Name" searchable></jtags-column>
          <jtags-toolbar></jtags-toolbar>
        </jtags-table>
      `);

      table.addEventListener('jtags-table-search', (e) => {
        expect(e.detail.field).to.equal('name');
        expect(e.detail.value).to.equal('john');
        expect(e.detail.tableId).to.equal('search-test');
        done();
      }, { once: true });

      // Trigger search event from toolbar
      table.toolbar.dispatchEvent(new CustomEvent('jtags-search', {
        bubbles: true,
        detail: { field: 'name', value: 'john' }
      }));
    });

    it('should re-emit jtags-page-change as jtags-table-page', (done) => {
      const table = createTable(`
        <jtags-table id="page-test">
          <jtags-pagination current="1" total="10"></jtags-pagination>
        </jtags-table>
      `);

      table.addEventListener('jtags-table-page', (e) => {
        expect(e.detail.page).to.equal(2);
        expect(e.detail.tableId).to.equal('page-test');
        done();
      }, { once: true });

      // Trigger page change event from pagination
      table.pagination.dispatchEvent(new CustomEvent('jtags-page-change', {
        bubbles: true,
        detail: { page: 2 }
      }));
    });

    it('should re-emit jtags-size-change as jtags-table-size', (done) => {
      const table = createTable(`
        <jtags-table id="size-test">
          <jtags-pagination current="1" total="10" size="10"></jtags-pagination>
        </jtags-table>
      `);

      table.addEventListener('jtags-table-size', (e) => {
        expect(e.detail.size).to.equal(25);
        expect(e.detail.tableId).to.equal('size-test');
        done();
      }, { once: true });

      // Trigger size change event from pagination
      table.pagination.dispatchEvent(new CustomEvent('jtags-size-change', {
        bubbles: true,
        detail: { size: 25 }
      }));
    });

    it('should show toolbar selection actions when items selected', () => {
      const table = createTable(`
        <jtags-table show-checkbox>
          <jtags-toolbar total-items="100" page-size="10">
            <jtags-action key="delete" label="Delete" selection-based></jtags-action>
          </jtags-toolbar>
          <input type="checkbox" name="select-item" value="1" />
          <div id="selection-banner" class="jtags-hidden" data-total-items="100" data-page-size="10"></div>
        </jtags-table>
      `);

      const checkbox = table.querySelector('input[value="1"]');
      const selectionAction = table.toolbar.querySelector('.jtags-table__action--selection');

      // Initially hidden
      expect(selectionAction.classList.contains('jtags-hidden')).to.be.true;

      // Select item
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      // Should be visible
      expect(selectionAction.classList.contains('jtags-hidden')).to.be.false;
    });

    it('should hide toolbar selection actions when selection cleared', () => {
      const table = createTable(`
        <jtags-table show-checkbox>
          <jtags-toolbar total-items="100" page-size="10">
            <jtags-action key="delete" label="Delete" selection-based></jtags-action>
          </jtags-toolbar>
          <input type="checkbox" name="select-item" value="1" />
          <div id="selection-banner" class="jtags-hidden" data-total-items="100" data-page-size="10"></div>
        </jtags-table>
      `);

      const checkbox = table.querySelector('input[value="1"]');
      const selectionAction = table.toolbar.querySelector('.jtags-table__action--selection');

      // Select item
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      // Then deselect
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));

      // Should be hidden
      expect(selectionAction.classList.contains('jtags-hidden')).to.be.true;
    });

    it('should show toolbar banner when all page items selected', () => {
      const table = createTable(`
        <jtags-table show-checkbox>
          <jtags-toolbar total-items="100" page-size="10"></jtags-toolbar>
          <input type="checkbox" id="select-all" />
          <input type="checkbox" name="select-item" value="1" />
          <input type="checkbox" name="select-item" value="2" />
        </jtags-table>
      `);

      const selectAll = table.querySelector('#select-all');
      const banner = table.toolbar.banner;

      // Initially hidden
      expect(banner.classList.contains('jtags-hidden')).to.be.true;

      // Select all
      selectAll.checked = true;
      selectAll.dispatchEvent(new Event('change', { bubbles: true }));

      // Banner should be visible (since totalItems > pageSize)
      expect(banner.classList.contains('jtags-hidden')).to.be.false;
    });

    it('should work with full component hierarchy', () => {
      const table = createTable(`
        <jtags-table id="full-test" show-checkbox show-search>
          <jtags-column key="id" label="ID"></jtags-column>
          <jtags-column key="name" label="Name" sortable searchable></jtags-column>
          <jtags-toolbar total-items="100" page-size="10">
            <jtags-action key="delete" label="Delete" selection-based></jtags-action>
            <jtags-action key="export" label="Export"></jtags-action>
          </jtags-toolbar>
          <jtags-grid sort-by="name"></jtags-grid>
          <jtags-pagination current="1" total="10" size="10" total-items="100"></jtags-pagination>
        </jtags-table>
      `);

      // All child components should be found
      expect(table.toolbar).to.exist;
      expect(table.grid).to.exist;
      expect(table.pagination).to.exist;

      // Configuration should be parsed
      expect(table.columns.length).to.equal(2);
      expect(table.actions.length).to.equal(2);

      // Toolbar should have search controls (show-search is set)
      expect(table.toolbar.searchFieldSelect).to.exist;
      expect(table.toolbar.searchInput).to.exist;

      // Grid should have header generated
      expect(table.grid.header).to.exist;

      // Pagination should have navigation
      expect(table.pagination.prevButton).to.exist;
      expect(table.pagination.nextButton).to.exist;
    });
  });
});