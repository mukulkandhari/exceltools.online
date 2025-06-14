// Excel Formula Translator
class ExcelFormulaTranslator {
    constructor() {
        this.sourceFormulaInput = null;
        this.targetFormulaInput = null;
        this.sourceLanguageSelect = null;
        this.targetLanguageSelect = null;
        this.translationResults = null;
        
        // Language configurations
        this.languageConfig = {
            en: { decimal: '.', list: ',', name: 'English' },
            de: { decimal: ',', list: ';', name: 'German' },
            fr: { decimal: ',', list: ';', name: 'French' },
            es: { decimal: ',', list: ';', name: 'Spanish' },
            it: { decimal: ',', list: ';', name: 'Italian' },
            pt: { decimal: ',', list: ';', name: 'Portuguese' },
            nl: { decimal: ',', list: ';', name: 'Dutch' },
            sv: { decimal: ',', list: ';', name: 'Swedish' },
            da: { decimal: ',', list: ';', name: 'Danish' },
            no: { decimal: ',', list: ';', name: 'Norwegian' },
            fi: { decimal: ',', list: ';', name: 'Finnish' },
            pl: { decimal: ',', list: ';', name: 'Polish' },
            ru: { decimal: ',', list: ';', name: 'Russian' },
            ja: { decimal: '.', list: ',', name: 'Japanese' },
            ko: { decimal: '.', list: ',', name: 'Korean' },
            zh: { decimal: '.', list: ',', name: 'Chinese' }
        };
        
        // Function translation mappings
        this.functionMappings = this.initializeFunctionMappings();
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
    }

    setupElements() {
        this.sourceFormulaInput = document.getElementById('sourceFormula');
        this.targetFormulaInput = document.getElementById('targetFormula');
        this.sourceLanguageSelect = document.getElementById('sourceLanguage');
        this.targetLanguageSelect = document.getElementById('targetLanguage');
        this.translationResults = document.getElementById('translationResults');
        
        // Error and success elements
        this.sourceError = document.getElementById('sourceError');
        this.translationSuccess = document.getElementById('translationSuccess');
        
        // Result elements
        this.functionsCount = document.getElementById('functionsCount');
        this.separatorChanged = document.getElementById('separatorChanged');
        this.decimalSeparator = document.getElementById('decimalSeparator');
        this.listSeparator = document.getElementById('listSeparator');
    }

    setupEventListeners() {
        // Real-time validation on input
        this.sourceFormulaInput.addEventListener('input', () => {
            this.validateFormula();
        });

        // Language change listeners
        this.sourceLanguageSelect.addEventListener('change', () => {
            this.updateLanguageInfo();
        });

        this.targetLanguageSelect.addEventListener('change', () => {
            this.updateLanguageInfo();
        });

        // Clear errors on focus
        this.sourceFormulaInput.addEventListener('focus', () => {
            this.clearError();
        });
    }

