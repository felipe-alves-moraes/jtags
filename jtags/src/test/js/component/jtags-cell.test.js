import { expect } from '@esm-bundle/chai';
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-cell.js';
// Import jtags-table for parent-child tests (also imports jtags-column)
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-table.js';

describe('JtagsCell', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function createCell(html) {
    container.innerHTML = html;
    return container.querySelector('jtags-cell');
  }

  describe('initialization', () => {
    it('should register as custom element', () => {
      expect(customElements.get('jtags-cell')).to.exist;
    });

    it('should render as table-cell', () => {
      const cell = createCell('<jtags-cell></jtags-cell>');
      expect(cell.style.display).to.equal('table-cell');
    });

    it('should have jtags-table__cell class', () => {
      const cell = createCell('<jtags-cell></jtags-cell>');
      expect(cell.classList.contains('jtags-table__cell')).to.be.true;
    });
  });

  describe('content rendering', () => {
    it('should render text content', () => {
      const cell = createCell('<jtags-cell>Hello World</jtags-cell>');
      expect(cell.textContent).to.equal('Hello World');
    });

    it('should render HTML content', () => {
      const cell = createCell('<jtags-cell><strong>Bold</strong> text</jtags-cell>');
      expect(cell.querySelector('strong')).to.exist;
      expect(cell.querySelector('strong').textContent).to.equal('Bold');
    });

    it('should render complex nested content', () => {
      const cell = createCell(`
        <jtags-cell>
          <a href="/users/1">
            <span class="name">John Doe</span>
          </a>
        </jtags-cell>
      `);
      expect(cell.querySelector('a')).to.exist;
      expect(cell.querySelector('.name').textContent).to.equal('John Doe');
    });
  });

  describe('column attribute', () => {
    it('should parse column attribute', () => {
      const cell = createCell('<jtags-cell column="name"></jtags-cell>');
      expect(cell.column).to.equal('name');
    });

    it('should default column to empty string', () => {
      const cell = createCell('<jtags-cell></jtags-cell>');
      expect(cell.column).to.equal('');
    });

    it('should update column via property', () => {
      const cell = createCell('<jtags-cell></jtags-cell>');
      cell.column = 'email';
      expect(cell.getAttribute('column')).to.equal('email');
    });

    it('should remove column attribute when set to empty', () => {
      const cell = createCell('<jtags-cell column="name"></jtags-cell>');
      cell.column = '';
      expect(cell.hasAttribute('column')).to.be.false;
    });
  });

  describe('width attribute', () => {
    it('should apply explicit width', () => {
      const cell = createCell('<jtags-cell width="100px"></jtags-cell>');
      expect(cell.style.width).to.equal('100px');
    });

    it('should update width via property', () => {
      const cell = createCell('<jtags-cell></jtags-cell>');
      cell.width = '200px';
      expect(cell.getAttribute('width')).to.equal('200px');
      expect(cell.style.width).to.equal('200px');
    });

    it('should remove width when set to null', () => {
      const cell = createCell('<jtags-cell width="100px"></jtags-cell>');
      cell.width = null;
      expect(cell.hasAttribute('width')).to.be.false;
    });

    it('should clear style width when attribute removed', () => {
      const cell = createCell('<jtags-cell width="100px"></jtags-cell>');
      cell.removeAttribute('width');
      expect(cell.style.width).to.equal('');
    });
  });

  describe('width from parent column config', () => {
    it('should get width from parent table column config', () => {
      // Create a mock jtags-table with columns
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name" width="150px"></jtags-column>
          <jtags-cell column="name">John</jtags-cell>
        </jtags-table>
      `;

      // Need to import jtags-table for this test
      // The table will parse columns in connectedCallback
      const cell = container.querySelector('jtags-cell');
      const table = container.querySelector('jtags-table');

      // Check that cell can get column config
      const config = cell.getColumnConfig();
      expect(config).to.exist;
      expect(config.key).to.equal('name');
      expect(config.width).to.equal('150px');
    });

    it('should return null config when no parent table', () => {
      const cell = createCell('<jtags-cell column="name">John</jtags-cell>');
      expect(cell.getColumnConfig()).to.be.null;
    });

    it('should return null config when column not found', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="id" label="ID"></jtags-column>
          <jtags-cell column="nonexistent">Value</jtags-cell>
        </jtags-table>
      `;
      const cell = container.querySelector('jtags-cell');
      expect(cell.getColumnConfig()).to.be.null;
    });

    it('should prefer explicit width over column config width', () => {
      container.innerHTML = `
        <jtags-table>
          <jtags-column key="name" label="Name" width="150px"></jtags-column>
          <jtags-cell column="name" width="200px">John</jtags-cell>
        </jtags-table>
      `;
      const cell = container.querySelector('jtags-cell');
      expect(cell.style.width).to.equal('200px');
    });
  });
});