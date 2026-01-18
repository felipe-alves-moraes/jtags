import { expect } from '@esm-bundle/chai';
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-modal.js';

describe('JtagsModal', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function createModal(html) {
    container.innerHTML = html;
    return container.querySelector('jtags-modal');
  }

  describe('initialization', () => {
    it('should register as custom element', () => {
      expect(customElements.get('jtags-modal')).to.exist;
    });

    it('should have jtags-modal class', () => {
      const modal = createModal('<jtags-modal></jtags-modal>');
      expect(modal.classList.contains('jtags-modal')).to.be.true;
    });

    it('should be hidden by default', () => {
      const modal = createModal('<jtags-modal></jtags-modal>');
      expect(modal.classList.contains('jtags-hidden')).to.be.true;
    });

    it('should be visible when open attribute is set', () => {
      const modal = createModal('<jtags-modal open></jtags-modal>');
      expect(modal.classList.contains('jtags-hidden')).to.be.false;
    });

    it('should create content container', () => {
      const modal = createModal('<jtags-modal></jtags-modal>');
      expect(modal.querySelector('.jtags-modal__content')).to.exist;
    });

    it('should create buttons container', () => {
      const modal = createModal('<jtags-modal></jtags-modal>');
      expect(modal.querySelector('.jtags-modal__buttons')).to.exist;
    });
  });

  describe('message', () => {
    it('should display message from attribute', () => {
      const modal = createModal('<jtags-modal message="Are you sure?"></jtags-modal>');
      expect(modal.messageElement.textContent).to.equal('Are you sure?');
    });

    it('should update message when attribute changes', () => {
      const modal = createModal('<jtags-modal message="Initial"></jtags-modal>');
      modal.message = 'Updated message';
      expect(modal.messageElement.textContent).to.equal('Updated message');
    });

    it('should use slotted message element', () => {
      const modal = createModal(`
        <jtags-modal>
          <p slot="message">Custom message element</p>
        </jtags-modal>
      `);
      expect(modal.messageElement.textContent).to.equal('Custom message element');
    });
  });

  describe('buttons', () => {
    it('should create default confirm button', () => {
      const modal = createModal('<jtags-modal></jtags-modal>');
      expect(modal.confirmButton).to.exist;
      expect(modal.confirmButton.textContent).to.equal('Confirm');
    });

    it('should create default cancel button', () => {
      const modal = createModal('<jtags-modal></jtags-modal>');
      expect(modal.cancelButton).to.exist;
      expect(modal.cancelButton.textContent).to.equal('Cancel');
    });

    it('should use custom confirm text', () => {
      const modal = createModal('<jtags-modal confirm-text="Yes, delete"></jtags-modal>');
      expect(modal.confirmButton.textContent).to.equal('Yes, delete');
    });

    it('should use custom cancel text', () => {
      const modal = createModal('<jtags-modal cancel-text="No, keep"></jtags-modal>');
      expect(modal.cancelButton.textContent).to.equal('No, keep');
    });

    it('should use slotted confirm button', () => {
      const modal = createModal(`
        <jtags-modal>
          <button slot="confirm" id="my-confirm">Custom Confirm</button>
        </jtags-modal>
      `);
      expect(modal.confirmButton.id).to.equal('my-confirm');
      expect(modal.confirmButton.textContent).to.equal('Custom Confirm');
    });

    it('should use slotted cancel button', () => {
      const modal = createModal(`
        <jtags-modal>
          <button slot="cancel" id="my-cancel">Custom Cancel</button>
        </jtags-modal>
      `);
      expect(modal.cancelButton.id).to.equal('my-cancel');
      expect(modal.cancelButton.textContent).to.equal('Custom Cancel');
    });

    it('should preserve HTMX attributes on slotted confirm button', () => {
      const modal = createModal(`
        <jtags-modal>
          <button slot="confirm" hx-delete="/api/delete" hx-target="#table">Delete</button>
        </jtags-modal>
      `);
      expect(modal.confirmButton.getAttribute('hx-delete')).to.equal('/api/delete');
      expect(modal.confirmButton.getAttribute('hx-target')).to.equal('#table');
    });
  });

  describe('open/close', () => {
    it('should show when open() is called', () => {
      const modal = createModal('<jtags-modal></jtags-modal>');
      modal.open = true;
      expect(modal.classList.contains('jtags-hidden')).to.be.false;
    });

    it('should hide when close() is called', () => {
      const modal = createModal('<jtags-modal open></jtags-modal>');
      modal.close();
      expect(modal.classList.contains('jtags-hidden')).to.be.true;
    });

    it('should toggle open attribute', () => {
      const modal = createModal('<jtags-modal></jtags-modal>');
      expect(modal.open).to.be.false;
      modal.open = true;
      expect(modal.hasAttribute('open')).to.be.true;
      modal.open = false;
      expect(modal.hasAttribute('open')).to.be.false;
    });
  });

  describe('events', () => {
    it('should emit jtags-modal-cancel when cancel clicked', (done) => {
      const modal = createModal('<jtags-modal open></jtags-modal>');

      modal.addEventListener('jtags-modal-cancel', () => {
        done();
      }, { once: true });

      modal.cancelButton.click();
    });

    it('should emit jtags-modal-confirm when confirm clicked (non-HTMX)', (done) => {
      const modal = createModal('<jtags-modal open></jtags-modal>');

      modal.addEventListener('jtags-modal-confirm', () => {
        done();
      }, { once: true });

      modal.confirmButton.click();
    });

    it('should close when cancel clicked', () => {
      const modal = createModal('<jtags-modal open></jtags-modal>');
      modal.cancelButton.click();
      expect(modal.open).to.be.false;
    });

    it('should close when confirm clicked (non-HTMX)', () => {
      const modal = createModal('<jtags-modal open></jtags-modal>');
      modal.confirmButton.click();
      expect(modal.open).to.be.false;
    });

    it('should close when backdrop clicked', () => {
      const modal = createModal('<jtags-modal open></jtags-modal>');
      // Simulate click on modal itself (backdrop), not content
      modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(modal.open).to.be.false;
    });

    it('should NOT close when content clicked', () => {
      const modal = createModal('<jtags-modal open></jtags-modal>');
      const content = modal.querySelector('.jtags-modal__content');
      content.click();
      expect(modal.open).to.be.true;
    });

    it('should close on Escape key', () => {
      const modal = createModal('<jtags-modal open></jtags-modal>');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(modal.open).to.be.false;
    });

    it('should emit cancel event on Escape key', (done) => {
      const modal = createModal('<jtags-modal open></jtags-modal>');

      modal.addEventListener('jtags-modal-cancel', () => {
        done();
      }, { once: true });

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
  });

  describe('library-agnostic behavior', () => {
    it('should NOT add library-specific attributes to slotted confirm button', () => {
      const modal = createModal(`
        <jtags-modal>
          <button slot="confirm" hx-delete="/api/delete">Delete</button>
        </jtags-modal>
      `);
      // Component should not modify the button's HTMX attributes
      expect(modal.confirmButton.getAttribute('hx-delete')).to.equal('/api/delete');
      // Component should NOT add hx-on::after-request (that's handled by integration layer)
      expect(modal.confirmButton.hasAttribute('hx-on::after-request')).to.be.false;
    });

    it('should preserve existing attributes on slotted confirm button', () => {
      const modal = createModal(`
        <jtags-modal>
          <button slot="confirm" data-action="delete" class="custom-btn">Delete</button>
        </jtags-modal>
      `);
      expect(modal.confirmButton.getAttribute('data-action')).to.equal('delete');
      expect(modal.confirmButton.classList.contains('custom-btn')).to.be.true;
    });

    it('should emit cancelable jtags-modal-confirm event', () => {
      const modal = createModal('<jtags-modal open></jtags-modal>');
      let eventReceived = false;
      let eventCancelable = false;

      modal.addEventListener('jtags-modal-confirm', (e) => {
        eventReceived = true;
        eventCancelable = e.cancelable;
        e.preventDefault(); // Prevent auto-close
      });

      modal.confirmButton.click();
      expect(eventReceived).to.be.true;
      expect(eventCancelable).to.be.true;
      // Modal should stay open because we prevented default
      expect(modal.open).to.be.true;
    });

    it('should close modal when confirm event is not prevented', () => {
      const modal = createModal('<jtags-modal open></jtags-modal>');

      modal.confirmButton.click();
      expect(modal.open).to.be.false;
    });
  });

  describe('re-initialization prevention', () => {
    it('should NOT duplicate content when modal is moved', () => {
      const modal = createModal('<jtags-modal message="Test"></jtags-modal>');

      const contentsBefore = modal.querySelectorAll('.jtags-modal__content').length;
      expect(contentsBefore).to.equal(1);

      // Move modal
      const wrapper = document.createElement('div');
      container.appendChild(wrapper);
      wrapper.appendChild(modal);

      const contentsAfter = modal.querySelectorAll('.jtags-modal__content').length;
      expect(contentsAfter).to.equal(1);
    });

    it('should maintain _initialized flag after move', () => {
      const modal = createModal('<jtags-modal></jtags-modal>');
      expect(modal._initialized).to.be.true;

      const wrapper = document.createElement('div');
      container.appendChild(wrapper);
      wrapper.appendChild(modal);

      expect(modal._initialized).to.be.true;
    });
  });

  describe('property getters/setters', () => {
    it('should get/set open', () => {
      const modal = createModal('<jtags-modal></jtags-modal>');
      modal.open = true;
      expect(modal.hasAttribute('open')).to.be.true;
      modal.open = false;
      expect(modal.hasAttribute('open')).to.be.false;
    });

    it('should get/set message', () => {
      const modal = createModal('<jtags-modal></jtags-modal>');
      modal.message = 'New message';
      expect(modal.getAttribute('message')).to.equal('New message');
    });

    it('should get/set confirmText', () => {
      const modal = createModal('<jtags-modal></jtags-modal>');
      modal.confirmText = 'Proceed';
      expect(modal.getAttribute('confirm-text')).to.equal('Proceed');
    });

    it('should get/set cancelText', () => {
      const modal = createModal('<jtags-modal></jtags-modal>');
      modal.cancelText = 'Abort';
      expect(modal.getAttribute('cancel-text')).to.equal('Abort');
    });
  });
});