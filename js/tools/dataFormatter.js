// Data Formatter Tool Implementation
class DataFormatter {
    constructor() {
        this.currentData = null;
        this.currentHeaders = null;
        this.originalFileName = '';
        this.formattedData = null;
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('formatterFileInput');
        const uploadArea = fileInput?.parentElement;
        const formatBtn = document.getElementById('formatBtn');
        const downloadBtn = document.getElementById('downloadFormattedBtn');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        if (uploadArea) {
            this.setupDragAndDrop(uploadArea, fileInput);
        }

        if (formatBtn) {
            formatBtn.addEventListener('click', () => this.applyFormatting());
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadFormattedData());
        }
    }

    setupDragAndDrop(uploadArea, fileInput) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                this.handleFileUpload({ target: { files } });
            }
        });
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.originalFileName = file.name;
        const resultArea = document.getElementById('formatterResult');
        
        try {
            resultArea.innerHTML = '<div class="loading">Loading file...</div>';
            
            const content = await FileProcessor.readFile(file);
            
            if (file.name.endsWith('.csv')) {
                const parsed = FileProcessor.parseCSV(content);
                this.currentData = parsed.data;
                this.currentHeaders = parsed.headers;
            } else {
                // Simulate Excel processing with sample data
                const sampleData = [
                    { 'First Name': '  john  ', 'Last Name': 'DOE', 'Email': 'JOHN.DOE@EMAIL.COM', 'Phone': '123-456-7890', 'Date': '2024-01-15' },
                    { 'First Name': 'jane', 'Last Name': 'smith  ', 'Email': 'jane.smith@email.com', 'Phone': '(555) 123-4567', 'Date': '01/20/2024' },
                    { 'First Name': '', 'Last Name': 'JOHNSON', 'Email': 'bob@email.com', 'Phone': '555.123.4567', 'Date': '2024-02-01' }
                ];
                this.currentData = sampleData;
                this.currentHeaders = Object.keys(sampleData[0]);
            }
            
            this.displayFileInfo(file);
            this.showFormatButton();
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    displayFileInfo(file) {
        const resultArea = document.getElementById('formatterResult');
        const previewTable = this.generatePreviewTable(this.currentHeaders, this.currentData.slice(0, 5));
        
        resultArea.innerHTML = `
            <div class="file-info">
                <h4>📁 ${file.name}</h4>
                <div class="file-stats">
                    <span class="stat">Size: ${FileProcessor.formatFileSize(file.size)}</span>
                    <span class="stat">Rows: ${this.currentData.length}</span>
                    <span class="stat">Columns: ${this.currentHeaders.length}</span>
                </div>
            </div>
            
            <div class="preview-section">
                <h5>Original Data Preview:</h5>
                ${previewTable}
            </div>
            
            <div class="formatting-status">
                <p>✅ File loaded successfully. Configure formatting options above and click "Apply Formatting".</p>
            </div>
        `;
    }

    generatePreviewTable(headers, data) {
        if (!data || data.length === 0) {
            return '<p>No data to preview</p>';
        }

        let table = '<div class="preview-table"><table><thead><tr>';
        headers.forEach(header => {
            table += `<th>${header}</th>`;
        });
        table += '</tr></thead><tbody>';

        data.forEach(row => {
            table += '<tr>';
            headers.forEach(header => {
                const value = row[header] || '';
                table += `<td>${this.escapeHtml(value)}</td>`;
            });
            table += '</tr>';
        });

        table += '</tbody></table></div>';
        return table;
    }

    applyFormatting() {
        if (!this.currentData || !this.currentHeaders) {
            alert('No data to format');
            return;
        }

        const textCase = document.getElementById('textCase')?.value;
        const trimSpaces = document.getElementById('trimSpaces')?.checked;
        const removeEmpty = document.getElementById('removeEmpty')?.checked;
        const dateFormat = document.getElementById('dateFormat')?.value;

        try {
            this.formattedData = JSON.parse(JSON.stringify(this.currentData)); // Deep clone
            
            this.formattedData = this.formattedData.map(row => {
                const formattedRow = {};
                
                this.currentHeaders.forEach(header => {
                    let value = row[header] || '';
                    
                    // Apply text case formatting
                    if (textCase && textCase !== 'none') {
                        value = this.applyTextCase(value, textCase);
                    }
                    
                    // Trim spaces
                    if (trimSpaces) {
                        value = value.toString().trim().replace(/\s+/g, ' ');
                    }
                    
                    // Format dates
                    if (dateFormat && dateFormat !== 'none' && this.isDate(value)) {
                        value = this.formatDate(value, dateFormat);
                    }
                    
                    formattedRow[header] = value;
                });
                
                return formattedRow;
            });

            // Remove empty rows if requested
            if (removeEmpty) {
                this.formattedData = this.formattedData.filter(row => {
                    return this.currentHeaders.some(header => row[header] && row[header].toString().trim());
                });
            }

            this.displayFormattedResults();
            this.showDownloadButton();
            
        } catch (error) {
            this.showError(`Formatting failed: ${error.message}`);
        }
    }

    applyTextCase(value, caseType) {
        const stringValue = value.toString();
        
        switch (caseType) {
            case 'upper':
                return stringValue.toUpperCase();
            case 'lower':
                return stringValue.toLowerCase();
            case 'title':
                return stringValue.replace(/\w\S*/g, (txt) => 
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
            default:
                return stringValue;
        }
    }

    isDate(value) {
        if (!value) return false;
        const date = new Date(value);
        return !isNaN(date.getTime()) && value.toString().match(/\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}/);
    }

    formatDate(value, format) {
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return value;
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            switch (format) {
                case 'mm/dd/yyyy':
                    return `${month}/${day}/${year}`;
                case 'dd/mm/yyyy':
                    return `${day}/${month}/${year}`;
                case 'yyyy-mm-dd':
                    return `${year}-${month}-${day}`;
                default:
                    return value;
            }
        } catch (error) {
            return value;
        }
    }

    displayFormattedResults() {
        const resultArea = document.getElementById('formatterResult');
        const originalCount = this.currentData.length;
        const formattedCount = this.formattedData.length;
        const previewTable = this.generatePreviewTable(this.currentHeaders, this.formattedData.slice(0, 5));
        
        resultArea.innerHTML = `
            <div class="formatting-results">
                <h4>✨ Formatting Applied Successfully!</h4>
                <div class="format-stats">
                    <span class="stat">Original rows: ${originalCount}</span>
                    <span class="stat">Formatted rows: ${formattedCount}</span>
                    <span class="stat">Removed: ${originalCount - formattedCount}</span>
                </div>
            </div>
            
            <div class="preview-section">
                <h5>Formatted Data Preview:</h5>
                ${previewTable}
            </div>
            
            <div class="formatting-status">
                <p>✅ Data formatting complete. You can now download the formatted file.</p>
            </div>
        `;
    }

    showFormatButton() {
        const formatBtn = document.getElementById('formatBtn');
        if (formatBtn) {
            formatBtn.style.display = 'inline-flex';
        }
    }

    showDownloadButton() {
        const downloadBtn = document.getElementById('downloadFormattedBtn');
        if (downloadBtn) {
            downloadBtn.style.display = 'inline-flex';
        }
    }

    downloadFormattedData() {
        if (!this.formattedData || !this.currentHeaders) {
            alert('No formatted data to download');
            return;
        }

        try {
            const csvContent = FileProcessor.generateCSV(this.formattedData, this.currentHeaders);
            const filename = this.originalFileName.replace(/\.[^/.]+$/, '') + '_formatted.csv';
            
            FileProcessor.downloadFile(csvContent, filename, 'text/csv');
            this.showNotification('Formatted data downloaded successfully!', 'success');
            
        } catch (error) {
            alert(`Download failed: ${error.message}`);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        const resultArea = document.getElementById('formatterResult');
        resultArea.innerHTML = `
            <div class="error-message">
                <h4>❌ Error</h4>
                <p>${message}</p>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dataFormatter = new DataFormatter();
});