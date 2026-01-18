import { expect } from '@esm-bundle/chai';
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-grid.js';
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-row.js';
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-cell.js';
// Import jtags-table for parent-child tests (also imports jtags-column)
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-table.js';

describe('JtagsGrid', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    sessionStorage.clear();
  });

  afterEach(() => {
    container.remove();
  });

  function createGrid(html) {
    container.innerHTML = html;
    return container.querySelector('jtags-grid');
  }

  describe('initialization', () => {
    it('should register as custom element', () => {
      expect(customElements.get('jtags-grid')).to.exist;
    });

    it('should contain a real table element', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;
      const grid = container.querySelector('jtags-grid');
      const table = grid.querySelector('table');
      expect(table).to.exist;
      expect(table.classList.contains('jtags-table__inner')).to.be.true;
    });

    it('should have proper table structure with thead and tbody', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid>
            <jtags-row item-id="1"><jtags-cell>John</jtags-cell></jtags-row>
          </jtags-grid>
        </jtags-table>
      `;
      const grid = container.querySelector('jtags-grid');
      const thead = grid.querySelector('thead');
      const tbody = grid.querySelector('tbody');
      expect(thead).to.exist;
      expect(tbody).to.exist;
      expect(thead.querySelector('tr')).to.exist;
    });

    it('should expose table property', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;
      const grid = container.querySelector('jtags-grid');
      expect(grid.table).to.exist;
      expect(grid.table.tagName.toLowerCase()).to.equal('table');
    });

    it('should have jtags-table__grid class', () => {
      const grid = createGrid('<jtags-grid></jtags-grid>');
      expect(grid.classList.contains('jtags-table__grid')).to.be.true;
    });
  });

  describe('header generation', () => {
    it('should generate header from parent columns', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-column key="email" label="Email"></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const headers = grid.querySelectorAll('.jtags-table__header:not(.jtags-table__header--checkbox)');
      expect(headers.length).to.equal(2);
    });

    it('should display column labels in headers', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Full Name"></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const label = grid.querySelector('.jtags-table__header-label');
      expect(label.textContent).to.equal('Full Name');
    });

    it('should set data-column on headers', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="email" label="Email"></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const header = grid.querySelector('.jtags-table__header');
      expect(header.dataset.column).to.equal('email');
    });

    it('should expose header property', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      expect(grid.header).to.exist;
      expect(grid.header.classList.contains('jtags-table__header-group')).to.be.true;
    });
  });

  describe('sortable columns', () => {
    it('should add sortable class to sortable columns', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name" sortable></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const header = grid.querySelector('.jtags-table__header');
      expect(header.classList.contains('jtags-table__header--sortable')).to.be.true;
    });

    it('should NOT add sortable class to non-sortable columns', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const header = grid.querySelector('.jtags-table__header');
      expect(header.classList.contains('jtags-table__header--sortable')).to.be.false;
    });

    it('should emit jtags-sort event on sortable header click', (done) => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name" sortable></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      grid.addEventListener('jtags-sort', (e) => {
        expect(e.detail.column).to.equal('name');
        expect(e.detail.ascending).to.be.true;
        done();
      }, { once: true });

      const header = grid.querySelector('.jtags-table__header--sortable');
      header.click();
    });

    it('should toggle sort direction on same column click', (done) => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name" sortable></jtags-column>
          <jtags-grid sort-by="name" sort-asc></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      grid.addEventListener('jtags-sort', (e) => {
        expect(e.detail.column).to.equal('name');
        expect(e.detail.ascending).to.be.false; // Should toggle to desc
        done();
      }, { once: true });

      const header = grid.querySelector('.jtags-table__header--sortable');
      header.click();
    });
  });

  describe('sort indicators', () => {
    it('should show sort indicator on sorted column', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name" sortable></jtags-column>
          <jtags-grid sort-by="name" sort-asc></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const indicator = grid.querySelector('.jtags-table__sort-indicator');
      expect(indicator.classList.contains('jtags-table__sort-indicator--active')).to.be.true;
    });

    it('should NOT show sort indicator on unsorted column', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name" sortable></jtags-column>
          <jtags-column key="email" label="Email" sortable></jtags-column>
          <jtags-grid sort-by="email" sort-asc></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const nameIndicator = grid.querySelector('[data-column="name"] .jtags-table__sort-indicator');
      expect(nameIndicator.classList.contains('jtags-table__sort-indicator--active')).to.be.false;
    });

    it('should show ascending icon when sort-asc', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name" sortable></jtags-column>
          <jtags-grid sort-by="name" sort-asc></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const use = grid.querySelector('.jtags-table__sort-indicator use');
      expect(use.getAttribute('href')).to.include('sort-asc');
    });

    it('should show descending icon when not sort-asc', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name" sortable></jtags-column>
          <jtags-grid sort-by="name"></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const use = grid.querySelector('.jtags-table__sort-indicator use');
      expect(use.getAttribute('href')).to.include('sort-desc');
    });
  });

  describe('checkbox header', () => {
    it('should add select-all checkbox when parent has show-checkbox', () => {
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const selectAll = grid.querySelector('#select-all');
      expect(selectAll).to.exist;
      expect(selectAll.type).to.equal('checkbox');
    });

    it('should NOT add select-all checkbox without show-checkbox', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const selectAll = grid.querySelector('#select-all');
      expect(selectAll).to.be.null;
    });

    it('should expose selectAllCheckbox property', () => {
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      expect(grid.selectAllCheckbox).to.equal(grid.querySelector('#select-all'));
    });
  });

  describe('body and rows', () => {
    it('should move rows to body wrapper', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid>
            <jtags-row item-id="1"><jtags-cell>John</jtags-cell></jtags-row>
            <jtags-row item-id="2"><jtags-cell>Jane</jtags-cell></jtags-row>
          </jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      expect(grid.body).to.exist;
      expect(grid.body.querySelectorAll('jtags-row').length).to.equal(2);
    });

    it('should expose rows property', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid>
            <jtags-row item-id="1"><jtags-cell>John</jtags-cell></jtags-row>
            <jtags-row item-id="2"><jtags-cell>Jane</jtags-cell></jtags-row>
          </jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      expect(grid.rows.length).to.equal(2);
    });

    it('should expose body property', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      expect(grid.body).to.exist;
      expect(grid.body.classList.contains('jtags-table__body')).to.be.true;
    });
  });

  describe('empty state', () => {
    it('should show empty message when no rows', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const emptyCell = grid.querySelector('.jtags-table__cell--empty');
      expect(emptyCell).to.exist;
      expect(emptyCell.textContent).to.equal('No data found');
    });

    it('should use custom empty message', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid empty-message="No users available"></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const emptyCell = grid.querySelector('.jtags-table__cell--empty');
      expect(emptyCell.textContent).to.equal('No users available');
    });

    it('should NOT show empty message when rows exist', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid>
            <jtags-row item-id="1"><jtags-cell>John</jtags-cell></jtags-row>
          </jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const emptyCell = grid.querySelector('.jtags-table__cell--empty');
      expect(emptyCell).to.be.null;
    });

    it('should use colspan to span all columns', () => {
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="id" label="ID"></jtags-column>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-column key="email" label="Email"></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const emptyCell = grid.querySelector('.jtags-table__cell--empty');
      // 3 columns + 1 checkbox = 4
      expect(emptyCell.getAttribute('colspan')).to.equal('4');
    });
  });

  describe('column width', () => {
    it('should apply column width to header', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name" width="200px"></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const header = grid.querySelector('.jtags-table__header');
      expect(header.style.width).to.equal('200px');
    });
  });

  describe('sort-by and sort-asc attributes', () => {
    it('should parse sort-by attribute', () => {
      const grid = createGrid('<jtags-grid sort-by="name"></jtags-grid>');
      expect(grid.sortBy).to.equal('name');
    });

    it('should default sort-by to empty string', () => {
      const grid = createGrid('<jtags-grid></jtags-grid>');
      expect(grid.sortBy).to.equal('');
    });

    it('should parse sort-asc attribute', () => {
      const grid = createGrid('<jtags-grid sort-asc></jtags-grid>');
      expect(grid.sortAsc).to.be.true;
    });

    it('should default sort-asc to false', () => {
      const grid = createGrid('<jtags-grid></jtags-grid>');
      expect(grid.sortAsc).to.be.false;
    });

    it('should update sort-by via property', () => {
      const grid = createGrid('<jtags-grid></jtags-grid>');
      grid.sortBy = 'email';
      expect(grid.getAttribute('sort-by')).to.equal('email');
    });

    it('should update sort-asc via property', () => {
      const grid = createGrid('<jtags-grid></jtags-grid>');
      grid.sortAsc = true;
      expect(grid.hasAttribute('sort-asc')).to.be.true;
    });
  });

  describe('empty-message attribute', () => {
    it('should get emptyMessage property', () => {
      const grid = createGrid('<jtags-grid empty-message="Nothing here"></jtags-grid>');
      expect(grid.emptyMessage).to.equal('Nothing here');
    });

    it('should default emptyMessage to "No data found"', () => {
      const grid = createGrid('<jtags-grid></jtags-grid>');
      expect(grid.emptyMessage).to.equal('No data found');
    });

    it('should set emptyMessage via property', () => {
      const grid = createGrid('<jtags-grid></jtags-grid>');
      grid.emptyMessage = 'Empty!';
      expect(grid.getAttribute('empty-message')).to.equal('Empty!');
    });
  });

  describe('re-initialization prevention', () => {
    it('should NOT duplicate headers when grid is moved in DOM', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-column key="email" label="Email"></jtags-column>
          <jtags-grid>
            <jtags-row item-id="1">
              <jtags-cell column="name">John</jtags-cell>
              <jtags-cell column="email">john@example.com</jtags-cell>
            </jtags-row>
          </jtags-grid>
        </jtags-table>
      `;

      const table = container.querySelector('jtags-table');
      const grid = container.querySelector('jtags-grid');

      // Count header cells before move (should be 2)
      const headersBefore = grid.querySelectorAll('.jtags-table__header').length;
      expect(headersBefore).to.equal(2);

      // Simulate DOM move
      const wrapper = document.createElement('div');
      table.appendChild(wrapper);
      wrapper.appendChild(grid);

      // Count headers after move - should still be 2
      const headersAfter = grid.querySelectorAll('.jtags-table__header').length;
      expect(headersAfter).to.equal(2);
    });

    it('should NOT duplicate checkbox header when grid with show-checkbox is moved', () => {
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid>
            <jtags-row item-id="1">
              <jtags-cell column="name">John</jtags-cell>
            </jtags-row>
          </jtags-grid>
        </jtags-table>
      `;

      const table = container.querySelector('jtags-table');
      const grid = container.querySelector('jtags-grid');

      // Count headers before move (1 checkbox header + 1 column header = 2)
      const headersBefore = grid.querySelectorAll('.jtags-table__header').length;
      expect(headersBefore).to.equal(2);

      // Move grid
      const wrapper = document.createElement('div');
      table.appendChild(wrapper);
      wrapper.appendChild(grid);

      // Should still have 2 headers
      const headersAfter = grid.querySelectorAll('.jtags-table__header').length;
      expect(headersAfter).to.equal(2);
    });

    it('should NOT duplicate tbody when grid is moved multiple times', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid>
            <jtags-row item-id="1">
              <jtags-cell column="name">John</jtags-cell>
            </jtags-row>
          </jtags-grid>
        </jtags-table>
      `;

      const table = container.querySelector('jtags-table');
      const grid = container.querySelector('jtags-grid');

      // Count body elements before moves
      const bodiesBefore = grid.querySelectorAll('.jtags-table__body').length;
      expect(bodiesBefore).to.equal(1);

      // Move multiple times
      const wrapper1 = document.createElement('div');
      const wrapper2 = document.createElement('div');
      table.appendChild(wrapper1);
      table.appendChild(wrapper2);

      wrapper1.appendChild(grid);
      wrapper2.appendChild(grid);
      wrapper1.appendChild(grid);

      // Should still have 1 body
      const bodiesAfter = grid.querySelectorAll('.jtags-table__body').length;
      expect(bodiesAfter).to.equal(1);
    });

    it('should maintain _initialized flag after move', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid></jtags-grid>
        </jtags-table>
      `;

      const table = container.querySelector('jtags-table');
      const grid = container.querySelector('jtags-grid');

      expect(grid._initialized).to.be.true;

      // Move grid
      const wrapper = document.createElement('div');
      table.appendChild(wrapper);
      wrapper.appendChild(grid);

      // Flag should still be true
      expect(grid._initialized).to.be.true;
    });

    it('should NOT duplicate row checkboxes when rows are moved by grid structure building', () => {
      // This tests the real-world scenario where grid moves rows to tbody
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-grid>
            <jtags-row item-id="1">
              <jtags-cell column="name">John</jtags-cell>
            </jtags-row>
            <jtags-row item-id="2">
              <jtags-cell column="name">Jane</jtags-cell>
            </jtags-row>
          </jtags-grid>
        </jtags-table>
      `;

      const grid = container.querySelector('jtags-grid');
      const rows = grid.querySelectorAll('jtags-row');

      // Each row should have exactly 1 checkbox
      rows.forEach(row => {
        const checkboxes = row.querySelectorAll('input[name="select-item"]');
        expect(checkboxes.length).to.equal(1);
      });
    });
  });
});