    initializeFunctionMappings() {
        return {
            // Math functions
            'SUM': { en: 'SUM', de: 'SUMME', fr: 'SOMME', es: 'SUMA', it: 'SOMMA', pt: 'SOMA', nl: 'SOM', sv: 'SUMMA', da: 'SUM', no: 'SUM', fi: 'SUMMA', pl: 'SUMA', ru: 'СУММ', ja: 'SUM', ko: 'SUM', zh: 'SUM' },
            'AVERAGE': { en: 'AVERAGE', de: 'MITTELWERT', fr: 'MOYENNE', es: 'PROMEDIO', it: 'MEDIA', pt: 'MÉDIA', nl: 'GEMIDDELDE', sv: 'MEDEL', da: 'MIDDEL', no: 'GJENNOMSNITT', fi: 'KESKIARVO', pl: 'ŚREDNIA', ru: 'СРЗНАЧ', ja: 'AVERAGE', ko: 'AVERAGE', zh: 'AVERAGE' },
            'COUNT': { en: 'COUNT', de: 'ANZAHL', fr: 'NB', es: 'CONTAR', it: 'CONTA.NUMERI', pt: 'CONTAR', nl: 'AANTAL', sv: 'ANTAL', da: 'TÆL', no: 'ANTALL', fi: 'LASKE', pl: 'LICZ', ru: 'СЧЁТ', ja: 'COUNT', ko: 'COUNT', zh: 'COUNT' },
            'COUNTA': { en: 'COUNTA', de: 'ANZAHL2', fr: 'NBVAL', es: 'CONTARA', it: 'CONTA.VALORI', pt: 'CONTARA', nl: 'AANTALARG', sv: 'ANTALV', da: 'TÆLV', no: 'ANTALLV', fi: 'LASKEA', pl: 'LICZ.NIEPUSTE', ru: 'СЧЁТЗ', ja: 'COUNTA', ko: 'COUNTA', zh: 'COUNTA' },
            'MAX': { en: 'MAX', de: 'MAX', fr: 'MAX', es: 'MAX', it: 'MAX', pt: 'MÁXIMO', nl: 'MAX', sv: 'MAX', da: 'MAKS', no: 'MAKS', fi: 'MAKS', pl: 'MAX', ru: 'МАКС', ja: 'MAX', ko: 'MAX', zh: 'MAX' },
            'MIN': { en: 'MIN', de: 'MIN', fr: 'MIN', es: 'MIN', it: 'MIN', pt: 'MÍNIMO', nl: 'MIN', sv: 'MIN', da: 'MIN', no: 'MIN', fi: 'MIN', pl: 'MIN', ru: 'МИН', ja: 'MIN', ko: 'MIN', zh: 'MIN' },
            
            // Logical functions
            'IF': { en: 'IF', de: 'WENN', fr: 'SI', es: 'SI', it: 'SE', pt: 'SE', nl: 'ALS', sv: 'OM', da: 'HVIS', no: 'HVIS', fi: 'JOS', pl: 'JEŻELI', ru: 'ЕСЛИ', ja: 'IF', ko: 'IF', zh: 'IF' },
            'AND': { en: 'AND', de: 'UND', fr: 'ET', es: 'Y', it: 'E', pt: 'E', nl: 'EN', sv: 'OCH', da: 'OG', no: 'OG', fi: 'JA', pl: 'I', ru: 'И', ja: 'AND', ko: 'AND', zh: 'AND' },
            'OR': { en: 'OR', de: 'ODER', fr: 'OU', es: 'O', it: 'O', pt: 'OU', nl: 'OF', sv: 'ELLER', da: 'ELLER', no: 'ELLER', fi: 'TAI', pl: 'LUB', ru: 'ИЛИ', ja: 'OR', ko: 'OR', zh: 'OR' },
            'NOT': { en: 'NOT', de: 'NICHT', fr: 'NON', es: 'NO', it: 'NON', pt: 'NÃO', nl: 'NIET', sv: 'ICKE', da: 'IKKE', no: 'IKKE', fi: 'EI', pl: 'NIE', ru: 'НЕ', ja: 'NOT', ko: 'NOT', zh: 'NOT' },
            
            // Lookup functions
            'VLOOKUP': { en: 'VLOOKUP', de: 'SVERWEIS', fr: 'RECHERCHEV', es: 'BUSCARV', it: 'CERCA.VERT', pt: 'PROCV', nl: 'VERT.ZOEKEN', sv: 'LETARAD', da: 'LOPSLAG', no: 'FINN.RAD', fi: 'PYSTYETSINTÄ', pl: 'WYSZUKAJ.PIONOWO', ru: 'ВПР', ja: 'VLOOKUP', ko: 'VLOOKUP', zh: 'VLOOKUP' },
            'HLOOKUP': { en: 'HLOOKUP', de: 'WVERWEIS', fr: 'RECHERCHEH', es: 'BUSCARH', it: 'CERCA.ORIZZ', pt: 'PROCH', nl: 'HORIZ.ZOEKEN', sv: 'LETAKOL', da: 'VOPSLAG', no: 'FINN.KOL', fi: 'VAAKAETSINTÄ', pl: 'WYSZUKAJ.POZIOMO', ru: 'ГПР', ja: 'HLOOKUP', ko: 'HLOOKUP', zh: 'HLOOKUP' },
            'INDEX': { en: 'INDEX', de: 'INDEX', fr: 'INDEX', es: 'INDICE', it: 'INDICE', pt: 'ÍNDICE', nl: 'INDEX', sv: 'INDEX', da: 'INDEKS', no: 'INDEKS', fi: 'INDEKSI', pl: 'INDEKS', ru: 'ИНДЕКС', ja: 'INDEX', ko: 'INDEX', zh: 'INDEX' },
            'MATCH': { en: 'MATCH', de: 'VERGLEICH', fr: 'EQUIV', es: 'COINCIDIR', it: 'CONFRONTA', pt: 'CORRESP', nl: 'VERGELIJKEN', sv: 'JÄMFÖR', da: 'SAMMENLIGN', no: 'SAMMENLIGN', fi: 'VASTINE', pl: 'PODAJ.POZYCJĘ', ru: 'ПОИСКПОЗ', ja: 'MATCH', ko: 'MATCH', zh: 'MATCH' },
            
            // Text functions
            'CONCATENATE': { en: 'CONCATENATE', de: 'VERKETTEN', fr: 'CONCATENER', es: 'CONCATENAR', it: 'CONCATENA', pt: 'CONCATENAR', nl: 'TEKST.SAMENVOEGEN', sv: 'SAMMANFOGA', da: 'SAMMENKÆD', no: 'KJEDE.SAMMEN', fi: 'KETJUTA', pl: 'ZŁĄCZ.TEKST', ru: 'СЦЕПИТЬ', ja: 'CONCATENATE', ko: 'CONCATENATE', zh: 'CONCATENATE' },
            'LEFT': { en: 'LEFT', de: 'LINKS', fr: 'GAUCHE', es: 'IZQUIERDA', it: 'SINISTRA', pt: 'ESQUERDA', nl: 'LINKS', sv: 'VÄNSTER', da: 'VENSTRE', no: 'VENSTRE', fi: 'VASEN', pl: 'LEWY', ru: 'ЛЕВСИМВ', ja: 'LEFT', ko: 'LEFT', zh: 'LEFT' },
            'RIGHT': { en: 'RIGHT', de: 'RECHTS', fr: 'DROITE', es: 'DERECHA', it: 'DESTRA', pt: 'DIREITA', nl: 'RECHTS', sv: 'HÖGER', da: 'HØJRE', no: 'HØYRE', fi: 'OIKEA', pl: 'PRAWY', ru: 'ПРАВСИМВ', ja: 'RIGHT', ko: 'RIGHT', zh: 'RIGHT' },
            'MID': { en: 'MID', de: 'TEIL', fr: 'STXT', es: 'EXTRAE', it: 'STRINGA.ESTRAI', pt: 'EXT.TEXTO', nl: 'DEEL', sv: 'EXTEXT', da: 'MIDT', no: 'MIDT', fi: 'POIMI', pl: 'CZĘŚĆ', ru: 'ПСТР', ja: 'MID', ko: 'MID', zh: 'MID' },
            'LEN': { en: 'LEN', de: 'LÄNGE', fr: 'NBCAR', es: 'LARGO', it: 'LUNGHEZZA', pt: 'NÚM.CARACT', nl: 'LENGTE', sv: 'LÄNGD', da: 'LÆNGDE', no: 'LENGDE', fi: 'PITUUS', pl: 'DŁUGOŚĆ', ru: 'ДЛСТР', ja: 'LEN', ko: 'LEN', zh: 'LEN' },
            
            // Date functions
            'TODAY': { en: 'TODAY', de: 'HEUTE', fr: 'AUJOURDHUI', es: 'HOY', it: 'OGGI', pt: 'HOJE', nl: 'VANDAAG', sv: 'IDAG', da: 'IDAG', no: 'IDAG', fi: 'TÄNÄÄN', pl: 'DZIŚ', ru: 'СЕГОДНЯ', ja: 'TODAY', ko: 'TODAY', zh: 'TODAY' },
            'NOW': { en: 'NOW', de: 'JETZT', fr: 'MAINTENANT', es: 'AHORA', it: 'ADESSO', pt: 'AGORA', nl: 'NU', sv: 'NU', da: 'NU', no: 'NÅ', fi: 'NYT', pl: 'TERAZ', ru: 'ТДАТА', ja: 'NOW', ko: 'NOW', zh: 'NOW' },
            'DATE': { en: 'DATE', de: 'DATUM', fr: 'DATE', es: 'FECHA', it: 'DATA', pt: 'DATA', nl: 'DATUM', sv: 'DATUM', da: 'DATO', no: 'DATO', fi: 'PÄIVÄYS', pl: 'DATA', ru: 'ДАТА', ja: 'DATE', ko: 'DATE', zh: 'DATE' },
            'YEAR': { en: 'YEAR', de: 'JAHR', fr: 'ANNEE', es: 'AÑO', it: 'ANNO', pt: 'ANO', nl: 'JAAR', sv: 'ÅR', da: 'ÅR', no: 'ÅR', fi: 'VUOSI', pl: 'ROK', ru: 'ГОД', ja: 'YEAR', ko: 'YEAR', zh: 'YEAR' },
            'MONTH': { en: 'MONTH', de: 'MONAT', fr: 'MOIS', es: 'MES', it: 'MESE', pt: 'MÊS', nl: 'MAAND', sv: 'MÅNAD', da: 'MÅNED', no: 'MÅNED', fi: 'KUUKAUSI', pl: 'MIESIĄC', ru: 'МЕСЯЦ', ja: 'MONTH', ko: 'MONTH', zh: 'MONTH' },
            'DAY': { en: 'DAY', de: 'TAG', fr: 'JOUR', es: 'DIA', it: 'GIORNO', pt: 'DIA', nl: 'DAG', sv: 'DAG', da: 'DAG', no: 'DAG', fi: 'PÄIVÄ', pl: 'DZIEŃ', ru: 'ДЕНЬ', ja: 'DAY', ko: 'DAY', zh: 'DAY' },
            
            // Conditional functions
            'SUMIF': { en: 'SUMIF', de: 'SUMMEWENN', fr: 'SOMME.SI', es: 'SUMAR.SI', it: 'SOMMA.SE', pt: 'SOMASE', nl: 'SOM.ALS', sv: 'SUMMA.OM', da: 'SUM.HVIS', no: 'SUM.HVIS', fi: 'SUMMA.JOS', pl: 'SUMA.JEŻELI', ru: 'СУММЕСЛИ', ja: 'SUMIF', ko: 'SUMIF', zh: 'SUMIF' },
            'COUNTIF': { en: 'COUNTIF', de: 'ZÄHLENWENN', fr: 'NB.SI', es: 'CONTAR.SI', it: 'CONTA.SE', pt: 'CONT.SE', nl: 'AANTAL.ALS', sv: 'ANTAL.OM', da: 'TÆL.HVIS', no: 'ANTALL.HVIS', fi: 'LASKE.JOS', pl: 'LICZ.JEŻELI', ru: 'СЧЁТЕСЛИ', ja: 'COUNTIF', ko: 'COUNTIF', zh: 'COUNTIF' },
            'AVERAGEIF': { en: 'AVERAGEIF', de: 'MITTELWERTWENN', fr: 'MOYENNE.SI', es: 'PROMEDIO.SI', it: 'MEDIA.SE', pt: 'MÉDIASE', nl: 'GEMIDDELDE.ALS', sv: 'MEDEL.OM', da: 'MIDDEL.HVIS', no: 'GJENNOMSNITT.HVIS', fi: 'KESKIARVO.JOS', pl: 'ŚREDNIA.JEŻELI', ru: 'СРЗНАЧЕСЛИ', ja: 'AVERAGEIF', ko: 'AVERAGEIF', zh: 'AVERAGEIF' },
            
            // Additional common functions
            'ROUND': { en: 'ROUND', de: 'RUNDEN', fr: 'ARRONDI', es: 'REDONDEAR', it: 'ARROTONDA', pt: 'ARRED', nl: 'AFRONDEN', sv: 'AVRUNDA', da: 'AFRUND', no: 'AVRUND', fi: 'PYÖRISTÄ', pl: 'ZAOKR', ru: 'ОКРУГЛ', ja: 'ROUND', ko: 'ROUND', zh: 'ROUND' },
            'ABS': { en: 'ABS', de: 'ABS', fr: 'ABS', es: 'ABS', it: 'ASS', pt: 'ABS', nl: 'ABS', sv: 'ABS', da: 'ABS', no: 'ABS', fi: 'ITSEISARVO', pl: 'MODUŁ', ru: 'ABS', ja: 'ABS', ko: 'ABS', zh: 'ABS' },
            'SQRT': { en: 'SQRT', de: 'WURZEL', fr: 'RACINE', es: 'RAIZ', it: 'RADQ', pt: 'RAIZQ', nl: 'WORTEL', sv: 'ROT', da: 'ROD', no: 'ROT', fi: 'NELIÖJUURI', pl: 'PIERWIASTEK', ru: 'КОРЕНЬ', ja: 'SQRT', ko: 'SQRT', zh: 'SQRT' },
            'POWER': { en: 'POWER', de: 'POTENZ', fr: 'PUISSANCE', es: 'POTENCIA', it: 'POTENZA', pt: 'POTÊNCIA', nl: 'MACHT', sv: 'UPPHÖJT', da: 'POTENS', no: 'POTENS', fi: 'POTENSSI', pl: 'POTĘGA', ru: 'СТЕПЕНЬ', ja: 'POWER', ko: 'POWER', zh: 'POWER' }
        };
    }

