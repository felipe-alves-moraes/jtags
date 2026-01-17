import { expect } from '@esm-bundle/chai';
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-column.js';

describe('JtagsColumn', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function createColumn(html) {
    container.innerHTML = html;
    return container.querySelector('jtags-column');
  }

  describe('initialization', () => {
    it('should register as custom element', () => {
      expect(customElements.get('jtags-column')).to.exist;
    });

    it('should be hidden by default', () => {
      const column = createColumn('<jtags-column key="id" label="ID"></jtags-column>');
      expect(column.style.display).to.equal('none');
    });
  });

  describe('attribute parsing', () => {
    it('should parse key attribute', () => {
      const column = createColumn('<jtags-column key="name"></jtags-column>');
      expect(column.key).to.equal('name');
    });

    it('should parse label attribute', () => {
      const column = createColumn('<jtags-column label="User Name"></jtags-column>');
      expect(column.label).to.equal('User Name');
    });

    it('should parse sortable boolean attribute', () => {
      const column = createColumn('<jtags-column sortable></jtags-column>');
      expect(column.sortable).to.be.true;
    });

    it('should default sortable to false', () => {
      const column = createColumn('<jtags-column></jtags-column>');
      expect(column.sortable).to.be.false;
    });

    it('should parse searchable boolean attribute', () => {
      const column = createColumn('<jtags-column searchable></jtags-column>');
      expect(column.searchable).to.be.true;
    });

    it('should default searchable to false', () => {
      const column = createColumn('<jtags-column></jtags-column>');
      expect(column.searchable).to.be.false;
    });

    it('should parse width attribute', () => {
      const column = createColumn('<jtags-column width="100px"></jtags-column>');
      expect(column.width).to.equal('100px');
    });

    it('should default width to null', () => {
      const column = createColumn('<jtags-column></jtags-column>');
      expect(column.width).to.be.null;
    });
  });

  describe('getConfig()', () => {
    it('should return complete configuration object', () => {
      const column = createColumn(
        '<jtags-column key="email" label="Email Address" sortable searchable width="200px"></jtags-column>'
      );

      const config = column.getConfig();

      expect(config).to.deep.equal({
        key: 'email',
        label: 'Email Address',
        sortable: true,
        searchable: true,
        width: '200px'
      });
    });

    it('should return defaults for missing attributes', () => {
      const column = createColumn('<jtags-column></jtags-column>');

      const config = column.getConfig();

      expect(config).to.deep.equal({
        key: '',
        label: '',
        sortable: false,
        searchable: false,
        width: null
      });
    });
  });

  describe('property setters', () => {
    it('should update key via property', () => {
      const column = createColumn('<jtags-column></jtags-column>');
      column.key = 'newKey';
      expect(column.getAttribute('key')).to.equal('newKey');
    });

    it('should update label via property', () => {
      const column = createColumn('<jtags-column></jtags-column>');
      column.label = 'New Label';
      expect(column.getAttribute('label')).to.equal('New Label');
    });

    it('should set sortable via property', () => {
      const column = createColumn('<jtags-column></jtags-column>');
      column.sortable = true;
      expect(column.hasAttribute('sortable')).to.be.true;
    });

    it('should unset sortable via property', () => {
      const column = createColumn('<jtags-column sortable></jtags-column>');
      column.sortable = false;
      expect(column.hasAttribute('sortable')).to.be.false;
    });

    it('should set searchable via property', () => {
      const column = createColumn('<jtags-column></jtags-column>');
      column.searchable = true;
      expect(column.hasAttribute('searchable')).to.be.true;
    });

    it('should unset searchable via property', () => {
      const column = createColumn('<jtags-column searchable></jtags-column>');
      column.searchable = false;
      expect(column.hasAttribute('searchable')).to.be.false;
    });

    it('should set width via property', () => {
      const column = createColumn('<jtags-column></jtags-column>');
      column.width = '150px';
      expect(column.getAttribute('width')).to.equal('150px');
    });

    it('should remove width when set to null', () => {
      const column = createColumn('<jtags-column width="100px"></jtags-column>');
      column.width = null;
      expect(column.hasAttribute('width')).to.be.false;
    });
  });
});