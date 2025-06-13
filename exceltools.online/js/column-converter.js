// Excel Column Letter ↔ Number Converter
class ExcelColumnConverter {
    constructor() {
        this.lettersInput = null;
        this.numberInput = null;
        this.isUpdating = false;
        
        // Excel limits
        this.MAX_COLUMNS = 16384; // XFD
        this.MIN_COLUMNS = 1; // A
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setDefaultValues();
    }

    setupElements() {
        this.lettersInput = document.getElementById('columnLetters');
        this.numberInput = document.getElementById('columnNumber');
        
        // Result elements
        this.resultLetters = document.getElementById('resultLetters');
        this.resultNumber = document.getElementById('resultNumber');
        this.resultReference = document.getElementById('resultReference');
        this.resultPosition = document.getElementById('resultPosition');
        this.resultBase26 = document.getElementById('resultBase26');
        this.resultMaxRows = document.getElementById('resultMaxRows');
        
        // Error elements
        this.lettersError = document.getElementById('lettersError');
        this.numberError = document.getElementById('numberError');
    }

    setupEventListeners() {
        // Letters input
        this.lettersInput.addEventListener('input', (e) => {
            if (!this.isUpdating) {
                this.handleLettersInput(e);
            }
        });

        // Number input
        this.numberInput.addEventListener('input', (e) => {
            if (!this.isUpdating) {
                this.handleNumberInput(e);
            }
        });

        // Clear errors on focus
        this.lettersInput.addEventListener('focus', () => this.clearError('letters'));
        this.numberInput.addEventListener('focus', () => this.clearError('number'));

        // Prevent invalid characters in letters input
        this.lettersInput.addEventListener('keypress', (e) => {
            const char = e.key.toUpperCase();
            if (!/[A-Z]/.test(char) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                e.preventDefault();
            }
        });

        // Auto-uppercase letters
        this.lettersInput.addEventListener('input', (e) => {
            const cursorPos = e.target.selectionStart;
            e.target.value = e.target.value.toUpperCase();
            e.target.setSelectionRange(cursorPos, cursorPos);
        });
    }

    setDefaultValues() {
        // Set default to column A
        this.lettersInput.value = 'A';
        this.convertLettersToNumber();
    }

    handleLettersInput(event) {
        const value = event.target.value.trim().toUpperCase();
        
        // Clear previous errors
        this.clearError('letters');
        
        if (!value) {
            this.clearResults();
            return;
        }

        if (!this.validateLetters(value)) {
            return;
        }

        this.convertLettersToNumber();
    }

    handleNumberInput(event) {
        const value = parseInt(event.target.value);
        
        // Clear previous errors
        this.clearError('number');
        
        if (isNaN(value) || event.target.value.trim() === '') {
            this.clearResults();
            return;
        }

        if (!this.validateNumber(value)) {
            return;
        }

        this.convertNumberToLetters();
    }

    validateLetters(letters) {
        // Check if contains only A-Z
        if (!/^[A-Z]+$/.test(letters)) {
            this.showError('letters', 'Only letters A-Z are allowed');
            return false;
        }

        // Check length (max 3 characters for XFD)
        if (letters.length > 3) {
            this.showError('letters', 'Maximum 3 letters allowed (A to XFD)');
            return false;
        }

        // Check if it's within Excel's column range
        const number = this.lettersToNumber(letters);
        if (number > this.MAX_COLUMNS) {
            this.showError('letters', `Column ${letters} exceeds Excel limit (max: XFD)`);
            return false;
        }

        return true;
    }

    validateNumber(number) {
        if (number < this.MIN_COLUMNS) {
            this.showError('number', `Column number must be at least ${this.MIN_COLUMNS}`);
            return false;
        }

        if (number > this.MAX_COLUMNS) {
            this.showError('number', `Column number cannot exceed ${this.MAX_COLUMNS} (XFD)`);
            return false;
        }

        return true;
    }

    convertLettersToNumber() {
        const letters = this.lettersInput.value.trim().toUpperCase();
        
        if (!letters || !this.validateLetters(letters)) {
            return;
        }

        try {
            const number = this.lettersToNumber(letters);
            
            this.isUpdating = true;
            this.numberInput.value = number;
            this.isUpdating = false;
            
            this.updateResults(letters, number);
            this.setSuccessState();
            
        } catch (error) {
            this.showError('letters', error.message);
            this.clearResults();
        }
    }