    validateFormula() {
        const formula = this.sourceFormulaInput.value.trim();
        
        // Clear previous states
        this.clearError();
        this.clearSuccess();
        
        if (!formula) {
            this.hideResults();
            return true;
        }

        // Basic validation
        if (!formula.startsWith('=')) {
            this.showError('Formula must start with = sign');
            return false;
        }

        // Check for balanced parentheses
        if (!this.checkBalancedParentheses(formula)) {
            this.showError('Unmatched parentheses in formula');
            return false;
        }

        // Check for basic syntax issues
        if (!this.checkBasicSyntax(formula)) {
            this.showError('Invalid formula syntax');
            return false;
        }

        return true;
    }

    checkBalancedParentheses(formula) {
        let count = 0;
        let inString = false;
        let stringChar = null;

        for (let i = 0; i < formula.length; i++) {
            const char = formula[i];
            
            // Handle string literals
            if ((char === '"' || char === "'") && !inString) {
                inString = true;
                stringChar = char;
                continue;
            }
            
            if (char === stringChar && inString) {
                // Check if it's escaped
                if (i + 1 < formula.length && formula[i + 1] === stringChar) {
                    i++; // Skip escaped quote
                    continue;
                }
                inString = false;
                stringChar = null;
                continue;
            }

            if (!inString) {
                if (char === '(') count++;
                if (char === ')') count--;
                if (count < 0) return false;
            }
        }

        return count === 0;
    }

