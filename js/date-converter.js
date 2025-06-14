// Excel Date Serial ↔ Human Date Converter
class ExcelDateConverter {
    constructor() {
        this.serialInput = null;
        this.dateInput = null;
        this.dateSystemRadios = null;
        this.isUpdating = false;
        
        // Excel date system constants
        this.EXCEL_1900_EPOCH = new Date(1899, 11, 30); // December 30, 1899 (Excel's epoch)
        this.EXCEL_1904_EPOCH = new Date(1904, 0, 1);   // January 1, 1904
        this.LEAP_YEAR_BUG_DATE = new Date(1900, 1, 29); // February 29, 1900 (doesn't exist)
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setDefaultValues();
    }

    setupElements() {
        this.serialInput = document.getElementById('serialInput');
        this.dateInput = document.getElementById('dateInput');
        this.dateSystemRadios = document.querySelectorAll('input[name="dateSystem"]');
        
        // Result elements
        this.resultSerial = document.getElementById('resultSerial');
        this.resultDate = document.getElementById('resultDate');
        this.resultDayOfWeek = document.getElementById('resultDayOfWeek');
        this.resultDaysFromEpoch = document.getElementById('resultDaysFromEpoch');
        this.resultFormula = document.getElementById('resultFormula');
        this.resultISO = document.getElementById('resultISO');
        
        // Error elements
        this.serialError = document.getElementById('serialError');
        this.dateError = document.getElementById('dateError');
    }

