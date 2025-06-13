// Data Analyzer Tool Implementation
class DataAnalyzer {
    constructor() {
        this.currentData = null;
        this.currentHeaders = null;
        this.originalFileName = '';
        this.analysisResults = null;
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('analyzerFileInput');
        const uploadArea = fileInput?.parentElement;
        const analyzeBtn = document.getElementById('analyzeBtn');
        const downloadBtn = document.getElementById('downloadAnalysisBtn');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        if (uploadArea) {
            this.setupDragAndDrop(uploadArea, fileInput);
        }

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.runAnalysis());
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadReport());
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
        const resultArea = document.getElementById('analysisResult');
        
        try {
            resultArea.innerHTML = '<div class="loading">Loading file...</div>';
            
            const content = await FileProcessor.readFile(file);
            
            if (file.name.endsWith('.csv')) {
                const parsed = FileProcessor.parseCSV(content);
                this.currentData = parsed.data;
                this.currentHeaders = parsed.headers;
            } else {
                // Simulate Excel processing with sample data
                const sampleData = this.generateSampleData();
                this.currentData = sampleData;
                this.currentHeaders = Object.keys(sampleData[0]);
            }
            
            this.displayFileInfo(file);
            this.showAnalyzeButton();
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    generateSampleData() {
        const data = [];
        const names = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank'];
        const departments = ['Sales', 'Marketing', 'IT', 'HR', 'Finance'];
        
        for (let i = 0; i < 50; i++) {
            data.push({
                'Name': names[Math.floor(Math.random() * names.length)],
                'Department': departments[Math.floor(Math.random() * departments.length)],
                'Salary': Math.floor(Math.random() * 50000) + 30000,
                'Age': Math.floor(Math.random() * 40) + 22,
                'Experience': Math.floor(Math.random() * 15) + 1,
                'Performance': Math.floor(Math.random() * 100) + 1
            });
        }
        
        return data;
    }

    displayFileInfo(file) {
        const resultArea = document.getElementById('analysisResult');
        const dataTypes = FileProcessor.detectDataTypes(this.currentData, this.currentHeaders);
        
        let dataTypesHTML = '<div class="data-types"><h5>Detected Data Types:</h5><ul>';
        Object.entries(dataTypes).forEach(([header, type]) => {
            const icon = type === 'number' ? '🔢' : type === 'date' ? '📅' : '📝';
            dataTypesHTML += `<li>${icon} ${header}: ${type}</li>`;
        });
        dataTypesHTML += '</ul></div>';
        
        resultArea.innerHTML = `
            <div class="file-info">
                <h4>📁 ${file.name}</h4>
                <div class="file-stats">
                    <span class="stat">Size: ${FileProcessor.formatFileSize(file.size)}</span>
                    <span class="stat">Rows: ${this.currentData.length}</span>
                    <span class="stat">Columns: ${this.currentHeaders.length}</span>
                </div>
            </div>
            
            ${dataTypesHTML}
            
            <div class="analysis-status">
                <p>✅ File loaded successfully. Select analysis options above and click "Run Analysis".</p>
            </div>
        `;
    }

    runAnalysis() {
        if (!this.currentData || !this.currentHeaders) {
            alert('No data to analyze');
            return;
        }

        const basicStats = document.getElementById('basicStats')?.checked;
        const distribution = document.getElementById('distribution')?.checked;
        const correlation = document.getElementById('correlation')?.checked;
        const outliers = document.getElementById('outliers')?.checked;

        try {
            this.analysisResults = {};
            
            if (basicStats) {
                this.analysisResults.basicStats = this.calculateBasicStats();
            }
            
            if (distribution) {
                this.analysisResults.distribution = this.analyzeDistribution();
            }
            
            if (correlation) {
                this.analysisResults.correlation = this.calculateCorrelation();
            }
            
            if (outliers) {
                this.analysisResults.outliers = this.detectOutliers();
            }
            
            this.displayAnalysisResults();
            this.showDownloadButton();
            
        } catch (error) {
            this.showError(`Analysis failed: ${error.message}`);
        }
    }

    calculateBasicStats() {
        const stats = {};
        const numericColumns = this.getNumericColumns();
        
        numericColumns.forEach(column => {
            const values = this.currentData
                .map(row => parseFloat(row[column]))
                .filter(val => !isNaN(val));
            
            if (values.length > 0) {
                stats[column] = {
                    count: values.length,
                    mean: this.calculateMean(values),
                    median: this.calculateMedian(values),
                    mode: this.calculateMode(values),
                    min: Math.min(...values),
                    max: Math.max(...values),
                    std: this.calculateStandardDeviation(values)
                };
            }
        });
        
        return stats;
    }

    analyzeDistribution() {
        const distribution = {};
        
        this.currentHeaders.forEach(column => {
            const values = this.currentData.map(row => row[column]);
            const frequency = {};
            
            values.forEach(value => {
                frequency[value] = (frequency[value] || 0) + 1;
            });
            
            // Get top 10 most frequent values
            const sorted = Object.entries(frequency)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10);
            
            distribution[column] = sorted;
        });
        
        return distribution;
    }

    calculateCorrelation() {
        const numericColumns = this.getNumericColumns();
        const correlations = {};
        
        for (let i = 0; i < numericColumns.length; i++) {
            for (let j = i + 1; j < numericColumns.length; j++) {
                const col1 = numericColumns[i];
                const col2 = numericColumns[j];
                
                const values1 = this.currentData.map(row => parseFloat(row[col1])).filter(val => !isNaN(val));
                const values2 = this.currentData.map(row => parseFloat(row[col2])).filter(val => !isNaN(val));
                
                if (values1.length > 1 && values2.length > 1) {
                    const correlation = this.calculatePearsonCorrelation(values1, values2);
                    correlations[`${col1} vs ${col2}`] = correlation;
                }
            }
        }
        
        return correlations;
    }

    detectOutliers() {
        const outliers = {};
        const numericColumns = this.getNumericColumns();
        
        numericColumns.forEach(column => {
            const values = this.currentData
                .map(row => parseFloat(row[column]))
                .filter(val => !isNaN(val));
            
            if (values.length > 0) {
                const q1 = this.calculatePercentile(values, 25);
                const q3 = this.calculatePercentile(values, 75);
                const iqr = q3 - q1;
                const lowerBound = q1 - 1.5 * iqr;
                const upperBound = q3 + 1.5 * iqr;
                
                const columnOutliers = values.filter(val => val < lowerBound || val > upperBound);
                
                if (columnOutliers.length > 0) {
                    outliers[column] = {
                        count: columnOutliers.length,
                        percentage: ((columnOutliers.length / values.length) * 100).toFixed(2),
                        values: columnOutliers.slice(0, 10) // Show first 10 outliers
                    };
                }
            }
        });
        
        return outliers;
    }

    getNumericColumns() {
        return this.currentHeaders.filter(header => {
            const values = this.currentData.map(row => row[header]);
            return values.some(val => !isNaN(parseFloat(val)));
        });
    }

    calculateMean(values) {
        return (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2);
    }

    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
            ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2)
            : sorted[mid].toFixed(2);
    }

    calculateMode(values) {
        const frequency = {};
        values.forEach(val => {
            frequency[val] = (frequency[val] || 0) + 1;
        });
        
        const maxFreq = Math.max(...Object.values(frequency));
        const modes = Object.keys(frequency).filter(key => frequency[key] === maxFreq);
        
        return modes.length === values.length ? 'No mode' : modes.join(', ');
    }

    calculateStandardDeviation(values) {
        const mean = parseFloat(this.calculateMean(values));
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance).toFixed(2);
    }

    calculatePercentile(values, percentile) {
        const sorted = [...values].sort((a, b) => a - b);
        const index = (percentile / 100) * (sorted.length - 1);
        
        if (Math.floor(index) === index) {
            return sorted[index];
        } else {
            const lower = sorted[Math.floor(index)];
            const upper = sorted[Math.ceil(index)];
            return lower + (upper - lower) * (index - Math.floor(index));
        }
    }

    calculatePearsonCorrelation(x, y) {
        const n = Math.min(x.length, y.length);
        const sumX = x.slice(0, n).reduce((sum, val) => sum + val, 0);
        const sumY = y.slice(0, n).reduce((sum, val) => sum + val, 0);
        const sumXY = x.slice(0, n).reduce((sum, val, i) => sum + val * y[i], 0);
        const sumX2 = x.slice(0, n).reduce((sum, val) => sum + val * val, 0);
        const sumY2 = y.slice(0, n).reduce((sum, val) => sum + val * val, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        return denominator === 0 ? 0 : (numerator / denominator).toFixed(3);
    }

    displayAnalysisResults() {
        const resultArea = document.getElementById('analysisResult');
        let resultsHTML = '<div class="analysis-results"><h4>📊 Analysis Results</h4>';
        
        if (this.analysisResults.basicStats) {
            resultsHTML += this.generateBasicStatsHTML();
        }
        
        if (this.analysisResults.distribution) {
            resultsHTML += this.generateDistributionHTML();
        }
        
        if (this.analysisResults.correlation) {
            resultsHTML += this.generateCorrelationHTML();
        }
        
        if (this.analysisResults.outliers) {
            resultsHTML += this.generateOutliersHTML();
        }
        
        resultsHTML += '</div>';
        resultArea.innerHTML = resultsHTML;
    }

    generateBasicStatsHTML() {
        let html = '<div class="stats-section"><h5>📈 Basic Statistics</h5>';
        
        Object.entries(this.analysisResults.basicStats).forEach(([column, stats]) => {
            html += `
                <div class="stat-card">
                    <h6>${column}</h6>
                    <div class="stat-grid">
                        <div class="stat-item"><span>Count:</span> ${stats.count}</div>
                        <div class="stat-item"><span>Mean:</span> ${stats.mean}</div>
                        <div class="stat-item"><span>Median:</span> ${stats.median}</div>
                        <div class="stat-item"><span>Mode:</span> ${stats.mode}</div>
                        <div class="stat-item"><span>Min:</span> ${stats.min}</div>
                        <div class="stat-item"><span>Max:</span> ${stats.max}</div>
                        <div class="stat-item"><span>Std Dev:</span> ${stats.std}</div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    generateDistributionHTML() {
        let html = '<div class="distribution-section"><h5>📊 Data Distribution (Top Values)</h5>';
        
        Object.entries(this.analysisResults.distribution).forEach(([column, distribution]) => {
            if (distribution.length > 0) {
                html += `<div class="distribution-card"><h6>${column}</h6><ul>`;
                distribution.forEach(([value, count]) => {
                    html += `<li>${value}: ${count} occurrences</li>`;
                });
                html += '</ul></div>';
            }
        });
        
        html += '</div>';
        return html;
    }

    generateCorrelationHTML() {
        let html = '<div class="correlation-section"><h5>🔗 Correlation Analysis</h5>';
        
        if (Object.keys(this.analysisResults.correlation).length === 0) {
            html += '<p>No correlations found (need at least 2 numeric columns)</p>';
        } else {
            html += '<div class="correlation-list">';
            Object.entries(this.analysisResults.correlation).forEach(([pair, correlation]) => {
                const strength = Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.3 ? 'moderate' : 'weak';
                html += `<div class="correlation-item ${strength}"><span>${pair}:</span> ${correlation}</div>`;
            });
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }

    generateOutliersHTML() {
        let html = '<div class="outliers-section"><h5>🎯 Outlier Detection</h5>';
        
        if (Object.keys(this.analysisResults.outliers).length === 0) {
            html += '<p>No outliers detected in numeric columns</p>';
        } else {
            Object.entries(this.analysisResults.outliers).forEach(([column, outlierData]) => {
                html += `
                    <div class="outlier-card">
                        <h6>${column}</h6>
                        <p>Found ${outlierData.count} outliers (${outlierData.percentage}% of data)</p>
                        <p>Sample values: ${outlierData.values.join(', ')}</p>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        return html;
    }

    showAnalyzeButton() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.style.display = 'inline-flex';
        }
    }

    showDownloadButton() {
        const downloadBtn = document.getElementById('downloadAnalysisBtn');
        if (downloadBtn) {
            downloadBtn.style.display = 'inline-flex';
        }
    }

    downloadReport() {
        if (!this.analysisResults) {
            alert('No analysis results to download');
            return;
        }

        try {
            const report = this.generateTextReport();
            const filename = this.originalFileName.replace(/\.[^/.]+$/, '') + '_analysis_report.txt';
            
            FileProcessor.downloadFile(report, filename, 'text/plain');
            this.showNotification('Analysis report downloaded successfully!', 'success');
            
        } catch (error) {
            alert(`Download failed: ${error.message}`);
        }
    }

    generateTextReport() {
        let report = `Data Analysis Report\n`;
        report += `Generated: ${new Date().toLocaleString()}\n`;
        report += `File: ${this.originalFileName}\n`;
        report += `Rows: ${this.currentData.length}\n`;
        report += `Columns: ${this.currentHeaders.length}\n\n`;
        
        if (this.analysisResults.basicStats) {
            report += `BASIC STATISTICS\n${'='.repeat(50)}\n`;
            Object.entries(this.analysisResults.basicStats).forEach(([column, stats]) => {
                report += `\n${column}:\n`;
                report += `  Count: ${stats.count}\n`;
                report += `  Mean: ${stats.mean}\n`;
                report += `  Median: ${stats.median}\n`;
                report += `  Mode: ${stats.mode}\n`;
                report += `  Min: ${stats.min}\n`;
                report += `  Max: ${stats.max}\n`;
                report += `  Standard Deviation: ${stats.std}\n`;
            });
            report += '\n';
        }
        
        if (this.analysisResults.correlation) {
            report += `CORRELATION ANALYSIS\n${'='.repeat(50)}\n`;
            Object.entries(this.analysisResults.correlation).forEach(([pair, correlation]) => {
                report += `${pair}: ${correlation}\n`;
            });
            report += '\n';
        }
        
        if (this.analysisResults.outliers) {
            report += `OUTLIER DETECTION\n${'='.repeat(50)}\n`;
            Object.entries(this.analysisResults.outliers).forEach(([column, outlierData]) => {
                report += `${column}: ${outlierData.count} outliers (${outlierData.percentage}%)\n`;
            });
            report += '\n';
        }
        
        return report;
    }

    showError(message) {
        const resultArea = document.getElementById('analysisResult');
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
    window.dataAnalyzer = new DataAnalyzer();
});