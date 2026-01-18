import { expect } from '@esm-bundle/chai';
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-action.js';
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-table.js';

describe('JtagsAction', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function createAction(html) {
    container.innerHTML = html;
    return container.querySelector('jtags-action');
  }

  describe('initialization', () => {
    it('should register as custom element', () => {
      expect(customElements.get('jtags-action')).to.exist;
    });

    it('should have button role', () => {
      const action = createAction('<jtags-action key="delete" label="Delete"></jtags-action>');
      expect(action.getAttribute('role')).to.equal('button');
    });

    it('should have tabindex for keyboard accessibility', () => {
      const action = createAction('<jtags-action key="delete" label="Delete"></jtags-action>');
      expect(action.getAttribute('tabindex')).to.equal('0');
    });

    it('should have base action class', () => {
      const action = createAction('<jtags-action key="delete" label="Delete"></jtags-action>');
      expect(action.classList.contains('jtags-table__action')).to.be.true;
    });

    it('should have global action class by default', () => {
      const action = createAction('<jtags-action key="export" label="Export"></jtags-action>');
      expect(action.classList.contains('jtags-table__action--global')).to.be.true;
    });

    it('should have selection action class when selection-based', () => {
      const action = createAction('<jtags-action key="delete" label="Delete" selection-based></jtags-action>');
      expect(action.classList.contains('jtags-table__action--selection')).to.be.true;
    });

    it('should be hidden when selection-based', () => {
      const action = createAction('<jtags-action key="delete" label="Delete" selection-based></jtags-action>');
      expect(action.classList.contains('jtags-hidden')).to.be.true;
    });

    it('should NOT be hidden when global', () => {
      const action = createAction('<jtags-action key="export" label="Export"></jtags-action>');
      expect(action.classList.contains('jtags-hidden')).to.be.false;
    });

    it('should set title from label', () => {
      const action = createAction('<jtags-action key="delete" label="Delete Items"></jtags-action>');
      expect(action.getAttribute('title')).to.equal('Delete Items');
    });
  });

  describe('rendering', () => {
    it('should render icon when icon attribute is set', () => {
      container.innerHTML = `
        <jtags-table icon-base-path="/icons/test.svg">
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-action key="delete" label="Delete" icon="trash"></jtags-action>
        </jtags-table>
      `;
      const action = container.querySelector('jtags-action');
      const svg = action.querySelector('svg.jtags-icon');
      expect(svg).to.exist;
      expect(svg.getAttribute('aria-hidden')).to.equal('true');
    });

    it('should use correct icon href from parent table', () => {
      container.innerHTML = `
        <jtags-table icon-base-path="/icons/custom.svg">
          <jtags-column key="name" label="Name"></jtags-column>
          <jtags-action key="delete" label="Delete" icon="trash"></jtags-action>
        </jtags-table>
      `;
      const action = container.querySelector('jtags-action');
      const use = action.querySelector('svg use');
      expect(use.getAttribute('href')).to.equal('/icons/custom.svg#jtags-icon-trash');
    });

    it('should use default icon path when no parent table', () => {
      const action = createAction('<jtags-action key="delete" label="Delete" icon="trash"></jtags-action>');
      const use = action.querySelector('svg use');
      expect(use.getAttribute('href')).to.equal('/icons/jtags/icons.svg#jtags-icon-trash');
    });

    it('should NOT render icon when icon attribute is not set', () => {
      const action = createAction('<jtags-action key="delete" label="Delete"></jtags-action>');
      const svg = action.querySelector('svg');
      expect(svg).to.be.null;
    });

    it('should NOT render icon when icon attribute is empty string', () => {
      const action = createAction('<jtags-action key="delete" label="Delete" icon=""></jtags-action>');
      const svg = action.querySelector('svg');
      expect(svg).to.be.null;
    });

    it('should render label when icon is empty string', () => {
      const action = createAction('<jtags-action key="delete" label="Delete" icon=""></jtags-action>');
      const span = action.querySelector('.jtags-table__action-label');
      expect(span).to.exist;
      expect(span.textContent).to.equal('Delete');
    });

    it('should render label span when show-label is set', () => {
      const action = createAction('<jtags-action key="delete" label="Delete" icon="trash" show-label></jtags-action>');
      const span = action.querySelector('.jtags-table__action-label');
      expect(span).to.exist;
      expect(span.textContent).to.equal('Delete');
    });

    it('should render label span when no icon (fallback)', () => {
      const action = createAction('<jtags-action key="delete" label="Delete"></jtags-action>');
      const span = action.querySelector('.jtags-table__action-label');
      expect(span).to.exist;
      expect(span.textContent).to.equal('Delete');
    });

    it('should NOT render label span when icon is set but show-label is not', () => {
      const action = createAction('<jtags-action key="delete" label="Delete" icon="trash"></jtags-action>');
      const span = action.querySelector('.jtags-table__action-label');
      expect(span).to.be.null;
    });
  });

  describe('attribute parsing', () => {
    it('should parse key attribute', () => {
      const action = createAction('<jtags-action key="delete"></jtags-action>');
      expect(action.key).to.equal('delete');
    });

    it('should parse label attribute', () => {
      const action = createAction('<jtags-action label="Delete Items"></jtags-action>');
      expect(action.label).to.equal('Delete Items');
    });

    it('should parse icon attribute', () => {
      const action = createAction('<jtags-action icon="trash"></jtags-action>');
      expect(action.icon).to.equal('trash');
    });

    it('should default icon to null', () => {
      const action = createAction('<jtags-action></jtags-action>');
      expect(action.icon).to.be.null;
    });

    it('should parse selection-based boolean attribute', () => {
      const action = createAction('<jtags-action selection-based></jtags-action>');
      expect(action.selectionBased).to.be.true;
    });

    it('should default selection-based to false', () => {
      const action = createAction('<jtags-action></jtags-action>');
      expect(action.selectionBased).to.be.false;
    });

    it('should parse show-label boolean attribute', () => {
      const action = createAction('<jtags-action show-label></jtags-action>');
      expect(action.showLabel).to.be.true;
    });

    it('should default show-label to false', () => {
      const action = createAction('<jtags-action></jtags-action>');
      expect(action.showLabel).to.be.false;
    });
  });

  describe('getConfig()', () => {
    it('should return configuration object', () => {
      const action = createAction(`
        <jtags-action
          key="delete"
          label="Delete"
          icon="trash"
          selection-based
          show-label>
        </jtags-action>
      `);

      const config = action.getConfig();

      expect(config).to.deep.equal({
        key: 'delete',
        label: 'Delete',
        icon: 'trash',
        selectionBased: true,
        showLabel: true
      });
    });

    it('should return defaults for missing attributes', () => {
      const action = createAction('<jtags-action></jtags-action>');

      const config = action.getConfig();

      expect(config).to.deep.equal({
        key: '',
        label: '',
        icon: null,
        selectionBased: false,
        showLabel: false
      });
    });
  });

  describe('property setters', () => {
    it('should update key via property', () => {
      const action = createAction('<jtags-action></jtags-action>');
      action.key = 'export';
      expect(action.getAttribute('key')).to.equal('export');
    });

    it('should update label via property', () => {
      const action = createAction('<jtags-action></jtags-action>');
      action.label = 'Export Data';
      expect(action.getAttribute('label')).to.equal('Export Data');
    });

    it('should set icon via property', () => {
      const action = createAction('<jtags-action></jtags-action>');
      action.icon = 'download';
      expect(action.getAttribute('icon')).to.equal('download');
    });

    it('should remove icon when set to null', () => {
      const action = createAction('<jtags-action icon="trash"></jtags-action>');
      action.icon = null;
      expect(action.hasAttribute('icon')).to.be.false;
    });

    it('should set selectionBased via property', () => {
      const action = createAction('<jtags-action></jtags-action>');
      action.selectionBased = true;
      expect(action.hasAttribute('selection-based')).to.be.true;
    });

    it('should unset selectionBased via property', () => {
      const action = createAction('<jtags-action selection-based></jtags-action>');
      action.selectionBased = false;
      expect(action.hasAttribute('selection-based')).to.be.false;
    });

    it('should set showLabel via property', () => {
      const action = createAction('<jtags-action></jtags-action>');
      action.showLabel = true;
      expect(action.hasAttribute('show-label')).to.be.true;
    });

    it('should unset showLabel via property', () => {
      const action = createAction('<jtags-action show-label></jtags-action>');
      action.showLabel = false;
      expect(action.hasAttribute('show-label')).to.be.false;
    });
  });

  describe('HTMX attributes', () => {
    it('should preserve hx-get attribute', () => {
      const action = createAction('<jtags-action key="delete" label="Delete" hx-get="/api/delete"></jtags-action>');
      expect(action.getAttribute('hx-get')).to.equal('/api/delete');
    });

    it('should preserve hx-delete attribute', () => {
      const action = createAction('<jtags-action key="delete" label="Delete" hx-delete="/api/delete"></jtags-action>');
      expect(action.getAttribute('hx-delete')).to.equal('/api/delete');
    });

    it('should preserve hx-target attribute', () => {
      const action = createAction('<jtags-action key="delete" label="Delete" hx-target="#modal"></jtags-action>');
      expect(action.getAttribute('hx-target')).to.equal('#modal');
    });

    it('should preserve hx-swap attribute', () => {
      const action = createAction('<jtags-action key="delete" label="Delete" hx-swap="innerHTML"></jtags-action>');
      expect(action.getAttribute('hx-swap')).to.equal('innerHTML');
    });

    it('should preserve hx-include attribute', () => {
      const action = createAction('<jtags-action key="delete" label="Delete" hx-include="[name=select-item]:checked"></jtags-action>');
      expect(action.getAttribute('hx-include')).to.equal('[name=select-item]:checked');
    });
  });

  describe('keyboard interaction', () => {
    it('should trigger click on Enter key', () => {
      const action = createAction('<jtags-action key="delete" label="Delete"></jtags-action>');
      let clicked = false;
      action.addEventListener('click', () => clicked = true);

      action.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      expect(clicked).to.be.true;
    });

    it('should trigger click on Space key', () => {
      const action = createAction('<jtags-action key="delete" label="Delete"></jtags-action>');
      let clicked = false;
      action.addEventListener('click', () => clicked = true);

      action.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

      expect(clicked).to.be.true;
    });

    it('should NOT trigger click on other keys', () => {
      const action = createAction('<jtags-action key="delete" label="Delete"></jtags-action>');
      let clicked = false;
      action.addEventListener('click', () => clicked = true);

      action.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));

      expect(clicked).to.be.false;
    });
  });

  describe('re-initialization prevention', () => {
    it('should NOT duplicate content when moved', () => {
      const action = createAction('<jtags-action key="delete" label="Delete" icon="trash" show-label></jtags-action>');

      const svgsBefore = action.querySelectorAll('svg').length;
      const labelsBefore = action.querySelectorAll('.jtags-table__action-label').length;

      // Move element
      const wrapper = document.createElement('div');
      container.appendChild(wrapper);
      wrapper.appendChild(action);

      const svgsAfter = action.querySelectorAll('svg').length;
      const labelsAfter = action.querySelectorAll('.jtags-table__action-label').length;

      expect(svgsAfter).to.equal(svgsBefore);
      expect(labelsAfter).to.equal(labelsBefore);
    });

    it('should maintain _initialized flag after move', () => {
      const action = createAction('<jtags-action key="delete" label="Delete"></jtags-action>');
      expect(action._initialized).to.be.true;

      const wrapper = document.createElement('div');
      container.appendChild(wrapper);
      wrapper.appendChild(action);

      expect(action._initialized).to.be.true;
    });
  });
});