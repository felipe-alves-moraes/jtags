import { expect } from '@esm-bundle/chai';
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-action-cell.js';

describe('JtagsActionCell', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function createActionCell(html) {
    container.innerHTML = html;
    return container.querySelector('jtags-action-cell');
  }

  describe('initialization', () => {
    it('should register as custom element', () => {
      expect(customElements.get('jtags-action-cell')).to.exist;
    });

    it('should render as table-cell', () => {
      const cell = createActionCell('<jtags-action-cell action="edit"></jtags-action-cell>');
      expect(cell.style.display).to.equal('table-cell');
    });

    it('should have jtags-table__cell class', () => {
      const cell = createActionCell('<jtags-action-cell action="edit"></jtags-action-cell>');
      expect(cell.classList.contains('jtags-table__cell')).to.be.true;
    });

    it('should have jtags-table__cell--actions class', () => {
      const cell = createActionCell('<jtags-action-cell action="edit"></jtags-action-cell>');
      expect(cell.classList.contains('jtags-table__cell--actions')).to.be.true;
    });

    it('should warn if action attribute is missing', () => {
      const warnings = [];
      const originalWarn = console.warn;
      console.warn = (msg) => warnings.push(msg);

      createActionCell('<jtags-action-cell></jtags-action-cell>');

      console.warn = originalWarn;
      expect(warnings.some(w => w.includes('requires "action" attribute'))).to.be.true;
    });
  });

  describe('button rendering', () => {
    it('should create a button element', () => {
      const cell = createActionCell('<jtags-action-cell action="edit"></jtags-action-cell>');
      const button = cell.querySelector('button');
      expect(button).to.exist;
      expect(button.type).to.equal('button');
    });

    it('should have button class', () => {
      const cell = createActionCell('<jtags-action-cell action="edit"></jtags-action-cell>');
      const button = cell.querySelector('button');
      expect(button.classList.contains('jtags-action-cell__button')).to.be.true;
    });

    it('should set data-action attribute on button', () => {
      const cell = createActionCell('<jtags-action-cell action="delete"></jtags-action-cell>');
      const button = cell.querySelector('button');
      expect(button.dataset.action).to.equal('delete');
    });

    it('should expose button via property', () => {
      const cell = createActionCell('<jtags-action-cell action="edit"></jtags-action-cell>');
      expect(cell.button).to.equal(cell.querySelector('.jtags-action-cell__button'));
    });
  });

  describe('icon rendering', () => {
    it('should render icon when specified', () => {
      const cell = createActionCell('<jtags-action-cell action="edit" icon="edit"></jtags-action-cell>');
      const svg = cell.querySelector('svg');
      expect(svg).to.exist;
      expect(svg.classList.contains('jtags-icon')).to.be.true;
    });

    it('should use correct icon href', () => {
      const cell = createActionCell('<jtags-action-cell action="edit" icon="pencil"></jtags-action-cell>');
      const use = cell.querySelector('use');
      expect(use.getAttribute('href')).to.include('#jtags-icon-pencil');
    });

    it('should use default icon base path', () => {
      const cell = createActionCell('<jtags-action-cell action="edit" icon="edit"></jtags-action-cell>');
      const use = cell.querySelector('use');
      expect(use.getAttribute('href')).to.include('/icons/jtags/icons.svg');
    });

    it('should use custom icon base path', () => {
      const cell = createActionCell(
        '<jtags-action-cell action="edit" icon="edit" icon-base-path="/custom/icons.svg"></jtags-action-cell>'
      );
      const use = cell.querySelector('use');
      expect(use.getAttribute('href')).to.equal('/custom/icons.svg#jtags-icon-edit');
    });

    it('should not render icon when not specified', () => {
      const cell = createActionCell('<jtags-action-cell action="edit" label="Edit"></jtags-action-cell>');
      const svg = cell.querySelector('svg');
      expect(svg).to.be.null;
    });
  });

  describe('label rendering', () => {
    it('should render label when specified', () => {
      const cell = createActionCell('<jtags-action-cell action="edit" label="Edit"></jtags-action-cell>');
      const span = cell.querySelector('.jtags-action-cell__label');
      expect(span).to.exist;
      expect(span.textContent).to.equal('Edit');
    });

    it('should set title attribute on button', () => {
      const cell = createActionCell('<jtags-action-cell action="edit" label="Edit Item"></jtags-action-cell>');
      const button = cell.querySelector('button');
      expect(button.getAttribute('title')).to.equal('Edit Item');
    });

    it('should escape HTML in label', () => {
      const cell = createActionCell(
        '<jtags-action-cell action="edit" label="<script>alert(1)</script>"></jtags-action-cell>'
      );
      const span = cell.querySelector('.jtags-action-cell__label');
      expect(span.innerHTML).to.not.include('<script>');
      expect(span.textContent).to.include('<script>');
    });

    it('should not render label span when not specified', () => {
      const cell = createActionCell('<jtags-action-cell action="edit" icon="edit"></jtags-action-cell>');
      const span = cell.querySelector('.jtags-action-cell__label');
      expect(span).to.be.null;
    });
  });

  describe('icon and label together', () => {
    it('should render both icon and label', () => {
      const cell = createActionCell(
        '<jtags-action-cell action="edit" icon="pencil" label="Edit"></jtags-action-cell>'
      );
      expect(cell.querySelector('svg')).to.exist;
      expect(cell.querySelector('.jtags-action-cell__label')).to.exist;
    });
  });

  describe('HTMX attribute passthrough', () => {
    it('should copy hx-get to button', () => {
      const cell = createActionCell(
        '<jtags-action-cell action="edit" hx-get="/users/1/edit"></jtags-action-cell>'
      );
      const button = cell.querySelector('button');
      expect(button.getAttribute('hx-get')).to.equal('/users/1/edit');
    });

    it('should copy hx-delete to button', () => {
      const cell = createActionCell(
        '<jtags-action-cell action="delete" hx-delete="/users/1"></jtags-action-cell>'
      );
      const button = cell.querySelector('button');
      expect(button.getAttribute('hx-delete')).to.equal('/users/1');
    });

    it('should copy hx-target to button', () => {
      const cell = createActionCell(
        '<jtags-action-cell action="edit" hx-get="/edit" hx-target="#modal"></jtags-action-cell>'
      );
      const button = cell.querySelector('button');
      expect(button.getAttribute('hx-target')).to.equal('#modal');
    });

    it('should copy hx-swap to button', () => {
      const cell = createActionCell(
        '<jtags-action-cell action="delete" hx-delete="/del" hx-swap="delete"></jtags-action-cell>'
      );
      const button = cell.querySelector('button');
      expect(button.getAttribute('hx-swap')).to.equal('delete');
    });

    it('should copy hx-confirm to button', () => {
      const cell = createActionCell(
        '<jtags-action-cell action="delete" hx-delete="/del" hx-confirm="Are you sure?"></jtags-action-cell>'
      );
      const button = cell.querySelector('button');
      expect(button.getAttribute('hx-confirm')).to.equal('Are you sure?');
    });

    it('should copy multiple hx-* attributes', () => {
      const cell = createActionCell(`
        <jtags-action-cell action="delete"
                           hx-delete="/users/1"
                           hx-target="closest tr"
                           hx-swap="outerHTML"
                           hx-confirm="Delete?">
        </jtags-action-cell>
      `);
      const button = cell.querySelector('button');
      expect(button.getAttribute('hx-delete')).to.equal('/users/1');
      expect(button.getAttribute('hx-target')).to.equal('closest tr');
      expect(button.getAttribute('hx-swap')).to.equal('outerHTML');
      expect(button.getAttribute('hx-confirm')).to.equal('Delete?');
    });
  });

  describe('property getters/setters', () => {
    it('should get action', () => {
      const cell = createActionCell('<jtags-action-cell action="edit"></jtags-action-cell>');
      expect(cell.action).to.equal('edit');
    });

    it('should set action', () => {
      const cell = createActionCell('<jtags-action-cell action="edit"></jtags-action-cell>');
      cell.action = 'delete';
      expect(cell.getAttribute('action')).to.equal('delete');
    });

    it('should get icon', () => {
      const cell = createActionCell('<jtags-action-cell action="edit" icon="pencil"></jtags-action-cell>');
      expect(cell.icon).to.equal('pencil');
    });

    it('should set icon', () => {
      const cell = createActionCell('<jtags-action-cell action="edit"></jtags-action-cell>');
      cell.icon = 'trash';
      expect(cell.getAttribute('icon')).to.equal('trash');
    });

    it('should get label', () => {
      const cell = createActionCell('<jtags-action-cell action="edit" label="Edit"></jtags-action-cell>');
      expect(cell.label).to.equal('Edit');
    });

    it('should set label', () => {
      const cell = createActionCell('<jtags-action-cell action="edit"></jtags-action-cell>');
      cell.label = 'Delete';
      expect(cell.getAttribute('label')).to.equal('Delete');
    });
  });

  describe('attribute change re-render', () => {
    it('should re-render when icon changes', () => {
      const cell = createActionCell('<jtags-action-cell action="edit" icon="edit"></jtags-action-cell>');
      cell.icon = 'trash';
      const use = cell.querySelector('use');
      expect(use.getAttribute('href')).to.include('#jtags-icon-trash');
    });

    it('should re-render when label changes', () => {
      const cell = createActionCell('<jtags-action-cell action="edit" label="Edit"></jtags-action-cell>');
      cell.label = 'Update';
      const span = cell.querySelector('.jtags-action-cell__label');
      expect(span.textContent).to.equal('Update');
    });
  });
});