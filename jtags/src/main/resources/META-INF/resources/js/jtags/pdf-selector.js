// State variables
let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let scale = 1;
let rendering = false;
let thumbnailsRendered = false;

// Selection state
let isDrawing = false;
let selectionStart = {x: 0, y: 0};
let currentSelection = null;

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
const THUMBNAIL_SCALE = 0.3;
let zoomIndex = 2;

// DOM references
let container, canvas, ctx, thumbnailsContainer;
let overlayCanvas, overlayCtx;

// Get PDF.js library
function getPdfLib() {
  if (!window.pdfjsLib) {
    throw new Error(
        'PDF.js not loaded. Add pdfjs-dist to your web-bundler imports.');
  }
  return window.pdfjsLib;
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
  initPdfSelector();
});

// Re-init after HTMX swaps
document.body.addEventListener('htmx:afterSwap', function (event) {
  if (event.detail.target.querySelector('.jtags-pdf-selector') ||
      event.detail.target.classList.contains('jtags-pdf-selector')) {
    initPdfSelector();
  }
});

function initPdfSelector() {
  container = document.querySelector('.jtags-pdf-selector');
  if (!container) {
    return;
  }

  // Reset state
  pdfDoc = null;
  currentPage = 1;
  totalPages = 0;
  zoomIndex = 2;
  scale = ZOOM_LEVELS[zoomIndex];
  thumbnailsRendered = false;

  canvas = container.querySelector('[data-pdf-canvas]');
  thumbnailsContainer = container.querySelector('[data-thumbnails]');
  if (!canvas) {
    return;
  }

  ctx = canvas.getContext('2d');

  overlayCanvas = container.querySelector('[data-selection-overlay]');
  overlayCtx = overlayCanvas ? overlayCanvas.getContext('2d') : null;

  const pdfUrl = container.dataset.pdfUrl;
  if (pdfUrl) {
    loadDocument(pdfUrl);
  }

  updateSelectionUI();
}

async function loadDocument(url) {
  try {
    const pdfjsLib = getPdfLib();
    showLoading(true);

    const loadingTask = pdfjsLib.getDocument(url);
    pdfDoc = await loadingTask.promise;
    totalPages = pdfDoc.numPages;

    updatePageInfo();
    updateZoomLevel();
    showLoading(false);
    updateNavButtons();

    // Render first page
    await renderPage(currentPage);

    // Render thumbnails
    await renderThumbnails();

  } catch (error) {
    showError(error.message);
  }
}

async function renderPage(pageNum) {
  if (!pdfDoc || rendering) {
    return;
  }

  if (pageNum !== currentPage) {
    clearSelection();
  }

  rendering = true;

  try {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({scale: scale});

    const outputScale = window.devicePixelRatio || 1;

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + 'px';
    canvas.style.height = Math.floor(viewport.height) + 'px';

    if (overlayCanvas) {
      overlayCanvas.width = canvas.width;
      overlayCanvas.height = canvas.height;
      overlayCanvas.style.width = canvas.style.width;
      overlayCanvas.style.height = canvas.style.height;
    }

    const transform = outputScale !== 1
        ? [outputScale, 0, 0, outputScale, 0, 0]
        : null;

    await page.render({
      canvasContext: ctx,
      transform: transform,
      viewport: viewport
    }).promise;

    currentPage = pageNum;
    updatePageInfo();
    updateNavButtons();
    updateActiveThumbnail();
    redrawSelection();

  } finally {
    rendering = false;
  }
}

async function renderThumbnails() {
  if (!pdfDoc || !thumbnailsContainer || thumbnailsRendered) {
    return;
  }

  thumbnailsContainer.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const thumbnailEl = createThumbnailElement(i);
    thumbnailsContainer.appendChild(thumbnailEl);

    // Render thumbnail async (don't block)
    renderThumbnail(i, thumbnailEl.querySelector('canvas'));
  }

  thumbnailsRendered = true;
  updateActiveThumbnail();
}