    checkBasicSyntax(formula) {
        // Remove string literals for syntax checking
        const cleanFormula = this.removeStringLiterals(formula);
        
        // Check for invalid characters or patterns
        const invalidPatterns = [
            /[{}[\]]/,  // Invalid brackets
            /\(\s*\)/,  // Empty parentheses
            /[,;]\s*[,;]/,  // Consecutive separators
            /[,;]\s*\)/,  // Separator before closing parenthesis
            /\(\s*[,;]/   // Separator after opening parenthesis
        ];

        return !invalidPatterns.some(pattern => pattern.test(cleanFormula));
    }

    removeStringLiterals(formula) {
        return formula.replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''");
    }

    translateFormula() {
        if (!this.validateFormula()) {
            return;
        }

        const sourceFormula = this.sourceFormulaInput.value.trim();
        if (!sourceFormula) {
            this.showError('Please enter a formula to translate');
            return;
        }

        const sourceLang = this.sourceLanguageSelect.value;
        const targetLang = this.targetLanguageSelect.value;

        if (sourceLang === targetLang) {
            this.showError('Source and target languages must be different');
            return;
        }

        try {
            const translationResult = this.performTranslation(sourceFormula, sourceLang, targetLang);
            this.displayTranslationResult(translationResult);
        } catch (error) {
            this.showError(`Translation failed: ${error.message}`);
        }
    }