    convertNumberToLetters() {
        const number = parseInt(this.numberInput.value);
        
        if (isNaN(number) || !this.validateNumber(number)) {
            return;
        }

        try {
            const letters = this.numberToLetters(number);
            
            this.isUpdating = true;
            this.lettersInput.value = letters;
            this.isUpdating = false;
            
            this.updateResults(letters, number);
            this.setSuccessState();
            
        } catch (error) {
            this.showError('number', error.message);
            this.clearResults();
        }
    }

    lettersToNumber(letters) {
        let result = 0;
        const length = letters.length;
        
        for (let i = 0; i < length; i++) {
            const charCode = letters.charCodeAt(i) - 64; // A=1, B=2, etc.
            result = result * 26 + charCode;
        }
        
        return result;
    }

    numberToLetters(number) {
        let result = '';
        
        while (number > 0) {
            number--; // Adjust for 1-based indexing
            result = String.fromCharCode(65 + (number % 26)) + result;
            number = Math.floor(number / 26);
        }
        
        return result;
    }

    updateResults(letters, number) {
        // Update result displays
        this.resultLetters.textContent = letters;
        this.resultNumber.textContent = number.toLocaleString();
        this.resultReference.textContent = `${letters}1`;
        this.resultPosition.textContent = `${(number - 1).toLocaleString()} columns`;
        
        // Calculate base-26 representation
        const base26 = this.calculateBase26Value(letters);
        this.resultBase26.textContent = base26;
        
        // Max rows is constant for modern Excel
        this.resultMaxRows.textContent = '1,048,576';
    }

    calculateBase26Value(letters) {
        let explanation = '';
        const length = letters.length;
        
        for (let i = 0; i < length; i++) {
            const char = letters[i];
            const value = char.charCodeAt(0) - 64; // A=1, B=2, etc.
            const position = length - i - 1;
            
            if (i > 0) explanation += ' + ';
            
            if (position > 0) {
                explanation += `${char}(${value}) × 26^${position}`;
            } else {
                explanation += `${char}(${value})`;
            }
        }
        
        return explanation;
    }

    clearResults() {
        this.resultLetters.textContent = '-';
        this.resultNumber.textContent = '-';
        this.resultReference.textContent = '-';
        this.resultPosition.textContent = '-';
        this.resultBase26.textContent = '-';
    }

    setSuccessState() {
        this.lettersInput.classList.remove('error');
        this.lettersInput.classList.add('success');
        this.numberInput.classList.remove('error');
        this.numberInput.classList.add('success');
    }

    showError(type, message) {
        const errorElement = type === 'letters' ? this.lettersError : this.numberError;
        const inputElement = type === 'letters' ? this.lettersInput : this.numberInput;
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        inputElement.classList.add('error');
        inputElement.classList.remove('success');
    }

    clearError(type) {
        const errorElement = type === 'letters' ? this.lettersError : this.numberError;
        const inputElement = type === 'letters' ? this.lettersInput : this.numberInput;
        
        errorElement.style.display = 'none';
        inputElement.classList.remove('error');
    }
}

// Global functions for examples and copy functionality
function setExample(letters, number) {
    const converter = window.excelColumnConverter;
    if (converter) {
        converter.isUpdating = true;
        converter.lettersInput.value = letters;
        converter.numberInput.value = number;
        converter.isUpdating = false;
        converter.updateResults(letters, number);
        converter.setSuccessState();
    }
}

function copyResults() {
    const results = {
        'Column Letters': document.getElementById('resultLetters').textContent,
        'Column Number': document.getElementById('resultNumber').textContent,
        'Excel Reference': document.getElementById('resultReference').textContent,
        'Position from A': document.getElementById('resultPosition').textContent,
        'Base-26 Value': document.getElementById('resultBase26').textContent,
        'Max Rows (Excel)': document.getElementById('resultMaxRows').textContent
    };
    
    let copyText = 'Excel Column Conversion Results:\n';
    copyText += '==================================\n';
    
    Object.entries(results).forEach(([key, value]) => {
        copyText += `${key}: ${value}\n`;
    });
    
    copyText += `\nGenerated: ${new Date().toLocaleString()}\n`;
    
    navigator.clipboard.writeText(copyText).then(() => {
        showNotification('Results copied to clipboard!', 'success');
        
        // Visual feedback
        const btn = document.querySelector('.copy-results-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        btn.style.background = 'var(--status-success)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    }).catch(() => {
        showNotification('Failed to copy results', 'error');
    });
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
    window.excelColumnConverter = new ExcelColumnConverter();
});