// Excel Range → Cell List Converter
class ExcelRangeConverter {
    constructor() {
        this.rangeInput = null;
        this.cellListOutput = null;
        this.resultsSection = null;
        
        // Excel limits
        this.MAX_COLUMNS = 16384; // XFD
        this.MAX_ROWS = 1048576;
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
    }

    setupElements() {
        this.rangeInput = document.getElementById('rangeInput');
        this.cellListOutput = document.getElementById('cellListOutput');
        this.resultsSection = document.getElementById('resultsSection');
        
        // Result elements
        this.cellCount = document.getElementById('cellCount');
        this.rangeSize = document.getElementById('rangeSize');
        this.rangeType = document.getElementById('rangeType');
        
        // Error elements
        this.rangeError = document.getElementById('rangeError');
    }

    setupEventListeners() {
        // Real-time validation on input
        this.rangeInput.addEventListener('input', () => {
            this.validateRange();
        });

        // Clear errors on focus
        this.rangeInput.addEventListener('focus', () => {
            this.clearError();
        });

        // Auto-uppercase range input
        this.rangeInput.addEventListener('input', (e) => {
            const cursorPos = e.target.selectionStart;
            e.target.value = e.target.value.toUpperCase();
            e.target.setSelectionRange(cursorPos, cursorPos);
        });

        // Option change listeners
        const outputOptions = document.querySelectorAll('input[name="outputFormat"]');
        outputOptions.forEach(option => {
            option.addEventListener('change', () => {
                if (this.cellListOutput.value) {
                    this.convertRange();
                }
            });
        });

        const checkboxOptions = ['includeSheetName', 'absoluteReferences'];
        checkboxOptions.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    if (this.cellListOutput.value) {
                        this.convertRange();
                    }
                });
            }
        });

        const maxCellsSelect = document.getElementById('maxCells');
        if (maxCellsSelect) {
            maxCellsSelect.addEventListener('change', () => {
                if (this.cellListOutput.value) {
                    this.convertRange();
                }
            });
        }
    }

    validateRange() {
        const range = this.rangeInput.value.trim().toUpperCase();
        
        // Clear previous states
        this.clearError();
        
        if (!range) {
            this.hideResults();
            return true;
        }

        try {
            this.parseRange(range);
            this.setSuccessState();
            return true;
        } catch (error) {
            this.showError(error.message);
            this.setErrorState();
            return false;
        }
    }

    parseRange(rangeStr) {
        // Remove any sheet name prefix (e.g., "Sheet1!A1:C3" -> "A1:C3")
        const cleanRange = rangeStr.includes('!') ? rangeStr.split('!')[1] : rangeStr;
        
        // Handle different range formats
        if (cleanRange.includes(':')) {
            return this.parseRangeWithColon(cleanRange);
        } else {
            return this.parseSingleCell(cleanRange);
        }
    }

    parseRangeWithColon(rangeStr) {
        const parts = rangeStr.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid range format. Use format like A1:C3');
        }

        const [start, end] = parts;
        
        // Handle entire column/row references
        if (this.isColumnReference(start) && this.isColumnReference(end)) {
            return this.parseColumnRange(start, end);
        }
        
        if (this.isRowReference(start) && this.isRowReference(end)) {
            return this.parseRowRange(start, end);
        }
        
        // Handle mixed references (e.g., A1:C, 1:C3)
        if (this.isColumnReference(start) || this.isColumnReference(end) ||
            this.isRowReference(start) || this.isRowReference(end)) {
            return this.parseMixedRange(start, end);
        }
        
        // Regular cell range
        return this.parseCellRange(start, end);
    }

    parseSingleCell(cellStr) {
        const cell = this.parseCell(cellStr);
        return {
            type: 'single',
            startCol: cell.col,
            endCol: cell.col,
            startRow: cell.row,
            endRow: cell.row,
            totalCells: 1
        };
    }

    parseCellRange(startStr, endStr) {
        const startCell = this.parseCell(startStr);
        const endCell = this.parseCell(endStr);
        
        if (startCell.col > endCell.col || startCell.row > endCell.row) {
            throw new Error('Invalid range: start cell must be before end cell');
        }
        
        const cols = endCell.col - startCell.col + 1;
        const rows = endCell.row - startCell.row + 1;
        
        return {
            type: 'range',
            startCol: startCell.col,
            endCol: endCell.col,
            startRow: startCell.row,
            endRow: endCell.row,
            totalCells: cols * rows
        };
    }

    parseColumnRange(startCol, endCol) {
        const startColNum = this.columnLettersToNumber(startCol);
        const endColNum = this.columnLettersToNumber(endCol);
        
        if (startColNum > endColNum) {
            throw new Error('Invalid column range: start column must be before end column');
        }
        
        const cols = endColNum - startColNum + 1;
        const maxCells = parseInt(document.getElementById('maxCells').value);
        const rows = Math.min(Math.floor(maxCells / cols), this.MAX_ROWS);
        
        return {
            type: 'column',
            startCol: startColNum,
            endCol: endColNum,
            startRow: 1,
            endRow: rows,
            totalCells: cols * rows,
            isLimited: rows < this.MAX_ROWS
        };
    }

    parseRowRange(startRow, endRow) {
        const startRowNum = parseInt(startRow);
        const endRowNum = parseInt(endRow);
        
        if (startRowNum > endRowNum) {
            throw new Error('Invalid row range: start row must be before end row');
        }
        
        const rows = endRowNum - startRowNum + 1;
        const maxCells = parseInt(document.getElementById('maxCells').value);
        const cols = Math.min(Math.floor(maxCells / rows), this.MAX_COLUMNS);
        
        return {
            type: 'row',
            startCol: 1,
            endCol: cols,
            startRow: startRowNum,
            endRow: endRowNum,
            totalCells: cols * rows,
            isLimited: cols < this.MAX_COLUMNS
        };
    }

    parseMixedRange(start, end) {
        // Handle cases like A1:C, 1:C3, A:A3, etc.
        let startCell, endCell;
        
        if (this.isColumnReference(start)) {
            startCell = { col: this.columnLettersToNumber(start), row: 1 };
        } else if (this.isRowReference(start)) {
            startCell = { col: 1, row: parseInt(start) };
        } else {
            startCell = this.parseCell(start);
        }
        
        if (this.isColumnReference(end)) {
            endCell = { col: this.columnLettersToNumber(end), row: this.MAX_ROWS };
        } else if (this.isRowReference(end)) {
            endCell = { col: this.MAX_COLUMNS, row: parseInt(end) };
        } else {
            endCell = this.parseCell(end);
        }
        
        // Limit the range to prevent excessive cell generation
        const maxCells = parseInt(document.getElementById('maxCells').value);
        const cols = endCell.col - startCell.col + 1;
        const rows = endCell.row - startCell.row + 1;
        const totalCells = cols * rows;
        
        if (totalCells > maxCells) {
            // Proportionally reduce the range
            const ratio = Math.sqrt(maxCells / totalCells);
            endCell.col = Math.min(endCell.col, startCell.col + Math.floor(cols * ratio) - 1);
            endCell.row = Math.min(endCell.row, startCell.row + Math.floor(rows * ratio) - 1);
        }
        
        return {
            type: 'mixed',
            startCol: startCell.col,
            endCol: endCell.col,
            startRow: startCell.row,
            endRow: endCell.row,
            totalCells: (endCell.col - startCell.col + 1) * (endCell.row - startCell.row + 1),
            isLimited: totalCells > maxCells
        };
    }

    parseCell(cellStr) {
        // Remove $ signs for absolute references
        const cleanCell = cellStr.replace(/\$/g, '');
        
        // Match column letters and row number
        const match = cleanCell.match(/^([A-Z]+)(\d+)$/);
        if (!match) {
            throw new Error(`Invalid cell reference: ${cellStr}`);
        }
        
        const [, colStr, rowStr] = match;
        const col = this.columnLettersToNumber(colStr);
        const row = parseInt(rowStr);
        
        if (col > this.MAX_COLUMNS) {
            throw new Error(`Column ${colStr} exceeds Excel limit (max: XFD)`);
        }
        
        if (row > this.MAX_ROWS || row < 1) {
            throw new Error(`Row ${row} is out of valid range (1-${this.MAX_ROWS})`);
        }
        
        return { col, row };
    }

    isColumnReference(str) {
        return /^[A-Z]+$/.test(str);
    }

    isRowReference(str) {
        return /^\d+$/.test(str);
    }

    columnLettersToNumber(letters) {
        let result = 0;
        for (let i = 0; i < letters.length; i++) {
            result = result * 26 + (letters.charCodeAt(i) - 64);
        }
        return result;
    }

    numberToColumnLetters(number) {
        let result = '';
        while (number > 0) {
            number--;
            result = String.fromCharCode(65 + (number % 26)) + result;
            number = Math.floor(number / 26);
        }
        return result;
    }

    generateCellList(rangeInfo) {
        const cells = [];
        const maxCells = parseInt(document.getElementById('maxCells').value);
        let cellCount = 0;
        
        for (let row = rangeInfo.startRow; row <= rangeInfo.endRow && cellCount < maxCells; row++) {
            for (let col = rangeInfo.startCol; col <= rangeInfo.endCol && cellCount < maxCells; col++) {
                const cellRef = this.formatCellReference(col, row);
                cells.push(cellRef);
                cellCount++;
            }
        }
        
        return cells;
    }

    formatCellReference(col, row) {
        const includeSheet = document.getElementById('includeSheetName').checked;
        const absolute = document.getElementById('absoluteReferences').checked;
        
        let colStr = this.numberToColumnLetters(col);
        let rowStr = row.toString();
        
        if (absolute) {
            colStr = '$' + colStr;
            rowStr = '$' + rowStr;
        }
        
        let cellRef = colStr + rowStr;
        
        if (includeSheet) {
            cellRef = 'Sheet1!' + cellRef;
        }
        
        return cellRef;
    }

    formatCellList(cells) {
        const format = document.querySelector('input[name="outputFormat"]:checked').value;
        
        switch (format) {
            case 'comma':
                return cells.join(', ');
            case 'newline':
                return cells.join('\n');
            case 'space':
                return cells.join(' ');
            default:
                return cells.join(', ');
        }
    }

    convertRange() {
        if (!this.validateRange()) {
            return;
        }

        const range = this.rangeInput.value.trim().toUpperCase();
        if (!range) {
            this.showError('Please enter a range to convert');
            return;
        }

        try {
            const rangeInfo = this.parseRange(range);
            const maxCells = parseInt(document.getElementById('maxCells').value);
            
            if (rangeInfo.totalCells > maxCells) {
                this.showWarning(`Range contains ${rangeInfo.totalCells.toLocaleString()} cells. Output limited to ${maxCells.toLocaleString()} cells.`);
            }
            
            const cells = this.generateCellList(rangeInfo);
            const formattedList = this.formatCellList(cells);
            
            this.displayResults(formattedList, rangeInfo, cells.length);
            
        } catch (error) {
            this.showError(`Conversion failed: ${error.message}`);
        }
    }

    displayResults(cellList, rangeInfo, actualCellCount) {
        // Update output
        this.cellListOutput.value = cellList;
        
        // Update statistics
        this.cellCount.textContent = `${actualCellCount.toLocaleString()} cells`;
        
        const cols = rangeInfo.endCol - rangeInfo.startCol + 1;
        const rows = rangeInfo.endRow - rangeInfo.startRow + 1;
        this.rangeSize.textContent = `${cols}×${rows}`;
        
        this.rangeType.textContent = this.getRangeTypeDescription(rangeInfo.type);
        
        // Show results section
        this.showResults();
        
        // Show success notification
        showNotification(`Generated ${actualCellCount.toLocaleString()} cell references`, 'success');
    }

    getRangeTypeDescription(type) {
        switch (type) {
            case 'single': return 'Single Cell';
            case 'range': return 'Cell Range';
            case 'column': return 'Column Range';
            case 'row': return 'Row Range';
            case 'mixed': return 'Mixed Range';
            default: return 'Unknown';
        }
    }

    showResults() {
        this.resultsSection.style.display = 'block';
    }

    hideResults() {
        this.resultsSection.style.display = 'none';
    }

    setSuccessState() {
        this.rangeInput.classList.remove('error');
        this.rangeInput.classList.add('success');
    }

    setErrorState() {
        this.rangeInput.classList.remove('success');
        this.rangeInput.classList.add('error');
    }

    showError(message) {
        this.rangeError.textContent = message;
        this.rangeError.style.display = 'block';
        this.setErrorState();
    }

    showWarning(message) {
        showNotification(message, 'warning');
    }

    clearError() {
        this.rangeError.style.display = 'none';
        this.rangeInput.classList.remove('error');
    }
}