    performTranslation(formula, sourceLang, targetLang) {
        let translatedFormula = formula;
        let functionsTranslated = 0;
        const translatedFunctions = [];

        // Extract and translate function names
        const functionRegex = /\b([A-Z][A-Z0-9_]*)\s*\(/gi;
        const matches = [...formula.matchAll(functionRegex)];

        for (const match of matches) {
            const originalFunction = match[1].toUpperCase();
            const mapping = this.functionMappings[originalFunction];

            if (mapping && mapping[sourceLang] && mapping[targetLang]) {
                const sourceFunction = mapping[sourceLang];
                const targetFunction = mapping[targetLang];

                // Replace function name (case-insensitive)
                const regex = new RegExp(`\\b${this.escapeRegex(sourceFunction)}\\b`, 'gi');
                translatedFormula = translatedFormula.replace(regex, targetFunction);
                
                functionsTranslated++;
                translatedFunctions.push({
                    original: sourceFunction,
                    translated: targetFunction
                });
            }
        }

        // Translate separators
        const sourceConfig = this.languageConfig[sourceLang];
        const targetConfig = this.languageConfig[targetLang];
        let separatorChanged = false;

        if (sourceConfig.list !== targetConfig.list) {
            // Replace list separators (but not in string literals)
            translatedFormula = this.replaceSeparators(
                translatedFormula, 
                sourceConfig.list, 
                targetConfig.list
            );
            separatorChanged = true;
        }

        if (sourceConfig.decimal !== targetConfig.decimal) {
            // Replace decimal separators in numbers
            translatedFormula = this.replaceDecimalSeparators(
                translatedFormula,
                sourceConfig.decimal,
                targetConfig.decimal
            );
            separatorChanged = true;
        }

        return {
            originalFormula: formula,
            translatedFormula: translatedFormula,
            functionsTranslated: functionsTranslated,
            translatedFunctions: translatedFunctions,
            separatorChanged: separatorChanged,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
            sourceConfig: sourceConfig,
            targetConfig: targetConfig
        };
    }

    replaceSeparators(formula, oldSep, newSep) {
        if (oldSep === newSep) return formula;

        let result = '';
        let inString = false;
        let stringChar = null;

        for (let i = 0; i < formula.length; i++) {
            const char = formula[i];

            // Handle string literals
            if ((char === '"' || char === "'") && !inString) {
                inString = true;
                stringChar = char;
                result += char;
                continue;
            }

            if (char === stringChar && inString) {
                // Check if it's escaped
                if (i + 1 < formula.length && formula[i + 1] === stringChar) {
                    result += char + char;
                    i++; // Skip escaped quote
                    continue;
                }
                inString = false;
                stringChar = null;
                result += char;
                continue;
            }

            // Replace separator only outside strings
            if (!inString && char === oldSep) {
                result += newSep;
            } else {
                result += char;
            }
        }

        return result;
    }

    replaceDecimalSeparators(formula, oldSep, newSep) {
        if (oldSep === newSep) return formula;

        // Match numbers with decimal separators (not in strings)
        const numberRegex = new RegExp(`\\b\\d+\\${this.escapeRegex(oldSep)}\\d+\\b`, 'g');
        return formula.replace(numberRegex, (match) => {
            return match.replace(oldSep, newSep);
        });
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    displayTranslationResult(result) {
        // Update target formula
        this.targetFormulaInput.value = result.translatedFormula;
        this.targetFormulaInput.classList.add('success');

        // Update result details
        this.functionsCount.textContent = result.functionsTranslated;
        this.separatorChanged.textContent = result.separatorChanged ? 'Yes' : 'No';
        this.decimalSeparator.textContent = result.targetConfig.decimal;
        this.listSeparator.textContent = result.targetConfig.list;

        // Show success message
        this.showSuccess(`Formula translated successfully from ${result.sourceConfig.name} to ${result.targetConfig.name}`);

        // Show results section
        this.showResults();
    }

    showResults() {
        this.translationResults.style.display = 'block';
    }

    hideResults() {
        this.translationResults.style.display = 'none';
    }

    showError(message) {
        this.sourceError.textContent = message;
        this.sourceError.style.display = 'block';
        this.sourceFormulaInput.classList.add('error');
    }

    clearError() {
        this.sourceError.style.display = 'none';
        this.sourceFormulaInput.classList.remove('error');
    }

    showSuccess(message) {
        this.translationSuccess.textContent = message;
        this.translationSuccess.style.display = 'block';
    }

    clearSuccess() {
        this.translationSuccess.style.display = 'none';
        this.targetFormulaInput.classList.remove('success');
    }

    updateLanguageInfo() {
        const targetLang = this.targetLanguageSelect.value;
        const config = this.languageConfig[targetLang];
        
        if (config) {
            this.decimalSeparator.textContent = config.decimal;
            this.listSeparator.textContent = config.list;
        }
    }
}

// Global functions
function swapLanguages() {
    const sourceSelect = document.getElementById('sourceLanguage');
    const targetSelect = document.getElementById('targetLanguage');
    
    const tempValue = sourceSelect.value;
    sourceSelect.value = targetSelect.value;
    targetSelect.value = tempValue;
    
    // Update language info
    if (window.formulaTranslator) {
        window.formulaTranslator.updateLanguageInfo();
    }
    
    // Visual feedback
    const swapBtn = document.querySelector('.swap-languages-btn');
    swapBtn.style.transform = 'rotate(180deg)';
    setTimeout(() => {
        swapBtn.style.transform = '';
    }, 300);
}

function translateFormula() {
    if (window.formulaTranslator) {
        window.formulaTranslator.translateFormula();
    }
}

function clearFormulas() {
    const sourceInput = document.getElementById('sourceFormula');
    const targetInput = document.getElementById('targetFormula');
    
    sourceInput.value = '';
    targetInput.value = '';
    
    if (window.formulaTranslator) {
        window.formulaTranslator.clearError();
        window.formulaTranslator.clearSuccess();
        window.formulaTranslator.hideResults();
    }
    
    showNotification('Formulas cleared', 'info');
}

function loadExample(formula) {
    const sourceInput = document.getElementById('sourceFormula');
    sourceInput.value = formula;
    
    if (window.formulaTranslator) {
        window.formulaTranslator.validateFormula();
    }
    
    showNotification('Example formula loaded', 'success');
}

function copyTranslatedFormula() {
    const targetInput = document.getElementById('targetFormula');
    const formula = targetInput.value;
    
    if (!formula) {
        showNotification('No translated formula to copy', 'error');
        return;
    }
    
    navigator.clipboard.writeText(formula).then(() => {
        showNotification('Translated formula copied to clipboard!', 'success');
        
        // Visual feedback
        const btn = document.querySelector('.copy-result-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        btn.style.background = 'var(--status-success)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        targetInput.select();
        document.execCommand('copy');
        showNotification('Translated formula copied to clipboard!', 'success');
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

// Initialize the translator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.formulaTranslator = new ExcelFormulaTranslator();
});