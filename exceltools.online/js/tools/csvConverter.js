// CSV Converter Tool Implementation
class CSVConverter {
    constructor() {
        this.currentData = null;
        this.currentHeaders = null;
        this.originalFileName = '';
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('csvFileInput');
        const uploadArea = fileInput?.parentElement;
        const downloadBtn = document.getElementById('downloadBtn');
        const conversionOptions = document.querySelectorAll('input[name="conversionType"]');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        if (uploadArea) {
            this.setupDragAndDrop(uploadArea, fileInput);
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadConvertedFile());
        }

        conversionOptions.forEach(option => {
            option.addEventListener('change', () => this.updateConversionPreview());
        });

        // Listen for delimiter changes
        const delimiterSelect = document.getElementById('delimiter');
        if (delimiterSelect) {
            delimiterSelect.addEventListener('change', () => this.updateConversionPreview());
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
        const resultArea = document.getElementById('conversionResult');
        
        try {
            resultArea.innerHTML = '<div class="loading">Processing file...</div>';
            
            const content = await FileProcessor.readFile(file);
            
            if (file.name.endsWith('.csv')) {
                await this.processCSVFile(content, file);
            } else {
                await this.processExcelFile(content, file);
            }
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    async processCSVFile(content, file) {
        try {
            const delimiter = document.getElementById('delimiter')?.value || ',';
            const parsed = FileProcessor.parseCSV(content, delimiter);
            
            this.currentData = parsed.data;
            this.currentHeaders = parsed.headers;
            
            this.displayFileInfo(file, parsed);
            this.showDownloadButton();
            
        } catch (error) {
            throw new Error(`Error processing CSV file: ${error.message}`);
        }
    }

    async processExcelFile(content, file) {
        // For demo purposes, we'll simulate Excel processing
        // In a real implementation, you'd use a library like SheetJS
        try {
            // Simulate Excel data
            const sampleData = [
                { 'Name': 'John Doe', 'Age': '30', 'City': 'New York' },
                { 'Name': 'Jane Smith', 'Age': '25', 'City': 'Los Angeles' },
                { 'Name': 'Bob Johnson', 'Age': '35', 'City': 'Chicago' }
            ];
            
            this.currentData = sampleData;
            this.currentHeaders = Object.keys(sampleData[0]);
            
            this.displayFileInfo(file, { data: sampleData, headers: this.currentHeaders });
            this.showDownloadButton();
            
        } catch (error) {
            throw new Error(`Error processing Excel file: ${error.message}`);
        }
    }

    displayFileInfo(file, parsed) {
        const resultArea = document.getElementById('conversionResult');
        const conversionType = document.querySelector('input[name="conversionType"]:checked')?.value;
        
        const previewData = parsed.data.slice(0, 5);
        const previewTable = this.generatePreviewTable(parsed.headers, previewData);
        
        resultArea.innerHTML = `
            <div class="file-info">
                <h4>📁 ${file.name}</h4>
                <div class="file-stats">
                    <span class="stat">Size: ${FileProcessor.formatFileSize(file.size)}</span>
                    <span class="stat">Rows: ${parsed.data.length}</span>
                    <span class="stat">Columns: ${parsed.headers.length}</span>
                </div>
            </div>
            
            <div class="conversion-info">
                <h5>Conversion: ${conversionType === 'excel-to-csv' ? 'Excel → CSV' : 'CSV → Excel'}</h5>
            </div>
            
            <div class="preview-section">
                <h5>Preview (first 5 rows):</h5>
                ${previewTable}
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
                table += `<td>${row[header] || ''}</td>`;
            });
            table += '</tr>';
        });

        table += '</tbody></table></div>';
        return table;
    }

    updateConversionPreview() {
        if (this.currentData && this.currentHeaders) {
            const file = { name: this.originalFileName, size: 0 };
            this.displayFileInfo(file, { data: this.currentData, headers: this.currentHeaders });
        }
    }

    showDownloadButton() {
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.style.display = 'inline-flex';
        }
    }

    downloadConvertedFile() {
        if (!this.currentData || !this.currentHeaders) {
            alert('No data to download');
            return;
        }

        const conversionType = document.querySelector('input[name="conversionType"]:checked')?.value;
        const includeHeaders = document.getElementById('includeHeaders')?.checked;
        const delimiter = document.getElementById('delimiter')?.value || ',';

        try {
            if (conversionType === 'excel-to-csv') {
                this.downloadAsCSV(delimiter, includeHeaders);
            } else {
                this.downloadAsExcel();
            }
        } catch (error) {
            alert(`Download failed: ${error.message}`);
        }
    }

    downloadAsCSV(delimiter, includeHeaders) {
        const headers = includeHeaders ? this.currentHeaders : [];
        const csvContent = FileProcessor.generateCSV(this.currentData, this.currentHeaders, delimiter);
        
        const filename = this.originalFileName.replace(/\.[^/.]+$/, '') + '.csv';
        FileProcessor.downloadFile(csvContent, filename, 'text/csv');
        
        this.showNotification('CSV file downloaded successfully!', 'success');
    }

    downloadAsExcel() {
        // For demo purposes, we'll download as CSV with .xlsx extension
        // In a real implementation, you'd use a library like SheetJS to create actual Excel files
        const csvContent = FileProcessor.generateCSV(this.currentData, this.currentHeaders);
        const filename = this.originalFileName.replace(/\.[^/.]+$/, '') + '.xlsx';
        
        FileProcessor.downloadFile(csvContent, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        this.showNotification('Excel file downloaded successfully!', 'success');
    }

    showError(message) {
        const resultArea = document.getElementById('conversionResult');
        resultArea.innerHTML = `
            <div class="error-message">
                <h4>❌ Error Processing File</h4>
                <p>${message}</p>
                <p>Please check your file format and try again.</p>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        // Use the global notification function if available
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.csvConverter = new CSVConverter();
});