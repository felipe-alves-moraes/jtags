import { expect } from '@esm-bundle/chai';
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-row.js';
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-cell.js';
// Import jtags-table for parent-child tests
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-table.js';

describe('JtagsRow', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    sessionStorage.clear();
  });

  afterEach(() => {
    container.remove();
  });

  function createRow(html) {
    container.innerHTML = html;
    return container.querySelector('jtags-row');
  }

  describe('initialization', () => {
    it('should register as custom element', () => {
      expect(customElements.get('jtags-row')).to.exist;
    });

    it('should render as table-row', () => {
      const row = createRow('<jtags-row item-id="1"></jtags-row>');
      expect(row.style.display).to.equal('table-row');
    });

    it('should have jtags-table__row class', () => {
      const row = createRow('<jtags-row item-id="1"></jtags-row>');
      expect(row.classList.contains('jtags-table__row')).to.be.true;
    });
  });

  describe('item-id attribute', () => {
    it('should parse item-id attribute', () => {
      const row = createRow('<jtags-row item-id="123"></jtags-row>');
      expect(row.itemId).to.equal('123');
    });

    it('should default item-id to empty string', () => {
      const row = createRow('<jtags-row></jtags-row>');
      expect(row.itemId).to.equal('');
    });

    it('should update item-id via property', () => {
      const row = createRow('<jtags-row></jtags-row>');
      row.itemId = '456';
      expect(row.getAttribute('item-id')).to.equal('456');
    });
  });

  describe('children rendering', () => {
    it('should render child cells', () => {
      const row = createRow(`
        <jtags-row item-id="1">
          <jtags-cell column="name">John</jtags-cell>
          <jtags-cell column="email">john@example.com</jtags-cell>
        </jtags-row>
      `);

      const cells = row.querySelectorAll('jtags-cell');
      expect(cells.length).to.equal(2);
    });

    it('should expose cells property', () => {
      const row = createRow(`
        <jtags-row item-id="1">
          <jtags-cell column="name">John</jtags-cell>
          <jtags-cell column="email">john@example.com</jtags-cell>
        </jtags-row>
      `);

      expect(row.cells.length).to.equal(2);
    });
  });

  describe('checkbox generation', () => {
    it('should add checkbox when parent table has show-checkbox', () => {
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-row item-id="1">
            <jtags-cell column="name">John</jtags-cell>
          </jtags-row>
        </jtags-table>
      `;

      const row = container.querySelector('jtags-row');
      const checkbox = row.querySelector('input[name="select-item"]');
      expect(checkbox).to.exist;
    });

    it('should set checkbox value to item-id', () => {
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-row item-id="42">
            <jtags-cell column="name">John</jtags-cell>
          </jtags-row>
        </jtags-table>
      `;

      const row = container.querySelector('jtags-row');
      const checkbox = row.querySelector('input[name="select-item"]');
      expect(checkbox.value).to.equal('42');
    });

    it('should insert checkbox as first cell', () => {
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-row item-id="1">
            <jtags-cell column="name">John</jtags-cell>
          </jtags-row>
        </jtags-table>
      `;

      const row = container.querySelector('jtags-row');
      const firstCell = row.firstElementChild;
      expect(firstCell.querySelector('input[name="select-item"]')).to.exist;
    });

    it('should NOT add checkbox when parent table lacks show-checkbox', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-row item-id="1">
            <jtags-cell column="name">John</jtags-cell>
          </jtags-row>
        </jtags-table>
      `;

      const row = container.querySelector('jtags-row');
      const checkbox = row.querySelector('input[name="select-item"]');
      expect(checkbox).to.be.null;
    });

    it('should NOT add checkbox when no parent table', () => {
      const row = createRow(`
        <jtags-row item-id="1">
          <jtags-cell column="name">John</jtags-cell>
        </jtags-row>
      `);

      const checkbox = row.querySelector('input[name="select-item"]');
      expect(checkbox).to.be.null;
    });

    it('should have checkbox cell with correct class', () => {
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-row item-id="1">
            <jtags-cell column="name">John</jtags-cell>
          </jtags-row>
        </jtags-table>
      `;

      const row = container.querySelector('jtags-row');
      const checkboxCell = row.firstElementChild;
      expect(checkboxCell.classList.contains('jtags-table__cell--checkbox')).to.be.true;
    });

    it('should expose getCheckbox method', () => {
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-row item-id="1">
            <jtags-cell column="name">John</jtags-cell>
          </jtags-row>
        </jtags-table>
      `;

      const row = container.querySelector('jtags-row');
      expect(row.getCheckbox()).to.equal(row.querySelector('input[name="select-item"]'));
    });

    it('should update checkbox value when item-id changes', () => {
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-row item-id="1">
            <jtags-cell column="name">John</jtags-cell>
          </jtags-row>
        </jtags-table>
      `;

      const row = container.querySelector('jtags-row');
      row.itemId = '999';
      expect(row.getCheckbox().value).to.equal('999');
    });

    it('should exclude checkbox cell from cells property', () => {
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-row item-id="1">
            <jtags-cell column="name">John</jtags-cell>
            <jtags-cell column="email">john@example.com</jtags-cell>
          </jtags-row>
        </jtags-table>
      `;

      const row = container.querySelector('jtags-row');
      // cells property should only include data cells, not checkbox cell
      expect(row.cells.length).to.equal(2);
    });
  });

  describe('re-initialization prevention', () => {
    it('should NOT duplicate checkbox when row is moved in DOM', () => {
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-row item-id="1">
            <jtags-cell column="name">John</jtags-cell>
          </jtags-row>
        </jtags-table>
      `;

      const table = container.querySelector('jtags-table');
      const row = container.querySelector('jtags-row');

      // Count checkboxes before move
      const checkboxesBefore = row.querySelectorAll('input[name="select-item"]').length;
      expect(checkboxesBefore).to.equal(1);

      // Simulate DOM move (like grid building structure)
      const wrapper = document.createElement('div');
      table.appendChild(wrapper);
      wrapper.appendChild(row); // This triggers disconnectedCallback then connectedCallback

      // Count checkboxes after move - should still be 1
      const checkboxesAfter = row.querySelectorAll('input[name="select-item"]').length;
      expect(checkboxesAfter).to.equal(1);
    });

    it('should NOT duplicate cells when row is moved multiple times', () => {
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-row item-id="1">
            <jtags-cell column="name">John</jtags-cell>
            <jtags-cell column="email">john@example.com</jtags-cell>
          </jtags-row>
        </jtags-table>
      `;

      const table = container.querySelector('jtags-table');
      const row = container.querySelector('jtags-row');

      // Total cells: 1 checkbox + 2 data cells = 3
      const cellsBefore = row.querySelectorAll('jtags-cell').length;
      expect(cellsBefore).to.equal(3);

      // Move row multiple times
      const wrapper1 = document.createElement('div');
      const wrapper2 = document.createElement('div');
      table.appendChild(wrapper1);
      table.appendChild(wrapper2);

      wrapper1.appendChild(row);
      wrapper2.appendChild(row);
      wrapper1.appendChild(row);

      // Should still have same number of cells
      const cellsAfter = row.querySelectorAll('jtags-cell').length;
      expect(cellsAfter).to.equal(3);
    });

    it('should maintain _initialized flag after move', () => {
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-row item-id="1">
            <jtags-cell column="name">John</jtags-cell>
          </jtags-row>
        </jtags-table>
      `;

      const table = container.querySelector('jtags-table');
      const row = container.querySelector('jtags-row');

      expect(row._initialized).to.be.true;

      // Move row
      const wrapper = document.createElement('div');
      table.appendChild(wrapper);
      wrapper.appendChild(row);

      // Flag should still be true
      expect(row._initialized).to.be.true;
    });
  });

  describe('selected state', () => {
    it('should parse selected attribute', () => {
      const row = createRow('<jtags-row item-id="1" selected></jtags-row>');
      expect(row.selected).to.be.true;
    });

    it('should default selected to false', () => {
      const row = createRow('<jtags-row item-id="1"></jtags-row>');
      expect(row.selected).to.be.false;
    });

    it('should set selected via property', () => {
      const row = createRow('<jtags-row item-id="1"></jtags-row>');
      row.selected = true;
      expect(row.hasAttribute('selected')).to.be.true;
    });

    it('should unset selected via property', () => {
      const row = createRow('<jtags-row item-id="1" selected></jtags-row>');
      row.selected = false;
      expect(row.hasAttribute('selected')).to.be.false;
    });

    it('should add selected class when selected', () => {
      const row = createRow('<jtags-row item-id="1" selected></jtags-row>');
      expect(row.classList.contains('jtags-table__row--selected')).to.be.true;
    });

    it('should remove selected class when unselected', () => {
      const row = createRow('<jtags-row item-id="1" selected></jtags-row>');
      row.selected = false;
      expect(row.classList.contains('jtags-table__row--selected')).to.be.false;
    });

    it('should check checkbox when selected', () => {
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-row item-id="1" selected>
            <jtags-cell column="name">John</jtags-cell>
          </jtags-row>
        </jtags-table>
      `;

      const row = container.querySelector('jtags-row');
      expect(row.getCheckbox().checked).to.be.true;
    });

    it('should uncheck checkbox when unselected', () => {
      container.innerHTML = `
        <jtags-table show-checkbox>
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-row item-id="1" selected>
            <jtags-cell column="name">John</jtags-cell>
          </jtags-row>
        </jtags-table>
      `;

      const row = container.querySelector('jtags-row');
      row.selected = false;
      expect(row.getCheckbox().checked).to.be.false;
    });
  });
});