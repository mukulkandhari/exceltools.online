// Duplicate Remover Tool Implementation
class DuplicateRemover {
    constructor() {
        this.currentData = null;
        this.currentHeaders = null;
        this.originalFileName = '';
        this.cleanedData = null;
        this.duplicatesFound = [];
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('duplicateFileInput');
        const uploadArea = fileInput?.parentElement;
        const removeBtn = document.getElementById('removeDuplicatesBtn');
        const downloadBtn = document.getElementById('downloadCleanBtn');
        const duplicateMethod = document.querySelectorAll('input[name="duplicateMethod"]');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        if (uploadArea) {
            this.setupDragAndDrop(uploadArea, fileInput);
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => this.removeDuplicates());
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadCleanData());
        }

        duplicateMethod.forEach(radio => {
            radio.addEventListener('change', () => this.toggleKeyColumnSelect());
        });
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
        const resultArea = document.getElementById('duplicateResult');
        
        try {
            resultArea.innerHTML = '<div class="loading">Loading file...</div>';
            
            const content = await FileProcessor.readFile(file);
            
            if (file.name.endsWith('.csv')) {
                const parsed = FileProcessor.parseCSV(content);
                this.currentData = parsed.data;
                this.currentHeaders = parsed.headers;
            } else {
                // Simulate Excel processing with sample data that includes duplicates
                const sampleData = this.generateSampleDataWithDuplicates();
                this.currentData = sampleData;
                this.currentHeaders = Object.keys(sampleData[0]);
            }
            
            this.populateKeyColumnSelect();
            this.displayFileInfo(file);
            this.showRemoveButton();
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    generateSampleDataWithDuplicates() {
        const data = [
            { 'ID': '001', 'Name': 'John Doe', 'Email': 'john@email.com', 'Department': 'Sales' },
            { 'ID': '002', 'Name': 'Jane Smith', 'Email': 'jane@email.com', 'Department': 'Marketing' },
            { 'ID': '003', 'Name': 'Bob Johnson', 'Email': 'bob@email.com', 'Department': 'IT' },
            { 'ID': '001', 'Name': 'John Doe', 'Email': 'john@email.com', 'Department': 'Sales' }, // Exact duplicate
            { 'ID': '004', 'Name': 'Alice Brown', 'Email': 'alice@email.com', 'Department': 'HR' },
            { 'ID': '005', 'Name': 'Charlie Wilson', 'Email': 'charlie@email.com', 'Department': 'Finance' },
            { 'ID': '002', 'Name': 'Jane Smith', 'Email': 'jane.smith@email.com', 'Department': 'Marketing' }, // Duplicate ID, different email
            { 'ID': '006', 'Name': 'Diana Davis', 'Email': 'diana@email.com', 'Department': 'IT' },
            { 'ID': '007', 'Name': 'Eve Miller', 'Email': 'eve@email.com', 'Department': 'Sales' },
            { 'ID': '003', 'Name': 'Bob Johnson', 'Email': 'bob@email.com', 'Department': 'IT' }, // Exact duplicate
        ];
        
        return data;
    }

    populateKeyColumnSelect() {
        const keyColumnSelect = document.getElementById('keyColumn');
        if (keyColumnSelect && this.currentHeaders) {
            keyColumnSelect.innerHTML = '<option value="">Select Key Column</option>';
            this.currentHeaders.forEach(header => {
                keyColumnSelect.innerHTML += `<option value="${header}">${header}</option>`;
            });
        }
    }

    toggleKeyColumnSelect() {
        const keyMethod = document.querySelector('input[name="duplicateMethod"][value="key"]')?.checked;
        const keyColumnSelect = document.getElementById('keyColumn');
        
        if (keyColumnSelect) {
            keyColumnSelect.style.display = keyMethod ? 'inline-block' : 'none';
        }
    }

    displayFileInfo(file) {
        const resultArea = document.getElementById('duplicateResult');
        const previewTable = this.generatePreviewTable(this.currentHeaders, this.currentData.slice(0, 5));
        
        resultArea.innerHTML = `
            <div class="file-info">
                <h4>📁 ${file.name}</h4>
                <div class="file-stats">
                    <span class="stat">Size: ${FileProcessor.formatFileSize(file.size)}</span>
                    <span class="stat">Total Rows: ${this.currentData.length}</span>
                    <span class="stat">Columns: ${this.currentHeaders.length}</span>
                </div>
            </div>
            
            <div class="preview-section">
                <h5>Data Preview:</h5>
                ${previewTable}
            </div>
            
            <div class="duplicate-status">
                <p>✅ File loaded successfully. Configure duplicate detection options above and click "Remove Duplicates".</p>
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
                table += `<td>${this.escapeHtml(row[header] || '')}</td>`;
            });
            table += '</tr>';
        });

        table += '</tbody></table></div>';
        return table;
    }

    removeDuplicates() {
        if (!this.currentData || !this.currentHeaders) {
            alert('No data to process');
            return;
        }

        const duplicateMethod = document.querySelector('input[name="duplicateMethod"]:checked')?.value;
        const caseInsensitive = document.getElementById('caseInsensitive')?.checked;
        const keepFirst = document.getElementById('keepFirst')?.checked;
        const keyColumn = document.getElementById('keyColumn')?.value;

        try {
            if (duplicateMethod === 'exact') {
                this.removeExactDuplicates(caseInsensitive, keepFirst);
            } else if (duplicateMethod === 'key') {
                if (!keyColumn) {
                    alert('Please select a key column for duplicate detection');
                    return;
                }
                this.removeKeyDuplicates(keyColumn, caseInsensitive, keepFirst);
            }

            this.displayResults();
            this.showDownloadButton();

        } catch (error) {
            this.showError(`Duplicate removal failed: ${error.message}`);
        }
    }

    removeExactDuplicates(caseInsensitive, keepFirst) {
        const seen = new Set();
        const duplicates = [];
        const cleaned = [];

        this.currentData.forEach((row, index) => {
            // Create a signature for the row
            const signature = this.createRowSignature(row, this.currentHeaders, caseInsensitive);
            
            if (seen.has(signature)) {
                duplicates.push({ index, row, reason: 'Exact match' });
                if (!keepFirst) {
                    cleaned.push(row);
                }
            } else {
                seen.add(signature);
                cleaned.push(row);
            }
        });

        this.cleanedData = cleaned;
        this.duplicatesFound = duplicates;
    }

    removeKeyDuplicates(keyColumn, caseInsensitive, keepFirst) {
        const seen = new Set();
        const duplicates = [];
        const cleaned = [];

        this.currentData.forEach((row, index) => {
            let keyValue = row[keyColumn] || '';
            
            if (caseInsensitive && typeof keyValue === 'string') {
                keyValue = keyValue.toLowerCase();
            }

            if (seen.has(keyValue)) {
                duplicates.push({ index, row, reason: `Duplicate key: ${keyColumn}` });
                if (!keepFirst) {
                    cleaned.push(row);
                }
            } else {
                seen.add(keyValue);
                cleaned.push(row);
            }
        });

        this.cleanedData = cleaned;
        this.duplicatesFound = duplicates;
    }

    createRowSignature(row, headers, caseInsensitive) {
        return headers.map(header => {
            let value = row[header] || '';
            if (caseInsensitive && typeof value === 'string') {
                value = value.toLowerCase();
            }
            return value;
        }).join('|');
    }

    displayResults() {
        const resultArea = document.getElementById('duplicateResult');
        const originalCount = this.currentData.length;
        const cleanedCount = this.cleanedData.length;
        const duplicateCount = this.duplicatesFound.length;
        
        let duplicateExamplesHTML = '';
        if (this.duplicatesFound.length > 0) {
            duplicateExamplesHTML = '<div class="duplicate-examples"><h5>Sample Duplicates Found:</h5>';
            const sampleDuplicates = this.duplicatesFound.slice(0, 3);
            sampleDuplicates.forEach((duplicate, index) => {
                duplicateExamplesHTML += `
                    <div class="duplicate-item">
                        <strong>Row ${duplicate.index + 1}:</strong> ${duplicate.reason}
                        <div class="duplicate-data">${JSON.stringify(duplicate.row)}</div>
                    </div>
                `;
            });
            if (this.duplicatesFound.length > 3) {
                duplicateExamplesHTML += `<p>... and ${this.duplicatesFound.length - 3} more duplicates</p>`;
            }
            duplicateExamplesHTML += '</div>';
        }

        const cleanPreviewTable = this.generatePreviewTable(this.currentHeaders, this.cleanedData.slice(0, 5));
        
        resultArea.innerHTML = `
            <div class="duplicate-results">
                <h4>🧹 Duplicate Removal Complete!</h4>
                <div class="result-stats">
                    <span class="stat">Original rows: ${originalCount}</span>
                    <span class="stat">Duplicates found: ${duplicateCount}</span>
                    <span class="stat">Clean rows: ${cleanedCount}</span>
                    <span class="stat">Removed: ${originalCount - cleanedCount}</span>
                </div>
            </div>
            
            ${duplicateExamplesHTML}
            
            <div class="preview-section">
                <h5>Clean Data Preview:</h5>
                ${cleanPreviewTable}
            </div>
            
            <div class="duplicate-status">
                <p>✅ Duplicate removal complete. You can now download the clean data.</p>
            </div>
        `;
    }

    showRemoveButton() {
        const removeBtn = document.getElementById('removeDuplicatesBtn');
        if (removeBtn) {
            removeBtn.style.display = 'inline-flex';
        }
    }

    showDownloadButton() {
        const downloadBtn = document.getElementById('downloadCleanBtn');
        if (downloadBtn) {
            downloadBtn.style.display = 'inline-flex';
        }
    }

    downloadCleanData() {
        if (!this.cleanedData || !this.currentHeaders) {
            alert('No clean data to download');
            return;
        }

        try {
            const csvContent = FileProcessor.generateCSV(this.cleanedData, this.currentHeaders);
            const filename = this.originalFileName.replace(/\.[^/.]+$/, '') + '_no_duplicates.csv';
            
            FileProcessor.downloadFile(csvContent, filename, 'text/csv');
            this.showNotification('Clean data downloaded successfully!', 'success');
            
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
        const resultArea = document.getElementById('duplicateResult');
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
    window.duplicateRemover = new DuplicateRemover();
});