function createThumbnailElement(pageNum) {
  const div = document.createElement('div');
  div.className = 'jtags-pdf-selector__thumbnail';
  div.dataset.page = pageNum;

  const canvas = document.createElement('canvas');
  canvas.className = 'jtags-pdf-selector__thumbnail-canvas';

  const label = document.createElement('span');
  label.className = 'jtags-pdf-selector__thumbnail-label';
  label.textContent = pageNum;

  div.appendChild(canvas);
  div.appendChild(label);

  return div;
}

async function renderThumbnail(pageNum, canvas) {
  try {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({scale: THUMBNAIL_SCALE});

    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise;

  } catch (error) {
    console.error('Failed to render thumbnail', pageNum, error);
  }
}

function updateActiveThumbnail() {
  if (!thumbnailsContainer) {
    return;
  }

  // Remove active from all
  thumbnailsContainer.querySelectorAll(
      '.jtags-pdf-selector__thumbnail').forEach(el => {
    el.classList.remove('jtags-pdf-selector__thumbnail--active');
  });

  // Add active to current
  const activeThumb = thumbnailsContainer.querySelector(
      `[data-page="${currentPage}"]`);
  if (activeThumb) {
    activeThumb.classList.add('jtags-pdf-selector__thumbnail--active');

    // Scroll into view if needed
    activeThumb.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  }
}

function updateSelectionUI() {
  const clearBtn = container.querySelector('[data-action="clear-selection"]');
  const infoEl = container.querySelector('[data-selection-info]');

  if (clearBtn) {
    clearBtn.hidden = !currentSelection;
  }

  if (infoEl) {
    if (currentSelection) {
      infoEl.hidden = false;
      infoEl.textContent = `Page ${currentSelection.page} · ${Math.round(
          currentSelection.width)}% × ${Math.round(currentSelection.height)}%`;
    } else {
      infoEl.hidden = false;
      infoEl.textContent = 'No selection · Full PDF';
    }
  }
}

// Event delegation
document.body.addEventListener('click', function (event) {
  if (!container) {
    return;
  }

  // Thumbnail click
  const thumbnail = event.target.closest('.jtags-pdf-selector__thumbnail');
  if (thumbnail && thumbnail.dataset.page) {
    const pageNum = parseInt(thumbnail.dataset.page, 10);
    if (pageNum !== currentPage) {
      renderPage(pageNum);
    }
    return;
  }

  // Action buttons
  const target = event.target.closest('[data-action]');
  if (!target) {
    return;
  }

  const action = target.dataset.action;

  switch (action) {
    case 'prev-page':
      goToPrevPage();
      break;
    case 'next-page':
      goToNextPage();
      break;
    case 'zoom-in':
      zoomIn();
      break;
    case 'zoom-out':
      zoomOut();
      break;
    case 'clear-selection':
      clearSelection();
      break;
    case 'extract':
      extractData();
      break;
  }
});

// Selection drawing events
document.body.addEventListener('mousedown', function (event) {
  if (!overlayCanvas) {
    return;
  }
  if (event.target !== overlayCanvas) {
    return;
  }

  isDrawing = true;
  selectionStart = getMousePosition(event);
});

document.body.addEventListener('mousemove', function (event) {
  if (!isDrawing || !overlayCanvas) {
    return;
  }

  const currentPos = getMousePosition(event);
  drawSelectionRect(selectionStart, currentPos);
});

document.body.addEventListener('mouseup', function (event) {
  if (!isDrawing) {
    return;
  }

  isDrawing = false;
  const endPos = getMousePosition(event);
  saveSelection(selectionStart, endPos);
});

// Keyboard navigation
document.addEventListener('keydown', function (e) {
  if (!container) {
    return;
  }
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }

  switch (e.key) {
    case 'ArrowLeft':
      goToPrevPage();
      break;
    case 'ArrowRight':
      goToNextPage();
      break;
    case '+':
    case '=':
      zoomIn();
      break;
    case '-':
      zoomOut();
      break;
    case 'Escape':
      clearSelection();
      break;
  }
});

function goToPrevPage() {
  if (currentPage > 1) {
    renderPage(currentPage - 1);
  }
}

function goToNextPage() {
  if (currentPage < totalPages) {
    renderPage(currentPage + 1);
  }
}

function zoomIn() {
  if (zoomIndex < ZOOM_LEVELS.length - 1) {
    zoomIndex++;
    applyZoom();
  }
}

