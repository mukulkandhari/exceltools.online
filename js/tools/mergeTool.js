// Merge Tool Implementation
class MergeTool {
    constructor() {
        this.uploadedFiles = [];
        this.processedData = [];
        this.mergedData = null;
        this.mergedHeaders = null;
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('mergeFileInput');
        const uploadArea = fileInput?.parentElement;
        const mergeBtn = document.getElementById('mergeBtn');
        const downloadBtn = document.getElementById('downloadMergedBtn');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        if (uploadArea) {
            this.setupDragAndDrop(uploadArea, fileInput);
        }

        if (mergeBtn) {
            mergeBtn.addEventListener('click', () => this.mergeFiles());
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadMergedFile());
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
            fileInput.files = e.dataTransfer.files;
            this.handleFileUpload({ target: { files: e.dataTransfer.files } });
        });
    }

    async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        const resultArea = document.getElementById('mergeResult');
        
        try {
            resultArea.innerHTML = '<div class="loading">Processing files...</div>';
            
            this.uploadedFiles = files;
            this.processedData = [];

            // Process each file
            for (const file of files) {
                const content = await FileProcessor.readFile(file);
                let data, headers;

                if (file.name.endsWith('.csv')) {
                    const parsed = FileProcessor.parseCSV(content);
                    data = parsed.data;
                    headers = parsed.headers;
                } else {
                    // Simulate Excel processing with sample data
                    const sampleData = this.generateSampleDataForFile(file.name);
                    data = sampleData;
                    headers = Object.keys(sampleData[0]);
                }

                this.processedData.push({
                    filename: file.name,
                    data: data,
                    headers: headers,
                    size: file.size
                });
            }

            this.displayFileList();
            this.showMergeButton();
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    generateSampleDataForFile(filename) {
        // Generate different sample data based on filename to simulate different files
        const baseData = [
            { 'ID': '001', 'Name': 'John Doe', 'Department': 'Sales', 'Salary': '50000' },
            { 'ID': '002', 'Name': 'Jane Smith', 'Department': 'Marketing', 'Salary': '55000' },
            { 'ID': '003', 'Name': 'Bob Johnson', 'Department': 'IT', 'Salary': '60000' }
        ];

        // Modify data slightly based on filename to create variation
        const fileIndex = filename.charCodeAt(0) % 3;
        return baseData.map((row, index) => ({
            ...row,
            'ID': String(parseInt(row.ID) + fileIndex * 10 + index),
            'File_Source': filename
        }));
    }

    displayFileList() {
        const fileList = document.getElementById('fileList');
        const selectedFiles = document.getElementById('selectedFiles');
        const resultArea = document.getElementById('mergeResult');

        if (fileList && selectedFiles) {
            let filesHTML = '';
            let totalRows = 0;
            let totalSize = 0;

            this.processedData.forEach((fileData, index) => {
                totalRows += fileData.data.length;
                totalSize += fileData.size;
                
                filesHTML += `
                    <li class="file-item">
                        <div class="file-info">
                            <strong>${fileData.filename}</strong>
                            <span class="file-details">
                                ${fileData.data.length} rows, ${fileData.headers.length} columns, 
                                ${FileProcessor.formatFileSize(fileData.size)}
                            </span>
                        </div>
                        <div class="file-preview">
                            Headers: ${fileData.headers.join(', ')}
                        </div>
                    </li>
                `;
            });

            selectedFiles.innerHTML = filesHTML;
            fileList.style.display = 'block';

            resultArea.innerHTML = `
                <div class="merge-summary">
                    <h4>📁 ${this.processedData.length} Files Ready for Merge</h4>
                    <div class="merge-stats">
                        <span class="stat">Total rows: ${totalRows}</span>
                        <span class="stat">Total size: ${FileProcessor.formatFileSize(totalSize)}</span>
                    </div>
                </div>
                
                <div class="merge-status">
                    <p>✅ Files processed successfully. Configure merge options above and click "Merge Files".</p>
                </div>
            `;
        }
    }

    mergeFiles() {
        if (!this.processedData || this.processedData.length === 0) {
            alert('No files to merge');
            return;
        }

        const mergeType = document.getElementById('mergeType')?.value;
        const addSource = document.getElementById('addSource')?.checked;
        const alignHeaders = document.getElementById('alignHeaders')?.checked;

        try {
            if (mergeType === 'append') {
                this.appendRows(addSource, alignHeaders);
            } else if (mergeType === 'join') {
                this.joinColumns(addSource);
            }

            this.displayMergeResults();
            this.showDownloadButton();

        } catch (error) {
            this.showError(`Merge failed: ${error.message}`);
        }
    }

    appendRows(addSource, alignHeaders) {
        let allHeaders = new Set();
        
        // Collect all unique headers if aligning
        if (alignHeaders) {
            this.processedData.forEach(fileData => {
                fileData.headers.forEach(header => allHeaders.add(header));
            });
        } else {
            // Use headers from first file
            this.processedData[0].headers.forEach(header => allHeaders.add(header));
        }

        if (addSource) {
            allHeaders.add('Source_File');
        }

        this.mergedHeaders = Array.from(allHeaders);
        this.mergedData = [];

        // Append data from all files
        this.processedData.forEach(fileData => {
            fileData.data.forEach(row => {
                const mergedRow = {};
                
                // Initialize all headers
                this.mergedHeaders.forEach(header => {
                    mergedRow[header] = '';
                });

                // Fill in data from current row
                Object.keys(row).forEach(key => {
                    if (this.mergedHeaders.includes(key)) {
                        mergedRow[key] = row[key];
                    }
                });

                // Add source file if requested
                if (addSource) {
                    mergedRow['Source_File'] = fileData.filename;
                }

                this.mergedData.push(mergedRow);
            });
        });
    }

    joinColumns(addSource) {
        if (this.processedData.length === 0) return;

        // Start with first file's data
        this.mergedData = JSON.parse(JSON.stringify(this.processedData[0].data));
        this.mergedHeaders = [...this.processedData[0].headers];

        // Add source column if requested
        if (addSource) {
            this.mergedHeaders.push('Source_File');
            this.mergedData.forEach(row => {
                row['Source_File'] = this.processedData[0].filename;
            });
        }

        // Join additional files column-wise
        for (let i = 1; i < this.processedData.length; i++) {
            const fileData = this.processedData[i];
            
            // Add new headers with file prefix to avoid conflicts
            const prefixedHeaders = fileData.headers.map(header => 
                this.mergedHeaders.includes(header) ? `${fileData.filename}_${header}` : header
            );
            
            this.mergedHeaders.push(...prefixedHeaders);

            // Extend each row with data from current file
            this.mergedData.forEach((row, rowIndex) => {
                const sourceRow = fileData.data[rowIndex] || {};
                
                prefixedHeaders.forEach((prefixedHeader, headerIndex) => {
                    const originalHeader = fileData.headers[headerIndex];
                    row[prefixedHeader] = sourceRow[originalHeader] || '';
                });
            });
        }
    }

    displayMergeResults() {
        const resultArea = document.getElementById('mergeResult');
        const mergeType = document.getElementById('mergeType')?.value;
        const previewTable = this.generatePreviewTable(this.mergedHeaders, this.mergedData.slice(0, 5));
        
        resultArea.innerHTML = `
            <div class="merge-results">
                <h4>🔗 Files Merged Successfully!</h4>
                <div class="merge-stats">
                    <span class="stat">Merge type: ${mergeType === 'append' ? 'Append Rows' : 'Join Columns'}</span>
                    <span class="stat">Total rows: ${this.mergedData.length}</span>
                    <span class="stat">Total columns: ${this.mergedHeaders.length}</span>
                    <span class="stat">Files merged: ${this.processedData.length}</span>
                </div>
            </div>
            
            <div class="preview-section">
                <h5>Merged Data Preview:</h5>
                ${previewTable}
            </div>
            
            <div class="merge-status">
                <p>✅ Merge complete. You can now download the merged file.</p>
            </div>
        `;
    }

    generatePreviewTable(headers, data) {
        if (!data || data.length === 0) {
            return '<p>No data to preview</p>';
        }

        let table = '<div class="preview-table"><table><thead><tr>';
        headers.forEach(header => {
            table += `<th>${this.escapeHtml(header)}</th>`;
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

    showMergeButton() {
        const mergeBtn = document.getElementById('mergeBtn');
        if (mergeBtn) {
            mergeBtn.style.display = 'inline-flex';
        }
    }

    showDownloadButton() {
        const downloadBtn = document.getElementById('downloadMergedBtn');
        if (downloadBtn) {
            downloadBtn.style.display = 'inline-flex';
        }
    }

    downloadMergedFile() {
        if (!this.mergedData || !this.mergedHeaders) {
            alert('No merged data to download');
            return;
        }

        try {
            const csvContent = FileProcessor.generateCSV(this.mergedData, this.mergedHeaders);
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `merged_files_${timestamp}.csv`;
            
            FileProcessor.downloadFile(csvContent, filename, 'text/csv');
            this.showNotification('Merged file downloaded successfully!', 'success');
            
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
        const resultArea = document.getElementById('mergeResult');
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
    window.mergeTool = new MergeTool();
});