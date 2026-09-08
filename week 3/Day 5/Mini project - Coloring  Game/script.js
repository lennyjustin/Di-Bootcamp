// ===== COLOR PALETTE =====
const colors = [
    '#FF6B6B',  // Red
    '#FFA500',  // Orange
    '#FFD93D',  // Yellow
    '#6BCB77',  // Green
    '#4D96FF',  // Blue
    '#9D84B7',  // Purple
    '#FF69B4',  // Pink
    '#00CED1',  // Cyan
    '#FF8C42',  // Dark Orange
    '#000000'   // Black
];

// ===== STATE =====
let selectedColor = colors[0];
let isDrawing = false;

// ===== DOM ELEMENTS =====
const paletteEl = document.getElementById('palette');
const gridEl = document.getElementById('grid');
const clearBtn = document.getElementById('clearBtn');

// ===== CREATE COLOR PALETTE (GRID) =====
colors.forEach((color, index) => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color;
    
    // Mark first color as selected
    if (index === 0) {
        swatch.classList.add('selected');
    }
    
    // Handle color selection
    swatch.addEventListener('click', () => {
        // Update selected color
        selectedColor = color;
        
        // Remove 'selected' class from all swatches
        document.querySelectorAll('.color-swatch').forEach(s => {
            s.classList.remove('selected');
        });
        
        // Add 'selected' class to clicked swatch
        swatch.classList.add('selected');
    });
    
    paletteEl.appendChild(swatch);
});

// ===== CREATE DRAWING GRID (10x10) =====
const gridSize = 10;

for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    
    // ===== DRAWING EVENT HANDLERS =====
    
    // Start drawing when mouse is pressed
    cell.addEventListener('mousedown', (e) => {
        isDrawing = true;
        cell.style.backgroundColor = selectedColor;
    });
    
    // Continue drawing when dragging over cells
    cell.addEventListener('mouseover', (e) => {
        if (isDrawing) {
            cell.style.backgroundColor = selectedColor;
        }
    });
    
    gridEl.appendChild(cell);
}

// Stop drawing when mouse is released anywhere on page
window.addEventListener('mouseup', () => {
    isDrawing = false;
});

// ===== CLEAR CANVAS =====
clearBtn.addEventListener('click', () => {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.style.backgroundColor = 'white';
    });
});
