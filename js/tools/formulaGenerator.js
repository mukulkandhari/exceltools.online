// Formula Generator Tool Implementation
class FormulaGenerator {
    constructor() {
        this.formulas = {
            sum: {
                name: 'SUM',
                description: 'Add numbers in a range',
                template: '=SUM({range})',
                options: [
                    { id: 'range', label: 'Range', type: 'text', placeholder: 'A1:A10', default: 'A1:A10' }
                ]
            },
            average: {
                name: 'AVERAGE',
                description: 'Calculate average of numbers',
                template: '=AVERAGE({range})',
                options: [
                    { id: 'range', label: 'Range', type: 'text', placeholder: 'A1:A10', default: 'A1:A10' }
                ]
            },
            count: {
                name: 'COUNT',
                description: 'Count cells with numbers',
                template: '=COUNT({range})',
                options: [
                    { id: 'range', label: 'Range', type: 'text', placeholder: 'A1:A10', default: 'A1:A10' }
                ]
            },
            counta: {
                name: 'COUNTA',
                description: 'Count non-empty cells',
                template: '=COUNTA({range})',
                options: [
                    { id: 'range', label: 'Range', type: 'text', placeholder: 'A1:A10', default: 'A1:A10' }
                ]
            },
            if: {
                name: 'IF',
                description: 'Conditional logic',
                template: '=IF({condition}, {valueIfTrue}, {valueIfFalse})',
                options: [
                    { id: 'condition', label: 'Condition', type: 'text', placeholder: 'A1>10', default: 'A1>10' },
                    { id: 'valueIfTrue', label: 'Value if True', type: 'text', placeholder: '"High"', default: '"High"' },
                    { id: 'valueIfFalse', label: 'Value if False', type: 'text', placeholder: '"Low"', default: '"Low"' }
                ]
            },
            vlookup: {
                name: 'VLOOKUP',
                description: 'Lookup values in a table',
                template: '=VLOOKUP({lookupValue}, {tableArray}, {colIndex}, {exactMatch})',
                options: [
                    { id: 'lookupValue', label: 'Lookup Value', type: 'text', placeholder: 'A1', default: 'A1' },
                    { id: 'tableArray', label: 'Table Array', type: 'text', placeholder: 'B1:D10', default: 'B1:D10' },
                    { id: 'colIndex', label: 'Column Index', type: 'number', placeholder: '2', default: '2' },
                    { id: 'exactMatch', label: 'Exact Match', type: 'select', options: [
                        { value: 'FALSE', label: 'FALSE (Exact)' },
                        { value: 'TRUE', label: 'TRUE (Approximate)' }
                    ], default: 'FALSE' }
                ]
            },
            concatenate: {
                name: 'CONCATENATE',
                description: 'Join text from multiple cells',
                template: '=CONCATENATE({text1}, {separator}, {text2})',
                options: [
                    { id: 'text1', label: 'First Text', type: 'text', placeholder: 'A1', default: 'A1' },
                    { id: 'separator', label: 'Separator', type: 'text', placeholder: '" "', default: '" "' },
                    { id: 'text2', label: 'Second Text', type: 'text', placeholder: 'B1', default: 'B1' }
                ]
            },
            sumif: {
                name: 'SUMIF',
                description: 'Sum cells that meet criteria',
                template: '=SUMIF({range}, {criteria}, {sumRange})',
                options: [
                    { id: 'range', label: 'Range to Check', type: 'text', placeholder: 'A1:A10', default: 'A1:A10' },
                    { id: 'criteria', label: 'Criteria', type: 'text', placeholder: '">10"', default: '">10"' },
                    { id: 'sumRange', label: 'Sum Range', type: 'text', placeholder: 'B1:B10', default: 'B1:B10' }
                ]
            },
            countif: {
                name: 'COUNTIF',
                description: 'Count cells that meet criteria',
                template: '=COUNTIF({range}, {criteria})',
                options: [
                    { id: 'range', label: 'Range', type: 'text', placeholder: 'A1:A10', default: 'A1:A10' },
                    { id: 'criteria', label: 'Criteria', type: 'text', placeholder: '">10"', default: '">10"' }
                ]
            },
            date: {
                name: 'DATE',
                description: 'Create a date from year, month, day',
                template: '=DATE({year}, {month}, {day})',
                options: [
                    { id: 'year', label: 'Year', type: 'text', placeholder: '2024', default: '2024' },
                    { id: 'month', label: 'Month', type: 'text', placeholder: '12', default: '12' },
                    { id: 'day', label: 'Day', type: 'text', placeholder: '15', default: '15' }
                ]
            },
            today: {
                name: 'TODAY',
                description: 'Current date',
                template: '=TODAY()',
                options: []
            },
            now: {
                name: 'NOW',
                description: 'Current date and time',
                template: '=NOW()',
                options: []
            }
        };
    }

