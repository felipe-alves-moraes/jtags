import { expect } from '@esm-bundle/chai';
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-toolbar.js';
// Import jtags-table for parent-child tests (also imports jtags-column, jtags-action)
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-table.js';

describe('JtagsToolbar', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    sessionStorage.clear();
  });

  afterEach(() => {
    container.remove();
  });

  function createToolbar(html) {
    container.innerHTML = html;
    return container.querySelector('jtags-toolbar');
  }

  describe('initialization', () => {
    it('should register as custom element', () => {
      expect(customElements.get('jtags-toolbar')).to.exist;
    });

    it('should have jtags-table__toolbar class', () => {
      const toolbar = createToolbar('<jtags-toolbar></jtags-toolbar>');
      expect(toolbar.classList.contains('jtags-table__toolbar')).to.be.true;
    });

    it('should create left and right sections', () => {
      const toolbar = createToolbar('<jtags-toolbar></jtags-toolbar>');
      expect(toolbar.querySelector('.jtags-table__toolbar-left')).to.exist;
      expect(toolbar.querySelector('.jtags-table__toolbar-right')).to.exist;
    });
  });

  describe('slotted action buttons', () => {
    it('should move slotted actions to sections', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-toolbar>
            <jtags-action key="delete" label="Delete" selection-based></jtags-action>
            <jtags-action key="export" label="Export"></jtags-action>
          </jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      expect(toolbar.actionButtons.length).to.equal(2);
    });

    it('should auto-place selection-based actions in left section', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-toolbar>
            <jtags-action key="delete" label="Delete" selection-based></jtags-action>
          </jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      const leftAction = toolbar.querySelector('.jtags-table__toolbar-left jtags-action');
      expect(leftAction).to.exist;
      expect(leftAction.key).to.equal('delete');
    });

    it('should auto-place global actions in right section', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-toolbar>
            <jtags-action key="export" label="Export"></jtags-action>
          </jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      const rightAction = toolbar.querySelector('.jtags-table__toolbar-right jtags-action');
      expect(rightAction).to.exist;
      expect(rightAction.key).to.equal('export');
    });

    it('should place actions based on selection-based attribute', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-toolbar>
            <jtags-action key="delete" label="Delete" selection-based></jtags-action>
            <jtags-action key="export" label="Export"></jtags-action>
          </jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      const leftAction = toolbar.querySelector('.jtags-table__toolbar-left jtags-action');
      const rightAction = toolbar.querySelector('.jtags-table__toolbar-right jtags-action');

      expect(leftAction.key).to.equal('delete');
      expect(rightAction.key).to.equal('export');
    });

    it('should preserve hidden class on selection-based actions', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-toolbar>
            <jtags-action key="delete" label="Delete" selection-based></jtags-action>
          </jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      const action = toolbar.querySelector('.jtags-table__action--selection');
      expect(action.classList.contains('jtags-hidden')).to.be.true;
    });

    it('should NOT hide global actions', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-toolbar>
            <jtags-action key="export" label="Export"></jtags-action>
          </jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      const action = toolbar.querySelector('.jtags-table__action--global');
      expect(action.classList.contains('jtags-hidden')).to.be.false;
    });

    it('should preserve HTMX attributes on slotted actions', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-toolbar>
            <jtags-action key="delete" label="Delete" selection-based
                          hx-delete="/api/delete"
                          hx-target="#table-container"
                          hx-include="[name=select-item]:checked"></jtags-action>
          </jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      const action = toolbar.querySelector('jtags-action');
      expect(action.getAttribute('hx-delete')).to.equal('/api/delete');
      expect(action.getAttribute('hx-target')).to.equal('#table-container');
      expect(action.getAttribute('hx-include')).to.equal('[name=select-item]:checked');
    });

    it('should render icon in slotted action', () => {
      container.innerHTML = `
        <jtags-table icon-base-path="/icons/test.svg">
          <jtags-toolbar>
            <jtags-action key="delete" label="Delete" icon="trash" selection-based></jtags-action>
          </jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      const svg = toolbar.querySelector('jtags-action svg');
      expect(svg).to.exist;
      expect(svg.querySelector('use').getAttribute('href')).to.include('trash');
    });

    it('should expose selectionActions property', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-toolbar>
            <jtags-action key="delete" label="Delete" selection-based></jtags-action>
            <jtags-action key="export" label="Export"></jtags-action>
          </jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      expect(toolbar.selectionActions.length).to.equal(1);
    });

    it('should expose globalActions property', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-toolbar>
            <jtags-action key="delete" label="Delete" selection-based></jtags-action>
            <jtags-action key="export" label="Export"></jtags-action>
          </jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      expect(toolbar.globalActions.length).to.equal(1);
    });

    it('should handle actions with empty icon attribute', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-toolbar>
            <jtags-action key="delete" label="Delete" icon="" selection-based></jtags-action>
          </jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      const action = toolbar.querySelector('jtags-action');
      const svg = action.querySelector('svg');
      const label = action.querySelector('.jtags-table__action-label');

      expect(svg).to.be.null;
      expect(label).to.exist;
      expect(label.textContent).to.equal('Delete');
    });
  });

  describe('search controls', () => {
    it('should generate search controls when parent has show-search', () => {
      container.innerHTML = `
        <jtags-table show-search>
          <jtags-column key="name" label="Name" searchable></jtags-column>
          <jtags-toolbar></jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      expect(toolbar.searchFieldSelect).to.exist;
      expect(toolbar.searchInput).to.exist;
    });

    it('should NOT generate search controls without show-search', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name" searchable></jtags-column>
          <jtags-toolbar></jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      expect(toolbar.searchFieldSelect).to.be.null;
      expect(toolbar.searchInput).to.be.null;
    });

    it('should populate search field options from searchable columns', () => {
      container.innerHTML = `
        <jtags-table show-search>
          <jtags-column key="name" label="Name" searchable></jtags-column>
          <jtags-column key="email" label="Email" searchable></jtags-column>
          <jtags-column key="role" label="Role"></jtags-column>
          <jtags-toolbar></jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      const options = toolbar.searchFieldSelect.querySelectorAll('option');
      // Default option + 2 searchable columns
      expect(options.length).to.equal(3);
      expect(options[1].value).to.equal('name');
      expect(options[2].value).to.equal('email');
    });

    it('should set initial search field value', () => {
      container.innerHTML = `
        <jtags-table show-search>
          <jtags-column key="name" label="Name" searchable></jtags-column>
          <jtags-column key="email" label="Email" searchable></jtags-column>
          <jtags-toolbar search-field="email"></jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      expect(toolbar.searchFieldSelect.value).to.equal('email');
    });

    it('should set initial search value', () => {
      container.innerHTML = `
        <jtags-table show-search>
          <jtags-column key="name" label="Name" searchable></jtags-column>
          <jtags-toolbar search-value="john"></jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      expect(toolbar.searchInput.value).to.equal('john');
    });

    it('should emit jtags-search event on input', (done) => {
      container.innerHTML = `
        <jtags-table show-search>
          <jtags-column key="name" label="Name" searchable></jtags-column>
          <jtags-toolbar></jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      toolbar.addEventListener('jtags-search', (e) => {
        expect(e.detail.value).to.equal('test');
        done();
      }, { once: true });

      toolbar.searchInput.value = 'test';
      toolbar.searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }).timeout(500);

    it('should emit jtags-search event on field change', (done) => {
      container.innerHTML = `
        <jtags-table show-search>
          <jtags-column key="name" label="Name" searchable></jtags-column>
          <jtags-column key="email" label="Email" searchable></jtags-column>
          <jtags-toolbar></jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      toolbar.addEventListener('jtags-search', (e) => {
        expect(e.detail.field).to.equal('email');
        done();
      }, { once: true });

      toolbar.searchFieldSelect.value = 'email';
      toolbar.searchFieldSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  describe('selection banner', () => {
    it('should create banner element', () => {
      const toolbar = createToolbar('<jtags-toolbar></jtags-toolbar>');
      expect(toolbar.banner).to.exist;
      expect(toolbar.banner.id).to.equal('selection-banner');
    });

    it('should hide banner by default', () => {
      const toolbar = createToolbar('<jtags-toolbar></jtags-toolbar>');
      expect(toolbar.banner.classList.contains('jtags-hidden')).to.be.true;
    });

    it('should set banner data attributes', () => {
      const toolbar = createToolbar('<jtags-toolbar total-items="100" page-size="10"></jtags-toolbar>');
      expect(toolbar.banner.dataset.totalItems).to.equal('100');
      expect(toolbar.banner.dataset.pageSize).to.equal('10');
    });

    it('should show banner via showBanner()', () => {
      const toolbar = createToolbar('<jtags-toolbar></jtags-toolbar>');
      toolbar.showBanner();
      expect(toolbar.banner.classList.contains('jtags-hidden')).to.be.false;
    });

    it('should hide banner via hideBanner()', () => {
      const toolbar = createToolbar('<jtags-toolbar></jtags-toolbar>');
      toolbar.showBanner();
      toolbar.hideBanner();
      expect(toolbar.banner.classList.contains('jtags-hidden')).to.be.true;
    });

    it('should update banner for all-selected mode', () => {
      const toolbar = createToolbar('<jtags-toolbar></jtags-toolbar>');
      toolbar.showAllSelectedBanner(100);
      expect(toolbar.banner.textContent).to.include('All 100 items selected');
      expect(toolbar.banner.querySelector('#clear-selection')).to.exist;
    });

    it('should reset banner to page mode', () => {
      const toolbar = createToolbar('<jtags-toolbar total-items="100" page-size="10"></jtags-toolbar>');
      toolbar.showAllSelectedBanner(100);
      toolbar.resetBanner();
      expect(toolbar.banner.textContent).to.include('All 10 items on this page selected');
      expect(toolbar.banner.querySelector('#select-all-matching')).to.exist;
    });
  });

  describe('show/hide selection actions', () => {
    it('should show selection actions via showSelectionActions()', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-toolbar>
            <jtags-action key="delete" label="Delete" selection-based></jtags-action>
          </jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      toolbar.showSelectionActions();

      const action = toolbar.querySelector('.jtags-table__action--selection');
      expect(action.classList.contains('jtags-hidden')).to.be.false;
    });

    it('should hide selection actions via hideSelectionActions()', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-toolbar>
            <jtags-action key="delete" label="Delete" selection-based></jtags-action>
          </jtags-toolbar>
        </jtags-table>
      `;

      const toolbar = container.querySelector('jtags-toolbar');
      toolbar.showSelectionActions();
      toolbar.hideSelectionActions();

      const action = toolbar.querySelector('.jtags-table__action--selection');
      expect(action.classList.contains('jtags-hidden')).to.be.true;
    });
  });

  describe('property getters/setters', () => {
    it('should get/set searchField', () => {
      const toolbar = createToolbar('<jtags-toolbar></jtags-toolbar>');
      toolbar.searchField = 'name';
      expect(toolbar.getAttribute('search-field')).to.equal('name');
      expect(toolbar.searchField).to.equal('name');
    });

    it('should get/set searchValue', () => {
      const toolbar = createToolbar('<jtags-toolbar></jtags-toolbar>');
      toolbar.searchValue = 'john';
      expect(toolbar.getAttribute('search-value')).to.equal('john');
      expect(toolbar.searchValue).to.equal('john');
    });

    it('should get/set totalItems', () => {
      const toolbar = createToolbar('<jtags-toolbar></jtags-toolbar>');
      toolbar.totalItems = 100;
      expect(toolbar.getAttribute('total-items')).to.equal('100');
      expect(toolbar.totalItems).to.equal(100);
    });

    it('should get/set pageSize', () => {
      const toolbar = createToolbar('<jtags-toolbar></jtags-toolbar>');
      toolbar.pageSize = 25;
      expect(toolbar.getAttribute('page-size')).to.equal('25');
      expect(toolbar.pageSize).to.equal(25);
    });
  });
});