    setupEventListeners() {
        // Serial number input
        this.serialInput.addEventListener('input', () => {
            if (!this.isUpdating) {
                this.convertSerialToDate();
            }
        });

        // Date input
        this.dateInput.addEventListener('change', () => {
            if (!this.isUpdating) {
                this.convertDateToSerial();
            }
        });

        // Date system change
        this.dateSystemRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateConversion();
            });
        });

        // Clear errors on focus
        this.serialInput.addEventListener('focus', () => this.clearError('serial'));
        this.dateInput.addEventListener('focus', () => this.clearError('date'));
    }

    setDefaultValues() {
        // Set today's date as default
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        this.dateInput.value = todayString;
        this.convertDateToSerial();
    }

    getSelectedDateSystem() {
        const selected = document.querySelector('input[name="dateSystem"]:checked');
        return selected ? selected.value : '1900';
    }

    convertSerialToDate() {
        const serialValue = parseFloat(this.serialInput.value);
        
        // Clear previous errors
        this.clearError('serial');
        
        // Validate input
        if (isNaN(serialValue) || this.serialInput.value.trim() === '') {
            this.clearResults();
            return;
        }

        if (!this.validateSerialNumber(serialValue)) {
            return;
        }

        try {
            const date = this.serialToDate(serialValue);
            
            this.isUpdating = true;
            this.dateInput.value = this.formatDateForInput(date);
            this.isUpdating = false;
            
            this.updateResults(serialValue, date);
            
        } catch (error) {
            this.showError('serial', error.message);
            this.clearResults();
        }
    }

    convertDateToSerial() {
        const dateValue = this.dateInput.value;
        
        // Clear previous errors
        this.clearError('date');
        
        if (!dateValue) {
            this.clearResults();
            return;
        }

        try {
            const date = new Date(dateValue + 'T00:00:00');
            
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date format');
            }

            if (!this.validateDate(date)) {
                return;
            }

            const serialValue = this.dateToSerial(date);
            
            this.isUpdating = true;
            this.serialInput.value = serialValue.toString();
            this.isUpdating = false;
            
            this.updateResults(serialValue, date);
            
        } catch (error) {
            this.showError('date', error.message);
            this.clearResults();
        }
    }

    updateConversion() {
        // Re-convert based on current input
        if (this.serialInput.value && !isNaN(parseFloat(this.serialInput.value))) {
            this.convertSerialToDate();
        } else if (this.dateInput.value) {
            this.convertDateToSerial();
        }
    }

    serialToDate(serialNumber) {
        const dateSystem = this.getSelectedDateSystem();
        let date;
        
        if (dateSystem === '1900') {
            // Excel 1900 system
            date = new Date(this.EXCEL_1900_EPOCH);
            
            // Handle the leap year bug (Excel treats 1900 as a leap year)
            if (serialNumber >= 60) {
                // After February 28, 1900, subtract 1 day to account for the bug
                date.setDate(date.getDate() + serialNumber - 1);
            } else {
                date.setDate(date.getDate() + serialNumber);
            }
        } else {
            // Excel 1904 system
            date = new Date(this.EXCEL_1904_EPOCH);
            date.setDate(date.getDate() + serialNumber);
        }
        
        return date;
    }

    dateToSerial(date) {
        const dateSystem = this.getSelectedDateSystem();
        let serialNumber;
        
        if (dateSystem === '1900') {
            // Excel 1900 system
            const diffTime = date.getTime() - this.EXCEL_1900_EPOCH.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            // Handle the leap year bug
            if (date >= new Date(1900, 2, 1)) { // March 1, 1900 or later
                serialNumber = diffDays + 1; // Add 1 for the non-existent Feb 29, 1900
            } else {
                serialNumber = diffDays;
            }
        } else {
            // Excel 1904 system
            const diffTime = date.getTime() - this.EXCEL_1904_EPOCH.getTime();
            serialNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
        
        return serialNumber;
    }

    validateSerialNumber(serialNumber) {
        const dateSystem = this.getSelectedDateSystem();
        const minSerial = dateSystem === '1900' ? 1 : 0;
        const maxSerial = dateSystem === '1900' ? 2958465 : 2957003;
        
        if (serialNumber < minSerial) {
            this.showError('serial', `Serial number must be at least ${minSerial} for ${dateSystem} system`);
            return false;
        }
        
        if (serialNumber > maxSerial) {
            this.showError('serial', `Serial number cannot exceed ${maxSerial} for ${dateSystem} system`);
            return false;
        }
        
        return true;
    }

    validateDate(date) {
        const dateSystem = this.getSelectedDateSystem();
        const minDate = dateSystem === '1900' ? new Date(1900, 0, 1) : new Date(1904, 0, 1);
        const maxDate = new Date(9999, 11, 31);
        
        if (date < minDate) {
            this.showError('date', `Date must be ${minDate.toLocaleDateString()} or later for ${dateSystem} system`);
            return false;
        }
        
        if (date > maxDate) {
            this.showError('date', 'Date cannot exceed December 31, 9999');
            return false;
        }
        
        return true;
    }

    updateResults(serialNumber, date) {
        const dateSystem = this.getSelectedDateSystem();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        // Update result displays
        this.resultSerial.textContent = serialNumber.toString();
        this.resultDate.textContent = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        this.resultDayOfWeek.textContent = dayNames[date.getDay()];
        
        // Calculate days from epoch
        const epoch = dateSystem === '1900' ? this.EXCEL_1900_EPOCH : this.EXCEL_1904_EPOCH;
        const daysFromEpoch = Math.floor((date.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
        this.resultDaysFromEpoch.textContent = daysFromEpoch.toString();
        
        // Generate Excel formula
        const formula = `=DATE(${date.getFullYear()},${date.getMonth() + 1},${date.getDate()})`;
        this.resultFormula.textContent = formula;
        
        // ISO format
        this.resultISO.textContent = date.toISOString().split('T')[0];
    }

    clearResults() {
        this.resultSerial.textContent = '-';
        this.resultDate.textContent = '-';
        this.resultDayOfWeek.textContent = '-';
        this.resultDaysFromEpoch.textContent = '-';
        this.resultFormula.textContent = '-';
        this.resultISO.textContent = '-';
    }

    showError(type, message) {
        const errorElement = type === 'serial' ? this.serialError : this.dateError;
        const inputElement = type === 'serial' ? this.serialInput : this.dateInput;
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        inputElement.classList.add('error');
    }

    clearError(type) {
        const errorElement = type === 'serial' ? this.serialError : this.dateError;
        const inputElement = type === 'serial' ? this.serialInput : this.dateInput;
        
        errorElement.style.display = 'none';
        inputElement.classList.remove('error');
    }

    formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// Global functions for examples and copy functionality
function setExample(serial, dateStr) {
    const converter = window.excelDateConverter;
    if (converter) {
        converter.isUpdating = true;
        converter.serialInput.value = serial.toString();
        converter.dateInput.value = dateStr;
        converter.isUpdating = false;
        converter.convertSerialToDate();
    }
}

function copyResults() {
    const results = {
        'Serial Number': document.getElementById('resultSerial').textContent,
        'Human Date': document.getElementById('resultDate').textContent,
        'Day of Week': document.getElementById('resultDayOfWeek').textContent,
        'Days from Epoch': document.getElementById('resultDaysFromEpoch').textContent,
        'Excel Formula': document.getElementById('resultFormula').textContent,
        'ISO Format': document.getElementById('resultISO').textContent
    };
    
    let copyText = 'Excel Date Conversion Results:\n';
    copyText += '================================\n';
    
    Object.entries(results).forEach(([key, value]) => {
        copyText += `${key}: ${value}\n`;
    });
    
    copyText += `\nDate System: ${document.querySelector('input[name="dateSystem"]:checked').value}\n`;
    copyText += `Generated: ${new Date().toLocaleString()}\n`;
    
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
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: var(--status-${type === 'success' ? 'success' : type === 'error' ? 'error' : 'info'});
        color: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
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
    window.excelDateConverter = new ExcelDateConverter();
});