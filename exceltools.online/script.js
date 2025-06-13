// Global variables
let currentTool = null;
let uploadedData = null;

// DOM elements
const toolModal = document.getElementById('toolModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    initSmoothScrolling();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Add scroll effect to header
    initHeaderScrollEffect();
    
    // Load utility scripts
    loadUtilityScripts();
});

// Load utility scripts
function loadUtilityScripts() {
    const scripts = [
        'js/utils/fileProcessor.js',
        'js/tools/csvConverter.js',
        'js/tools/dataFormatter.js',
        'js/tools/formulaGenerator.js',
        'js/tools/dataAnalyzer.js',
        'js/tools/duplicateRemover.js',
        'js/tools/mergeTool.js'
    ];

    scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
    });
}

// Navigation functions
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    navMenu.classList.toggle('mobile-active');
    mobileMenuBtn.classList.toggle('active');
}

function initHeaderScrollEffect() {
    const header = document.querySelector('.header');
    let scrolled = false;
    
    window.addEventListener('scroll', function() {
        const isScrolled = window.scrollY > 10;
        
        if (isScrolled !== scrolled) {
            scrolled = isScrolled;
            header.style.background = scrolled ? 'rgba(255, 255, 255, 0.95)' : 'white';
            header.style.backdropFilter = scrolled ? 'blur(10px)' : 'none';
        }
    });
}

// Tool functions
function openTool(toolName) {
    currentTool = toolName;
    
    const toolConfig = getToolConfig(toolName);
    modalTitle.textContent = toolConfig.title;
    modalBody.innerHTML = toolConfig.content;
    
    toolModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Initialize tool-specific functionality
    setTimeout(() => initToolFunctionality(toolName), 100);
}

function closeModal() {
    toolModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentTool = null;
    uploadedData = null;
}

