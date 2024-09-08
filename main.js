// Constants and utility functions
const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);
const FIRST_CHAR_CODE = 65;
const times = (length) => Array.from({ length }, (_, i) => i);
const getColumn = (i) => String.fromCharCode(FIRST_CHAR_CODE + i);

// Grid size
const ROWS = 50;
const COLUMNS = 26;

// State management
let STATE = [];
let selectedCells = [];
let copiedCells = null;

// Initialize grid and state
function initializeGrid() {
  STATE = times(COLUMNS).map(() =>
    times(ROWS).map(() => ({
      value: "",
      format: "text",
      alignment: "left",
      fontSize: 11,
    }))
  );
}

// Render spreadsheet
function renderSpreadSheet() {
  const headerHTML = `
        <tr>
            <th></th>
            ${times(COLUMNS)
              .map((i) => `<th>${getColumn(i)}</th>`)
              .join("")}
        </tr>
    `;

  const bodyHTML = times(ROWS)
    .map(
      (row) => `
        <tr>
            <td>${row + 1}</td>
            ${times(COLUMNS)
              .map(
                (column) => `
                <td data-x="${column}" data-y="${row}">
                    <span style="
                        text-align: ${STATE[column][row].alignment};
                        font-size: ${STATE[column][row].fontSize}px;
                    ">${formatValue(STATE[column][row].value, STATE[column][row].format)}</span>
                    <input type="text" value="${STATE[column][row].value}" />
                </td>
            `
              )
              .join("")}
        </tr>
    `
    )
    .join("");

  $("thead").innerHTML = headerHTML;
  $("tbody").innerHTML = bodyHTML;
}
// Format value based on cell format
function formatValue(value, format) {
  if (!value) return "";
  switch (format) {
    case "number":
      return Number(value).toLocaleString();
    case "currency":
      return Number(value).toLocaleString("en-US", { style: "currency", currency: "USD" });
    case "percentage":
      return `${(Number(value) * 100).toFixed(2)}%`;
    case "date":
      return new Date(value).toLocaleDateString();
    default:
      return value.toString();
  }
}

// Update cell
function updateCell(x, y, props) {
  STATE[x][y] = { ...STATE[x][y], ...props };
  renderSpreadSheet();
}

// Select cells
function selectCells(start, end) {
  selectedCells = [];
  for (let x = Math.min(start.x, end.x); x <= Math.max(start.x, end.x); x++) {
    for (let y = Math.min(start.y, end.y); y <= Math.max(start.y, end.y); y++) {
      selectedCells.push({ x, y });
      $(`td[data-x="${x}"][data-y="${y}"]`).classList.add("selected");
    }
  }
}

// Copy selected cells
function copyCells() {
  copiedCells = selectedCells.map(({ x, y }) => ({ ...STATE[x][y] }));
}

// Paste copied cells
function pasteCells(startX, startY) {
  if (!copiedCells) return;
  copiedCells.forEach((cell, index) => {
    const x = startX + (index % COLUMNS);
    const y = startY + Math.floor(index / COLUMNS);
    if (x < COLUMNS && y < ROWS) {
      updateCell(x, y, cell);
    }
  });
}

// Event listeners
$("tbody").addEventListener("mousedown", handleSelectionStart);
$("tbody").addEventListener("mousemove", handleSelectionMove);
$("tbody").addEventListener("mouseup", handleSelectionEnd);
$("tbody").addEventListener("dblclick", handleCellEdit);
document.addEventListener("keydown", handleKeyDown);

// Toolbar event listeners
$("#cell-format").addEventListener("change", (e) => {
  selectedCells.forEach(({ x, y }) => updateCell(x, y, { format: e.target.value }));
});

$("#cell-align").addEventListener("change", (e) => {
  selectedCells.forEach(({ x, y }) => updateCell(x, y, { alignment: e.target.value }));
});

$("#font-size").addEventListener("change", (e) => {
  selectedCells.forEach(({ x, y }) => updateCell(x, y, { fontSize: parseInt(e.target.value) }));
});

// Selection handling
let isSelecting = false;
let selectionStart = null;

function handleSelectionStart(event) {
  const td = event.target.closest("td");
  if (!td) return;
  isSelecting = true;
  selectionStart = getCellCoordinates(td);
  selectCells(selectionStart, selectionStart);
}

function handleSelectionMove(event) {
  if (!isSelecting) return;
  const td = event.target.closest("td");
  if (!td) return;
  selectCells(selectionStart, getCellCoordinates(td));
}

function handleSelectionEnd() {
  isSelecting = false;
}

function getCellCoordinates(td) {
  return {
    x: parseInt(td.dataset.x),
    y: parseInt(td.dataset.y),
  };
}

function handleCellEdit(event) {
  const td = event.target.closest("td");
  if (!td) return;
  const input = td.querySelector("input");
  input.style.display = "block";
  input.focus();
}

function handleKeyDown(event) {
  if (event.ctrlKey || event.metaKey) {
    if (event.key === "c") {
      copyCells();
    } else if (event.key === "v") {
      if (selectedCells.length > 0) {
        const { x, y } = selectedCells[0];
        pasteCells(x, y);
      }
    }
  }
}

// Initialize and render
initializeGrid();
renderSpreadSheet();

// Toolbar event listeners
$("#cell-format").addEventListener("change", (e) => {
  selectedCells.forEach(({ x, y }) => updateCell(x, y, { format: e.target.value }));
});

$("#cell-align").addEventListener("change", (e) => {
  selectedCells.forEach(({ x, y }) => updateCell(x, y, { alignment: e.target.value }));
});

$("#font-size").addEventListener("change", (e) => {
  selectedCells.forEach(({ x, y }) => updateCell(x, y, { fontSize: parseInt(e.target.value) }));
});
