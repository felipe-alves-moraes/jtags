import { expect } from '@esm-bundle/chai';
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-pagination.js';
// Import jtags-table for parent-child tests
import '../../../main/resources/META-INF/resources/js/jtags/components/jtags-table.js';

describe('JtagsPagination', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function createPagination(html) {
    container.innerHTML = html;
    return container.querySelector('jtags-pagination');
  }

  describe('initialization', () => {
    it('should register as custom element', () => {
      expect(customElements.get('jtags-pagination')).to.exist;
    });

    it('should have jtags-pagination class', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      expect(pagination.classList.contains('jtags-pagination')).to.be.true;
    });

    it('should create info element', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      expect(pagination.infoElement).to.exist;
      expect(pagination.infoElement.classList.contains('jtags-pagination__info')).to.be.true;
    });

    it('should create navigation element', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      expect(pagination.navElement).to.exist;
      expect(pagination.navElement.classList.contains('jtags-pagination__list')).to.be.true;
    });

    it('should create size selector element', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      expect(pagination.sizeSelect).to.exist;
    });
  });

  describe('page info', () => {
    it('should show correct info for first page', () => {
      const pagination = createPagination(
        '<jtags-pagination current="1" total="10" size="25" total-items="250"></jtags-pagination>'
      );
      expect(pagination.infoElement.textContent).to.equal('Showing 1-25 of 250');
    });

    it('should show correct info for middle page', () => {
      const pagination = createPagination(
        '<jtags-pagination current="3" total="10" size="25" total-items="250"></jtags-pagination>'
      );
      expect(pagination.infoElement.textContent).to.equal('Showing 51-75 of 250');
    });

    it('should show correct info for last page with partial items', () => {
      const pagination = createPagination(
        '<jtags-pagination current="10" total="10" size="25" total-items="243"></jtags-pagination>'
      );
      expect(pagination.infoElement.textContent).to.equal('Showing 226-243 of 243');
    });

    it('should show "No items" when total-items is 0', () => {
      const pagination = createPagination(
        '<jtags-pagination current="1" total="1" size="10" total-items="0"></jtags-pagination>'
      );
      expect(pagination.infoElement.textContent).to.equal('No items');
    });
  });

  describe('navigation buttons', () => {
    it('should create prev and next buttons', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      expect(pagination.prevButton).to.exist;
      expect(pagination.nextButton).to.exist;
    });

    it('should disable prev button on first page', () => {
      const pagination = createPagination(
        '<jtags-pagination current="1" total="10"></jtags-pagination>'
      );
      expect(pagination.prevButton.disabled).to.be.true;
    });

    it('should enable prev button on page > 1', () => {
      const pagination = createPagination(
        '<jtags-pagination current="2" total="10"></jtags-pagination>'
      );
      expect(pagination.prevButton.disabled).to.be.false;
    });

    it('should disable next button on last page', () => {
      const pagination = createPagination(
        '<jtags-pagination current="10" total="10"></jtags-pagination>'
      );
      expect(pagination.nextButton.disabled).to.be.true;
    });

    it('should enable next button when not on last page', () => {
      const pagination = createPagination(
        '<jtags-pagination current="5" total="10"></jtags-pagination>'
      );
      expect(pagination.nextButton.disabled).to.be.false;
    });

    it('should enable both buttons on middle page', () => {
      const pagination = createPagination(
        '<jtags-pagination current="5" total="10"></jtags-pagination>'
      );
      expect(pagination.prevButton.disabled).to.be.false;
      expect(pagination.nextButton.disabled).to.be.false;
    });

    it('should have data-page attribute on buttons', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      expect(pagination.prevButton.dataset.page).to.equal('prev');
      expect(pagination.nextButton.dataset.page).to.equal('next');
    });

    it('should render icons in buttons', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      expect(pagination.prevButton.querySelector('svg')).to.exist;
      expect(pagination.nextButton.querySelector('svg')).to.exist;
    });

    it('should show page indicator', () => {
      const pagination = createPagination(
        '<jtags-pagination current="3" total="10"></jtags-pagination>'
      );
      const indicator = pagination.querySelector('.jtags-pagination__pages');
      expect(indicator).to.exist;
      expect(indicator.textContent).to.equal('Page 3 of 10');
    });
  });

  describe('labels', () => {
    it('should NOT show labels by default', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      // Labels are span elements inside buttons (not SVGs)
      const prevLabel = pagination.prevButton.querySelector('span');
      const nextLabel = pagination.nextButton.querySelector('span');
      expect(prevLabel).to.be.null;
      expect(nextLabel).to.be.null;
    });

    it('should show labels when show-labels attribute is set', () => {
      const pagination = createPagination('<jtags-pagination show-labels></jtags-pagination>');
      const prevLabel = pagination.prevButton.querySelector('span');
      const nextLabel = pagination.nextButton.querySelector('span');
      expect(prevLabel).to.exist;
      expect(nextLabel).to.exist;
      expect(prevLabel.textContent).to.equal('Previous');
      expect(nextLabel.textContent).to.equal('Next');
    });
  });

  describe('page size selector', () => {
    it('should create size selector with default options', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      const options = pagination.sizeSelect.querySelectorAll('option');
      expect(options.length).to.equal(4);
      expect(options[0].value).to.equal('10');
      expect(options[1].value).to.equal('25');
      expect(options[2].value).to.equal('50');
      expect(options[3].value).to.equal('100');
    });

    it('should use custom sizes from attribute', () => {
      const pagination = createPagination(
        '<jtags-pagination sizes="5,15,30"></jtags-pagination>'
      );
      const options = pagination.sizeSelect.querySelectorAll('option');
      expect(options.length).to.equal(3);
      expect(options[0].value).to.equal('5');
      expect(options[1].value).to.equal('15');
      expect(options[2].value).to.equal('30');
    });

    it('should select current size', () => {
      const pagination = createPagination(
        '<jtags-pagination size="50"></jtags-pagination>'
      );
      expect(pagination.sizeSelect.value).to.equal('50');
    });

    it('should have label and suffix text', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      const sizeContainer = pagination.querySelector('.jtags-pagination__size');
      expect(sizeContainer.querySelector('label').textContent).to.equal('Show');
      expect(sizeContainer.querySelector('span').textContent).to.equal('per page');
    });
  });

  describe('events', () => {
    it('should emit jtags-page-change on prev click', (done) => {
      const pagination = createPagination(
        '<jtags-pagination current="5" total="10"></jtags-pagination>'
      );

      pagination.addEventListener('jtags-page-change', (e) => {
        expect(e.detail.page).to.equal(4);
        done();
      }, { once: true });

      pagination.prevButton.click();
    });

    it('should emit jtags-page-change on next click', (done) => {
      const pagination = createPagination(
        '<jtags-pagination current="5" total="10"></jtags-pagination>'
      );

      pagination.addEventListener('jtags-page-change', (e) => {
        expect(e.detail.page).to.equal(6);
        done();
      }, { once: true });

      pagination.nextButton.click();
    });

    it('should NOT emit page-change when prev clicked on first page', () => {
      const pagination = createPagination(
        '<jtags-pagination current="1" total="10"></jtags-pagination>'
      );

      let eventFired = false;
      pagination.addEventListener('jtags-page-change', () => {
        eventFired = true;
      }, { once: true });

      pagination.prevButton.click();
      expect(eventFired).to.be.false;
    });

    it('should NOT emit page-change when next clicked on last page', () => {
      const pagination = createPagination(
        '<jtags-pagination current="10" total="10"></jtags-pagination>'
      );

      let eventFired = false;
      pagination.addEventListener('jtags-page-change', () => {
        eventFired = true;
      }, { once: true });

      pagination.nextButton.click();
      expect(eventFired).to.be.false;
    });

    it('should emit jtags-size-change on size select change', (done) => {
      const pagination = createPagination(
        '<jtags-pagination size="10"></jtags-pagination>'
      );

      pagination.addEventListener('jtags-size-change', (e) => {
        expect(e.detail.size).to.equal(50);
        done();
      }, { once: true });

      pagination.sizeSelect.value = '50';
      pagination.sizeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  describe('property getters/setters', () => {
    it('should get/set currentPage', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      pagination.currentPage = 5;
      expect(pagination.getAttribute('current')).to.equal('5');
      expect(pagination.currentPage).to.equal(5);
    });

    it('should get/set totalPages', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      pagination.totalPages = 20;
      expect(pagination.getAttribute('total')).to.equal('20');
      expect(pagination.totalPages).to.equal(20);
    });

    it('should get/set pageSize', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      pagination.pageSize = 50;
      expect(pagination.getAttribute('size')).to.equal('50');
      expect(pagination.pageSize).to.equal(50);
    });

    it('should get/set totalItems', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      pagination.totalItems = 500;
      expect(pagination.getAttribute('total-items')).to.equal('500');
      expect(pagination.totalItems).to.equal(500);
    });

    it('should get/set pageSizes', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      pagination.pageSizes = [5, 10, 20];
      expect(pagination.getAttribute('sizes')).to.equal('5,10,20');
      expect(pagination.pageSizes).to.deep.equal([5, 10, 20]);
    });

    it('should get/set showLabels', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      expect(pagination.showLabels).to.be.false;
      pagination.showLabels = true;
      expect(pagination.hasAttribute('show-labels')).to.be.true;
      expect(pagination.showLabels).to.be.true;
    });

    it('should compute hasPrevious correctly', () => {
      const pagination = createPagination(
        '<jtags-pagination current="1" total="10"></jtags-pagination>'
      );
      expect(pagination.hasPrevious).to.be.false;

      pagination.currentPage = 5;
      expect(pagination.hasPrevious).to.be.true;
    });

    it('should compute hasNext correctly', () => {
      const pagination = createPagination(
        '<jtags-pagination current="10" total="10"></jtags-pagination>'
      );
      expect(pagination.hasNext).to.be.false;

      pagination.currentPage = 5;
      expect(pagination.hasNext).to.be.true;
    });
  });

  describe('attribute updates', () => {
    it('should update info when total-items changes', () => {
      const pagination = createPagination(
        '<jtags-pagination current="1" size="10" total-items="100"></jtags-pagination>'
      );
      expect(pagination.infoElement.textContent).to.equal('Showing 1-10 of 100');

      pagination.totalItems = 200;
      expect(pagination.infoElement.textContent).to.equal('Showing 1-10 of 200');
    });

    it('should update navigation when current page changes', () => {
      const pagination = createPagination(
        '<jtags-pagination current="1" total="10"></jtags-pagination>'
      );
      expect(pagination.prevButton.disabled).to.be.true;

      pagination.currentPage = 5;
      expect(pagination.prevButton.disabled).to.be.false;
    });

    it('should update size select when size attribute changes', () => {
      const pagination = createPagination(
        '<jtags-pagination size="10"></jtags-pagination>'
      );
      expect(pagination.sizeSelect.value).to.equal('10');

      pagination.pageSize = 50;
      expect(pagination.sizeSelect.value).to.equal('50');
    });
  });

  describe('icon base path', () => {
    it('should use default icon base path', () => {
      const pagination = createPagination('<jtags-pagination></jtags-pagination>');
      const useElement = pagination.prevButton.querySelector('use');
      expect(useElement.getAttribute('href')).to.include('/icons/jtags/icons.svg');
    });

    it('should get icon base path from parent table', () => {
      container.innerHTML = `
        <jtags-table icon-base-path="/custom/icons.svg">
          <jtags-column key="id" label="ID"></jtags-column>
          <jtags-pagination></jtags-pagination>
        </jtags-table>
      `;

      const pagination = container.querySelector('jtags-pagination');
      const useElement = pagination.prevButton.querySelector('use');
      expect(useElement.getAttribute('href')).to.include('/custom/icons.svg');
    });
  });
});