// File processing utilities
class FileProcessor {
    static async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            
            if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        });
    }

    static parseCSV(csvText, delimiter = ',') {
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = this.parseCSVLine(lines[0], delimiter);
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i], delimiter);
            if (values.length > 0) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                data.push(row);
            }
        }

        return { headers, data };
    }

    static parseCSVLine(line, delimiter = ',') {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    static generateCSV(data, headers, delimiter = ',') {
        const csvLines = [];
        
        // Add headers
        csvLines.push(headers.map(header => this.escapeCSVField(header)).join(delimiter));
        
        // Add data rows
        data.forEach(row => {
            const values = headers.map(header => this.escapeCSVField(row[header] || ''));
            csvLines.push(values.join(delimiter));
        });
        
        return csvLines.join('\n');
    }

    static escapeCSVField(field) {
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    }

    static downloadFile(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static validateData(data) {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('No valid data found in file');
        }
        return true;
    }

    static detectDataTypes(data, headers) {
        const types = {};
        
        headers.forEach(header => {
            const values = data.map(row => row[header]).filter(val => val !== '');
            
            if (values.length === 0) {
                types[header] = 'text';
                return;
            }

            const isNumber = values.every(val => !isNaN(val) && !isNaN(parseFloat(val)));
            const isDate = values.every(val => !isNaN(Date.parse(val)));
            
            if (isNumber) {
                types[header] = 'number';
            } else if (isDate) {
                types[header] = 'date';
            } else {
                types[header] = 'text';
            }
        });
        
        return types;
    }
}

// Export for use in other modules
window.FileProcessor = FileProcessor;