function zoomOut() {
  if (zoomIndex > 0) {
    zoomIndex--;
    applyZoom();
  }
}

function applyZoom() {
  scale = ZOOM_LEVELS[zoomIndex];
  updateZoomLevel();
  renderPage(currentPage);
}

function updatePageInfo() {
  const currentEl = container.querySelector('[data-page-current]');
  const totalEl = container.querySelector('[data-page-total]');
  if (currentEl) {
    currentEl.textContent = currentPage;
  }
  if (totalEl) {
    totalEl.textContent = totalPages;
  }
}

function updateZoomLevel() {
  const zoomEl = container.querySelector('[data-zoom-level]');
  if (zoomEl) {
    zoomEl.textContent = Math.round(scale * 100) + '%';
  }
}

function updateNavButtons() {
  const prevBtn = container.querySelector('[data-action="prev-page"]');
  const nextBtn = container.querySelector('[data-action="next-page"]');
  if (prevBtn) {
    prevBtn.disabled = currentPage <= 1;
  }
  if (nextBtn) {
    nextBtn.disabled = currentPage >= totalPages;
  }
}

function showLoading(show) {
  const el = container.querySelector('[data-loading]');
  if (el) {
    el.hidden = !show;
  }
}

function showError(message) {
  showLoading(false);
  const errorEl = container.querySelector('[data-error]');
  const errorMsgEl = container.querySelector('[data-error-message]');

  if (errorEl) {
    errorEl.hidden = false;
  }
  if (errorMsgEl) {
    errorMsgEl.textContent = message;
  }
}

function getMousePosition(event) {
  const rect = overlayCanvas.getBoundingClientRect();
  const scaleX = overlayCanvas.width / rect.width;
  const scaleY = overlayCanvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function drawSelectionRect(start, end) {
  // Clear previous drawing
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  const rect = calculateRect(start, end);
  drawRect(rect.x, rect.y, rect.width, rect.height);
}

function saveSelection(start, end) {
  const rect = calculateRect(start, end);

  if (rect.width < 10 || rect.height < 10) {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    currentSelection = null;
    return;
  }

  currentSelection = {
    page: currentPage,
    x: (rect.x / overlayCanvas.width) * 100,
    y: (rect.y / overlayCanvas.height) * 100,
    width: (rect.width / overlayCanvas.width) * 100,
    height: (rect.height / overlayCanvas.height) * 100
  };

  console.log('Selection saved:', currentSelection);
  updateSelectionUI();
}

function calculateRect(start, end) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y)
  };
}

function clearSelection() {
  currentSelection = null;
  if (overlayCtx) {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }
  updateSelectionUI();
}

function redrawSelection() {
  if (!currentSelection || !overlayCtx) {
    return;
  }
  if (currentSelection.page !== currentPage) {
    return;
  }

  // Convert percentages back to pixels
  const x = (currentSelection.x / 100) * overlayCanvas.width;
  const y = (currentSelection.y / 100) * overlayCanvas.height;
  const width = (currentSelection.width / 100) * overlayCanvas.width;
  const height = (currentSelection.height / 100) * overlayCanvas.height;

  drawRect(x, y, width, height);
}

function drawRect(x, y, width, height) {
  overlayCtx.strokeStyle = '#3b82f6';
  overlayCtx.lineWidth = 2;
  overlayCtx.strokeRect(x, y, width, height);

  overlayCtx.fillStyle = 'rgba(59, 130, 246, 0.1)';
  overlayCtx.fillRect(x, y, width, height);
}

function extractData() {
  const pdfId = container.dataset.pdfId;
  const baseUrl = container.dataset.baseUrl;
  const previewEl = document.getElementById('extraction-preview');

  const params = {
    pdfId: pdfId
  };

  if (currentSelection) {
    params.page = currentSelection.page;
    params.x = currentSelection.x;
    params.y = currentSelection.y;
    params.width = currentSelection.width;
    params.height = currentSelection.height;
  }

  if (previewEl) {
    previewEl.hidden = false;
    previewEl.innerHTML = '<p>Extracting...</p>';
  }

  htmx.ajax('POST', `${baseUrl}/extract`, {
    target: '#extraction-preview',
    swap: 'innerHTML',
    values: params
  });
}