// Global functions
function convertRange() {
    if (window.rangeConverter) {
        window.rangeConverter.convertRange();
    }
}

function clearAll() {
    const rangeInput = document.getElementById('rangeInput');
    const cellListOutput = document.getElementById('cellListOutput');
    
    rangeInput.value = '';
    cellListOutput.value = '';
    
    if (window.rangeConverter) {
        window.rangeConverter.clearError();
        window.rangeConverter.hideResults();
        rangeInput.classList.remove('success', 'error');
    }
    
    showNotification('All fields cleared', 'info');
}

function loadExample(range) {
    const rangeInput = document.getElementById('rangeInput');
    rangeInput.value = range;
    
    if (window.rangeConverter) {
        window.rangeConverter.validateRange();
    }
    
    showNotification(`Example range "${range}" loaded`, 'success');
}

function copyCellList() {
    const cellListOutput = document.getElementById('cellListOutput');
    const cellList = cellListOutput.value;
    
    if (!cellList) {
        showNotification('No cell list to copy', 'error');
        return;
    }
    
    navigator.clipboard.writeText(cellList).then(() => {
        showNotification('Cell list copied to clipboard!', 'success');
        
        // Visual feedback
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        btn.style.background = 'var(--status-success)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        cellListOutput.select();
        document.execCommand('copy');
        showNotification('Cell list copied to clipboard!', 'success');
    });
}

function downloadCellList() {
    const cellListOutput = document.getElementById('cellListOutput');
    const cellList = cellListOutput.value;
    
    if (!cellList) {
        showNotification('No cell list to download', 'error');
        return;
    }
    
    const rangeInput = document.getElementById('rangeInput');
    const rangeName = rangeInput.value.replace(/[^A-Z0-9]/g, '_') || 'range';
    const filename = `excel_cells_${rangeName}_${new Date().toISOString().slice(0, 10)}.txt`;
    
    const blob = new Blob([cellList], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Cell list downloaded successfully!', 'success');
}

function selectAllCells() {
    const cellListOutput = document.getElementById('cellListOutput');
    
    if (!cellListOutput.value) {
        showNotification('No cell list to select', 'error');
        return;
    }
    
    cellListOutput.select();
    cellListOutput.setSelectionRange(0, 99999); // For mobile devices
    
    showNotification('All cells selected', 'info');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const colors = {
        success: '#43A047',
        error: '#D32F2F',
        info: '#1E88E5',
        warning: '#FFA000'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize the converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.rangeConverter = new ExcelRangeConverter();
});