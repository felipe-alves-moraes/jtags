# jtags Events Reference

This document describes custom events emitted by jtags web components. These events allow you to react to user interactions and component state changes.

All events bubble up through the DOM, so you can listen on any parent element or `document.body`.

---

## State Change Events

These events are emitted when the table state changes due to user interaction.

### `jtags-table-sort`

Emitted when a column header is clicked for sorting.

| Property | Type | Description |
|----------|------|-------------|
| `detail.sortBy` | `string` | Column key to sort by |
| `detail.ascending` | `boolean` | Sort direction (`true` = ASC) |

```javascript
document.body.addEventListener('jtags-table-sort', (event) => {
  console.log('Sort by:', event.detail.sortBy);
  console.log('Ascending:', event.detail.ascending);
});
```

---

### `jtags-table-search`

Emitted when the search input changes (debounced).

| Property | Type | Description |
|----------|------|-------------|
| `detail.searchField` | `string` | Field being searched |
| `detail.searchTerm` | `string` | Search query |

```javascript
document.body.addEventListener('jtags-table-search', (event) => {
  console.log('Searching', event.detail.searchField, 'for:', event.detail.searchTerm);
});
```

---

### `jtags-table-page`

Emitted when navigating to a different page.

| Property | Type | Description |
|----------|------|-------------|
| `detail.page` | `number` | Target page number (1-based) |

```javascript
document.body.addEventListener('jtags-table-page', (event) => {
  console.log('Navigate to page:', event.detail.page);
});
```

---

### `jtags-table-size`

Emitted when the page size selector changes.

| Property | Type | Description |
|----------|------|-------------|
| `detail.size` | `number` | New page size |

```javascript
document.body.addEventListener('jtags-table-size', (event) => {
  console.log('Page size changed to:', event.detail.size);
});
```

---

## Lifecycle Events

### `jtags-table-ready`

Emitted when the table component has finished initialization.

| Property | Type | Description |
|----------|------|-------------|
| `detail.table` | `JtagsTable` | Reference to the table element |
| `detail.columns` | `Array` | Parsed column configurations |
| `detail.actions` | `Array` | Parsed action configurations |

```javascript
document.body.addEventListener('jtags-table-ready', (event) => {
  console.log('Table initialized:', event.detail.table.id);
  console.log('Columns:', event.detail.columns.length);
});
```

---

### `jtags-config-changed`

Emitted when the table's configuration changes (columns or actions modified).

| Property | Type | Description |
|----------|------|-------------|
| `detail.columns` | `Array` | Updated column configurations |
| `detail.actions` | `Array` | Updated action configurations |

---

### `selection-changed`

Emitted when the row selection state changes.

| Property | Type | Description |
|----------|------|-------------|
| `detail.selectedIds` | `Set<string>` | Set of selected row IDs |
| `detail.selectionMode` | `string` | `'ids'` or `'filter'` |
| `detail.count` | `number` | Number of selected items |

```javascript
document.body.addEventListener('selection-changed', (event) => {
  console.log('Selected:', event.detail.count, 'items');

  // Example: Enable/disable a custom button
  myExportButton.disabled = event.detail.count === 0;
});
```

---

### `action-triggered`

Emitted when a toolbar action button is clicked.

| Property | Type | Description |
|----------|------|-------------|
| `detail.action` | `string` | Action key (e.g., `'delete'`, `'export'`) |
| `detail.element` | `HTMLElement` | The action button element |

```javascript
document.body.addEventListener('action-triggered', (event) => {
  console.log('Action clicked:', event.detail.action);
});
```

---

### `jtags-action-success`

Emitted when an action completes successfully.

| Property | Type | Description |
|----------|------|-------------|
| `detail.action` | `string` | Action key |
| `detail.response` | `Response` | Fetch response object |

```javascript
document.body.addEventListener('jtags-action-success', (event) => {
  showNotification('Action completed successfully');
});
```

---

### `jtags-action-error`

Emitted when an action fails.

| Property | Type | Description |
|----------|------|-------------|
| `detail.action` | `string` | Action key |
| `detail.error` | `Error` | Error object |

```javascript
document.body.addEventListener('jtags-action-error', (event) => {
  showNotification('Error: ' + event.detail.error.message, 'error');
});
```

---

## Modal Events

### `jtags-modal-confirm`

Emitted when the modal's confirm button is clicked. **This event is cancelable.**

| Property | Type | Description |
|----------|------|-------------|
| `bubbles` | `true` | Event bubbles up |
| `cancelable` | `true` | Can call `preventDefault()` |

```javascript
modal.addEventListener('jtags-modal-confirm', (event) => {
  // Prevent default auto-close for async operations
  event.preventDefault();

  doAsyncWork().then(() => {
    modal.close();
  });
});
```

**Default behavior:** If not prevented, the modal closes automatically.

---

### `jtags-modal-cancel`

Emitted when the modal is dismissed (cancel button, escape key, or backdrop click).

| Property | Type | Description |
|----------|------|-------------|
| `bubbles` | `true` | Event bubbles up |

```javascript
modal.addEventListener('jtags-modal-cancel', (event) => {
  console.log('User cancelled');
});
```

---

## Render Event

### `jtags-render`

Emitted when a component renders dynamic content. Useful for initializing external libraries on new elements.

| Property | Type | Description |
|----------|------|-------------|
| `detail.element` | `HTMLElement` | The newly rendered element |

```javascript
// Example: Initialize tooltips on dynamically rendered buttons
document.body.addEventListener('jtags-render', (event) => {
  initTooltips(event.detail.element);
});
```

---

## Usage Examples

### Selection Counter

```html
<span id="selection-count">0 selected</span>

<script>
document.body.addEventListener('selection-changed', (event) => {
  document.getElementById('selection-count').textContent =
    event.detail.count + ' selected';
});
</script>
```

### Custom Confirm Handler

```javascript
document.body.addEventListener('jtags-modal-confirm', (event) => {
  event.preventDefault();

  const selectedIds = Array.from(
    document.querySelector('jtags-table').selectedIds
  );

  fetch('/api/delete', {
    method: 'DELETE',
    body: JSON.stringify({ ids: selectedIds })
  }).then(() => {
    event.target.closest('jtags-modal').close();
    location.reload();
  });
});
```

### Action Analytics

```javascript
document.body.addEventListener('action-triggered', (event) => {
  analytics.track('table_action', {
    action: event.detail.action
  });
});
```