function getToolConfig(toolName) {
    const tools = {
        'csv-converter': {
            title: 'CSV Converter',
            content: `
                <div class="tool-interface">
                    <div class="file-upload-area" onclick="document.getElementById('csvFileInput').click()">
                        <div class="upload-icon">📁</div>
                        <h3>Upload Excel or CSV File</h3>
                        <p>Click here or drag and drop your file</p>
                        <input type="file" id="csvFileInput" class="file-input" accept=".xlsx,.xls,.csv">
                    </div>
                    
                    <div class="conversion-options">
                        <h4>Conversion Options</h4>
                        <div class="option-group">
                            <label>
                                <input type="radio" name="conversionType" value="excel-to-csv" checked>
                                Excel to CSV
                            </label>
                            <label>
                                <input type="radio" name="conversionType" value="csv-to-excel">
                                CSV to Excel
                            </label>
                        </div>
                        
                        <div class="option-group">
                            <label>
                                <input type="checkbox" id="includeHeaders" checked>
                                Include Headers
                            </label>
                        </div>
                        
                        <div class="option-group">
                            <label for="delimiter">CSV Delimiter:</label>
                            <select id="delimiter">
                                <option value=",">Comma (,)</option>
                                <option value=";">Semicolon (;)</option>
                                <option value="\t">Tab</option>
                                <option value="|">Pipe (|)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="result-area" id="conversionResult">
                        <p>Upload a file to see the conversion result</p>
                    </div>
                    
                    <button class="btn btn-download" id="downloadBtn" style="display: none;">
                        Download Converted File
                    </button>
                </div>
            `
        },
        'data-formatter': {
            title: 'Data Formatter',
            content: `
                <div class="tool-interface">
                    <div class="file-upload-area" onclick="document.getElementById('formatterFileInput').click()">
                        <div class="upload-icon">🎨</div>
                        <h3>Upload Your Data File</h3>
                        <p>Supports Excel, CSV, and text files</p>
                        <input type="file" id="formatterFileInput" class="file-input" accept=".xlsx,.xls,.csv,.txt">
                    </div>
                    
                    <div class="formatting-options">
                        <h4>Formatting Options</h4>
                        
                        <div class="option-group">
                            <label>Text Case:</label>
                            <select id="textCase">
                                <option value="none">No Change</option>
                                <option value="upper">UPPERCASE</option>
                                <option value="lower">lowercase</option>
                                <option value="title">Title Case</option>
                            </select>
                        </div>
                        
                        <div class="option-group">
                            <label>
                                <input type="checkbox" id="trimSpaces" checked>
                                Remove Extra Spaces
                            </label>
                        </div>
                        
                        <div class="option-group">
                            <label>
                                <input type="checkbox" id="removeEmpty">
                                Remove Empty Rows
                            </label>
                        </div>
                        
                        <div class="option-group">
                            <label>Date Format:</label>
                            <select id="dateFormat">
                                <option value="none">No Change</option>
                                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="result-area" id="formatterResult">
                        <p>Upload a file to start formatting</p>
                    </div>
                    
                    <button class="btn btn-primary" id="formatBtn" style="display: none;">
                        Apply Formatting
                    </button>
                    <button class="btn btn-download" id="downloadFormattedBtn" style="display: none;">
                        Download Formatted Data
                    </button>
                </div>
            `
        },
        'formula-generator': {
            title: 'Formula Generator',
            content: `
                <div class="tool-interface">
                    <div class="formula-builder">
                        <h4>Build Your Formula</h4>
                        
                        <div class="option-group">
                            <label>Formula Type:</label>
                            <select id="formulaType">
                                <option value="sum">SUM - Add numbers</option>
                                <option value="average">AVERAGE - Calculate average</option>
                                <option value="count">COUNT - Count cells with numbers</option>
                                <option value="counta">COUNTA - Count non-empty cells</option>
                                <option value="if">IF - Conditional logic</option>
                                <option value="vlookup">VLOOKUP - Lookup values</option>
                                <option value="concatenate">CONCATENATE - Join text</option>
                                <option value="sumif">SUMIF - Sum with criteria</option>
                                <option value="countif">COUNTIF - Count with criteria</option>
                                <option value="date">DATE - Create date</option>
                                <option value="today">TODAY - Current date</option>
                                <option value="now">NOW - Current date and time</option>
                            </select>
                        </div>
                        
                        <div id="formulaOptions">
                            <!-- Dynamic options will be loaded here -->
                        </div>
                        
                        <div class="formula-preview">
                            <h4>Generated Formula:</h4>
                            <div class="formula-output" id="formulaOutput">
                                <code>=SUM(A1:A10)</code>
                            </div>
                            <button class="btn btn-secondary copy-formula-btn">
                                Copy Formula
                            </button>
                        </div>
                    </div>
                    
                    <div class="formula-examples">
                        <h4>Common Examples</h4>
                        <div class="example-grid">
                            <div class="example-card">
                                <strong>Sum a range:</strong>
                                <code>=SUM(A1:A10)</code>
                            </div>
                            <div class="example-card">
                                <strong>Average with condition:</strong>
                                <code>=AVERAGEIF(B:B,">0",A:A)</code>
                            </div>
                            <div class="example-card">
                                <strong>Count non-empty:</strong>
                                <code>=COUNTA(A:A)</code>
                            </div>
                            <div class="example-card">
                                <strong>IF statement:</strong>
                                <code>=IF(A1>10,"High","Low")</code>
                            </div>
                            <div class="example-card">
                                <strong>VLOOKUP:</strong>
                                <code>=VLOOKUP(A1,B:D,2,FALSE)</code>
                            </div>
                            <div class="example-card">
                                <strong>Concatenate:</strong>
                                <code>=CONCATENATE(A1," ",B1)</code>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        'data-analyzer': {
            title: 'Data Analyzer',
            content: `
                <div class="tool-interface">
                    <div class="file-upload-area" onclick="document.getElementById('analyzerFileInput').click()">
                        <div class="upload-icon">📈</div>
                        <h3>Upload Data for Analysis</h3>
                        <p>Excel or CSV files supported</p>
                        <input type="file" id="analyzerFileInput" class="file-input" accept=".xlsx,.xls,.csv">
                    </div>
                    
                    <div class="analysis-options">
                        <h4>Analysis Type</h4>
                        <div class="option-group">
                            <label>
                                <input type="checkbox" id="basicStats" checked>
                                Basic Statistics (Mean, Median, Mode)
                            </label>
                        </div>
                        <div class="option-group">
                            <label>
                                <input type="checkbox" id="distribution">
                                Data Distribution
                            </label>
                        </div>
                        <div class="option-group">
                            <label>
                                <input type="checkbox" id="correlation">
                                Correlation Analysis
                            </label>
                        </div>
                        <div class="option-group">
                            <label>
                                <input type="checkbox" id="outliers">
                                Outlier Detection
                            </label>
                        </div>
                    </div>
                    
                    <div class="result-area" id="analysisResult">
                        <p>Upload data to see analysis results</p>
                    </div>
                    
                    <button class="btn btn-primary" id="analyzeBtn" style="display: none;">
                        Run Analysis
                    </button>
                    <button class="btn btn-download" id="downloadAnalysisBtn" style="display: none;">
                        Download Report
                    </button>
                </div>
            `
        },
        'duplicate-remover': {
            title: 'Duplicate Remover',
            content: `
                <div class="tool-interface">
                    <div class="file-upload-area" onclick="document.getElementById('duplicateFileInput').click()">
                        <div class="upload-icon">🧹</div>
                        <h3>Upload File to Clean</h3>
                        <p>Remove duplicate rows from your data</p>
                        <input type="file" id="duplicateFileInput" class="file-input" accept=".xlsx,.xls,.csv">
                    </div>
                    
                    <div class="duplicate-options">
                        <h4>Duplicate Detection Options</h4>
                        
                        <div class="option-group">
                            <label>
                                <input type="radio" name="duplicateMethod" value="exact" checked>
                                Exact Match (all columns must match)
                            </label>
                        </div>
                        
                        <div class="option-group">
                            <label>
                                <input type="radio" name="duplicateMethod" value="key">
                                Key Column Match
                            </label>
                            <select id="keyColumn" style="margin-left: 20px; display: none;">
                                <option value="">Select Key Column</option>
                            </select>
                        </div>
                        
                        <div class="option-group">
                            <label>
                                <input type="checkbox" id="caseInsensitive">
                                Case Insensitive Matching
                            </label>
                        </div>
                        
                        <div class="option-group">
                            <label>
                                <input type="checkbox" id="keepFirst" checked>
                                Keep First Occurrence
                            </label>
                        </div>
                    </div>
                    
                    <div class="result-area" id="duplicateResult">
                        <p>Upload a file to start duplicate removal</p>
                    </div>
                    
                    <button class="btn btn-primary" id="removeDuplicatesBtn" style="display: none;">
                        Remove Duplicates
                    </button>
                    <button class="btn btn-download" id="downloadCleanBtn" style="display: none;">
                        Download Clean Data
                    </button>
                </div>
            `
        },
        'merge-tool': {
            title: 'Merge Tool',
            content: `
                <div class="tool-interface">
                    <div class="file-upload-area" onclick="document.getElementById('mergeFileInput').click()">
                        <div class="upload-icon">🔗</div>
                        <h3>Upload Files to Merge</h3>
                        <p>Select multiple Excel or CSV files</p>
                        <input type="file" id="mergeFileInput" class="file-input" accept=".xlsx,.xls,.csv" multiple>
                    </div>
                    
                    <div class="merge-options">
                        <h4>Merge Options</h4>
                        
                        <div class="option-group">
                            <label>Merge Type:</label>
                            <select id="mergeType">
                                <option value="append">Append Rows (Stack vertically)</option>
                                <option value="join">Join Columns (Merge horizontally)</option>
                            </select>
                        </div>
                        
                        <div class="option-group">
                            <label>
                                <input type="checkbox" id="addSource" checked>
                                Add Source File Column
                            </label>
                        </div>
                        
                        <div class="option-group">
                            <label>
                                <input type="checkbox" id="alignHeaders" checked>
                                Align Headers
                            </label>
                        </div>
                    </div>
                    
                    <div class="file-list" id="fileList" style="display: none;">
                        <h4>Selected Files:</h4>
                        <ul id="selectedFiles"></ul>
                    </div>
                    
                    <div class="result-area" id="mergeResult">
                        <p>Upload files to see merge preview</p>
                    </div>
                    
                    <button class="btn btn-primary" id="mergeBtn" style="display: none;">
                        Merge Files
                    </button>
                    <button class="btn btn-download" id="downloadMergedBtn" style="display: none;">
                        Download Merged File
                    </button>
                </div>
            `
        }
    };
    
    return tools[toolName] || { title: 'Tool', content: '<p>Tool not found</p>' };
}

function initToolFunctionality(toolName) {
    switch (toolName) {
        case 'csv-converter':
            if (window.csvConverter) window.csvConverter.init();
            break;
        case 'data-formatter':
            if (window.dataFormatter) window.dataFormatter.init();
            break;
        case 'formula-generator':
            if (window.formulaGenerator) window.formulaGenerator.init();
            break;
        case 'data-analyzer':
            if (window.dataAnalyzer) window.dataAnalyzer.init();
            break;
        case 'duplicate-remover':
            if (window.duplicateRemover) window.duplicateRemover.init();
            break;
        case 'merge-tool':
            if (window.mergeTool) window.mergeTool.init();
            break;
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: var(--color-${type === 'success' ? 'success' : type === 'error' ? 'error' : 'primary'});
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

// Make showNotification globally available
window.showNotification = showNotification;

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === toolModal) {
        closeModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && toolModal.style.display === 'block') {
        closeModal();
    }
});