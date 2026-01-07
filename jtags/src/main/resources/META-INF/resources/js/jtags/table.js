function closeModal() {
  document.getElementById('jtags-modal').classList.add('jtags-hidden');
}

function handleAction(button) {
  const needsConfirm = button.dataset.confirm === 'true';

  if (needsConfirm) {
    openActionModal(button);
  } else {
    executeAction(button);
  }
}

let pendingAction = null;
function openActionModal(button) {
  const message = button.dataset.confirmMessage;
  const isSelectionBased = button.classList.contains('jtags-table__action--selection');

  const banner = document.getElementById('selection-banner');
  const totalItems = parseInt(banner.dataset.totalItems);

  pendingAction = {
    url: button.dataset.url,
    method: button.dataset.method,
    isSelectionBased: isSelectionBased
  };

  if (isSelectionBased) {
    if (selectionMode === 'filter') {
      document.getElementById('jtags-modal-message').textContent = `${message} (${totalItems} items matching filter)`;
    } else {
      document.getElementById('jtags-modal-message').textContent = `${message} (${selectedIds.length} items selected)`;
    }
  } else {
    document.getElementById('jtags-modal-message').textContent = message;
  }

  document.getElementById('jtags-modal').classList.remove('jtags-hidden');
}

function confirmAction() {
  let params = {};

  if (pendingAction.isSelectionBased) {
    params.selectionMode = selectionMode;
    if (selectionMode === 'ids') {
      params.ids = selectedIds;
    } else {
      // Include filter params
      params.searchField = document.getElementById('searchField').value;
      params.search = document.getElementById('search').value;
    }
  }

  htmx.ajax(pendingAction.method, pendingAction.url, {
    target: '#table-container',
    swap: 'outerHTML',
    values: params
  }).then(() => {
    closeModal();
    // Reset selection state after successful action
    if (pendingAction.isSelectionBased) {
      selectionMode = 'ids';
      selectedIds = [];
    }
    pendingAction = null;
  });
}

function executeAction(button) {
  const url = button.dataset.url;
  const method = button.dataset.method;

  htmx.ajax(method, url, {
    target: '#table-container',
    swap: 'outerHTML'
  });
}

// State variables - persist across swaps
let selectionMode = 'ids';
let selectedIds = [];

// Modal handlers - these elements are outside swap zone, attach once
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('jtags-modal').addEventListener('click',
      closeModal);
  document.querySelector('#jtags-modal .jtags-modal__content').addEventListener(
      'click',
      function (event) {
        event.stopPropagation();
      });
});

// Delegated handlers - work for elements inside swap zone
document.body.addEventListener('click', function (event) {

  // Select all checkbox
  if (event.target.matches('#select-all')) {
    handleSelectAll(event.target);
  }

  // Row checkbox
  if (event.target.matches('input[name="select-item"]')) {
    handleRowCheckbox(event.target);
  }

  // "Select all X matching" link in banner
  if (event.target.matches('#select-all-matching')) {
    handleSelectAllMatching();
  }

  // "Clear selection" link in banner
  if (event.target.matches('#clear-selection')) {
    handleClearSelection();
  }

  if (event.target.matches('.jtags-table__action--selection')) {
    handleAction(event.target);
  }

  if (event.target.matches('.jtags-table__action--global')) {
    handleAction(event.target);
  }
});

function handleSelectAll(checkbox) {
  const rowCheckboxes = document.querySelectorAll('input[name="select-item"]');

  rowCheckboxes.forEach(cb => {
    cb.checked = checkbox.checked;
  });

  if (checkbox.checked) {
    selectedIds = Array.from(rowCheckboxes).map(cb => cb.value);
    showSelectionActions();
    showBannerIfMorePages();
  } else {
    selectedIds = [];
    selectionMode = 'ids';
    hideSelectionActions();
    hideBanner();
  }
}

function handleRowCheckbox(checkbox) {
  const id = checkbox.value;

  if (checkbox.checked) {
    if (!selectedIds.includes(id)) {
      selectedIds.push(id);
    }
  } else {
    selectedIds = selectedIds.filter(i => i !== id);
    selectionMode = 'ids'; // revert to ids mode if any unchecked
  }

  updateSelectAllState();
  updateUIState();
}

function handleSelectAllMatching() {
  selectionMode = 'filter';
  updateBannerForFilterMode();
}

function handleClearSelection() {
  selectionMode = 'ids';
  selectedIds = [];

  document.querySelectorAll('input[name="select-item"]').forEach(cb => {
    cb.checked = false;
  });
  document.getElementById('select-all').checked = false;
  document.getElementById('select-all').indeterminate = false;

  const banner = document.getElementById('selection-banner');
  const totalItems = parseInt(banner.dataset.totalItems);
  const pageSize = parseInt(banner.dataset.pageSize);

  banner.innerHTML = `<p>All ${pageSize} items on this page selected.
            <a id="select-all-matching" href="#">Select all ${totalItems}?</a>
        </p>`;

  hideSelectionActions();
  hideBanner();
}

function updateSelectAllState() {
  const checkboxes = Array.from(
      document.querySelectorAll('input[name="select-item"]'));
  const selectAll = document.getElementById('select-all');

  const allChecked = checkboxes.every(cb => cb.checked);
  const noneChecked = checkboxes.every(cb => !cb.checked);

  if (allChecked) {
    selectAll.indeterminate = false;
    selectAll.checked = true;
  } else if (noneChecked) {
    selectAll.indeterminate = false;
    selectAll.checked = false;
  } else {
    selectAll.indeterminate = true;
  }
}

function updateUIState() {
  if (selectedIds.length > 0) {
    showSelectionActions();
  } else {
    hideSelectionActions();
    hideBanner();
  }

  // Only show banner if all visible are selected AND more pages exist
  const checkboxes = Array.from(
      document.querySelectorAll('input[name="select-item"]'));
  const allChecked = checkboxes.every(cb => cb.checked);

  if (allChecked && selectionMode === 'ids') {
    showBannerIfMorePages();
  } else if (selectionMode !== 'filter') {
    hideBanner();
  }
}

function showSelectionActions() {
  document.querySelectorAll('.jtags-table__action--selection')
  .forEach(it => {
    it.classList.remove('jtags-hidden');
  })
}

function hideSelectionActions() {
  document.querySelectorAll('.jtags-table__action--selection')
  .forEach(it => {
    it.classList.add('jtags-hidden');
  });
}

function showBannerIfMorePages() {
  // You'll need to pass totalItems and pageSize from the template
  const banner = document.getElementById('selection-banner');
  const totalItems = parseInt(banner.dataset.totalItems);
  const pageSize = parseInt(banner.dataset.pageSize);

  if (totalItems > pageSize) {
    banner.classList.remove('jtags-hidden');
  }
}

function hideBanner() {
  document.getElementById('selection-banner').classList.add('jtags-hidden');
}

function updateBannerForFilterMode() {
  const banner = document.getElementById('selection-banner');
  const totalItems = banner.dataset.totalItems;
  banner.innerHTML = `<p>All ${totalItems} items selected. <a id="clear-selection" href="#">Clear selection</a></p>`;
}

document.body.addEventListener('htmx:afterSwap', function(event) {
  if (event.detail.target.id === 'table-container') {
    selectionMode = 'ids';
    selectedIds = [];
  }
});