    init() {
        this.setupEventListeners();
        this.updateFormulaOptions();
    }

    setupEventListeners() {
        const formulaType = document.getElementById('formulaType');
        const copyBtn = document.querySelector('.copy-formula-btn');

        if (formulaType) {
            formulaType.addEventListener('change', () => this.updateFormulaOptions());
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyFormula());
        }

        // Add event listeners for example cards
        document.addEventListener('click', (e) => {
            if (e.target.closest('.example-card')) {
                const code = e.target.closest('.example-card').querySelector('code');
                if (code) {
                    this.copyToClipboard(code.textContent);
                    this.showNotification('Formula copied to clipboard!', 'success');
                }
            }
        });
    }

    updateFormulaOptions() {
        const formulaType = document.getElementById('formulaType')?.value;
        const formulaOptions = document.getElementById('formulaOptions');
        const formulaOutput = document.getElementById('formulaOutput');

        if (!formulaType || !this.formulas[formulaType]) return;

        const formula = this.formulas[formulaType];
        
        // Generate options HTML
        let optionsHTML = '';
        formula.options.forEach(option => {
            optionsHTML += this.generateOptionHTML(option);
        });

        if (formulaOptions) {
            formulaOptions.innerHTML = optionsHTML;
            
            // Add event listeners to new inputs
            formulaOptions.querySelectorAll('input, select').forEach(input => {
                input.addEventListener('input', () => this.generateFormula());
            });
        }

        this.generateFormula();
    }

    generateOptionHTML(option) {
        let inputHTML = '';
        
        switch (option.type) {
            case 'text':
            case 'number':
                inputHTML = `<input type="${option.type}" id="${option.id}" value="${option.default}" placeholder="${option.placeholder}">`;
                break;
            case 'select':
                inputHTML = `<select id="${option.id}">`;
                option.options.forEach(opt => {
                    const selected = opt.value === option.default ? 'selected' : '';
                    inputHTML += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
                });
                inputHTML += '</select>';
                break;
        }

        return `
            <div class="option-group">
                <label for="${option.id}">${option.label}:</label>
                ${inputHTML}
            </div>
        `;
    }

    generateFormula() {
        const formulaType = document.getElementById('formulaType')?.value;
        const formulaOutput = document.getElementById('formulaOutput');

        if (!formulaType || !this.formulas[formulaType]) return;

        const formula = this.formulas[formulaType];
        let generatedFormula = formula.template;

        // Replace placeholders with actual values
        formula.options.forEach(option => {
            const input = document.getElementById(option.id);
            if (input) {
                const value = input.value || option.default;
                generatedFormula = generatedFormula.replace(`{${option.id}}`, value);
            }
        });

        if (formulaOutput) {
            formulaOutput.innerHTML = `<code>${generatedFormula}</code>`;
        }
    }

    copyFormula() {
        const formulaOutput = document.getElementById('formulaOutput');
        if (!formulaOutput) return;

        const formulaText = formulaOutput.textContent;
        this.copyToClipboard(formulaText);
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Formula copied to clipboard!', 'success');
            
            // Visual feedback
            const copyBtn = document.querySelector('.copy-formula-btn');
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                copyBtn.style.background = 'var(--color-success)';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.background = '';
                }, 2000);
            }
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            this.showNotification('Formula copied to clipboard!', 'success');
        }
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
    window.formulaGenerator = new FormulaGenerator();
});