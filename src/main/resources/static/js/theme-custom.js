/**
 * Utilitários de personalização de tema com suporte a pré-visualização e persistência.
 *
 * Palette JSON example:
 * {
 *   "primary":"#0d6efd",
 *   "secondary":"#6c757d",
 *   "bg":"#ffffff",
 *   "text":"#212529",
 *   "border":"#dee2e6",
 *   "success":"#198754",
 *   "warning":"#ffc107",
 *   "danger":"#dc3545",
 *   "info":"#0dcaf0"
 * }
 */
(function () {
    'use strict';

    const STORAGE_KEYS = {
        theme: 'app.theme',
        palette: 'app.palette'
    };

    const COLOR_KEYS = ['primary', 'secondary', 'bg', 'text', 'border', 'success', 'warning', 'danger', 'info'];

    const DEFAULT_PALETTE = {
        primary: '#0d6efd',
        secondary: '#6c757d',
        bg: '#ffffff',
        text: '#212529',
        border: '#dee2e6',
        success: '#198754',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#0dcaf0'
    };

    const DARK_PALETTE = {
        primary: '#4dabf7',
        secondary: '#868e96',
        bg: '#0f172a',
        text: '#e2e8f0',
        border: '#334155',
        success: '#27c593',
        warning: '#eab308',
        danger: '#f87171',
        info: '#38bdf8'
    };

    const htmlElement = document.documentElement;

    const storage = {
        get(key) {
            try {
                return window.localStorage.getItem(key);
            } catch (err) {
                console.warn('[theme-custom] Falha ao acessar localStorage:', err);
                return null;
            }
        },
        set(key, value) {
            try {
                window.localStorage.setItem(key, value);
            } catch (err) {
                console.warn('[theme-custom] Falha ao persistir em localStorage:', err);
            }
        },
        remove(key) {
            try {
                window.localStorage.removeItem(key);
            } catch (err) {
                console.warn('[theme-custom] Falha ao remover item do localStorage:', err);
            }
        }
    };

    let customPaletteState = { ...DEFAULT_PALETTE };
    let activeTheme = 'light';
    let previewTimer = null;
    let feedbackTimer = null;

    const dom = {
        root: null,
        colorInputs: [],
        themeRadios: [],
        previewButton: null,
        saveButton: null,
        resetButton: null,
        warningBox: null,
        feedbackBox: null
    };

    document.addEventListener('DOMContentLoaded', initializeThemeControls);

    function initializeThemeControls() {
        const root = document.querySelector('[data-theme-controls]');
        if (!root) {
            return;
        }

        dom.root = root;
        dom.colorInputs = Array.from(root.querySelectorAll('[data-color-key]'));
        dom.themeRadios = Array.from(root.querySelectorAll('input[name="theme-option"]'));
        dom.previewButton = root.querySelector('[data-theme-preview]');
        dom.saveButton = root.querySelector('[data-theme-save]');
        dom.resetButton = root.querySelector('[data-theme-reset]');
        dom.warningBox = root.querySelector('[data-theme-warning]');
        dom.feedbackBox = root.querySelector('[data-theme-feedback]');

        const stored = loadThemeFromStorage();
        const storedPalette = stored.palette ? normalizePalette(stored.palette) : normalizePalette(DEFAULT_PALETTE);
        customPaletteState = storedPalette;

        reflectPaletteInputs(customPaletteState);

        let initialTheme = stored.theme;
        if (!isRecognizedTheme(initialTheme)) {
            initialTheme = getPreferredTheme();
        }
        if (initialTheme === 'custom' && !stored.palette) {
            initialTheme = getPreferredTheme();
        }

        applyTheme(initialTheme, {
            palette: initialTheme === 'custom' ? customPaletteState : undefined,
            persist: false
        });

        wireEvents();
    }

    function isRecognizedTheme(theme) {
        return theme === 'light' || theme === 'dark' || theme === 'custom';
    }

    function loadThemeFromStorage() {
        const storedTheme = storage.get(STORAGE_KEYS.theme);
        let palette = null;
        const rawPalette = storage.get(STORAGE_KEYS.palette);
        if (rawPalette) {
            try {
                palette = JSON.parse(rawPalette);
            } catch (err) {
                console.warn('[theme-custom] Falha ao interpretar paleta armazenada:', err);
                palette = null;
            }
        }
        return {
            theme: isRecognizedTheme(storedTheme) ? storedTheme : null,
            palette
        };
    }

    function wireEvents() {
        dom.themeRadios.forEach((radio) => {
            radio.addEventListener('change', (event) => {
                if (!event.target.checked) {
                    return;
                }
                handleThemeSelection(event.target.value);
            });
        });

        dom.colorInputs.forEach((input) => {
            input.addEventListener('input', () => {
                if (activeTheme !== 'custom') {
                    return;
                }
                previewPalette(getPaletteFromInputs());
            });
            input.addEventListener('change', () => {
                if (activeTheme !== 'custom') {
                    return;
                }
                previewPalette(getPaletteFromInputs());
            });
        });

        if (dom.previewButton) {
            dom.previewButton.addEventListener('click', (event) => {
                event.preventDefault();
                if (activeTheme !== 'custom') {
                    return;
                }
                previewPalette(getPaletteFromInputs(), { immediate: true });
                showFeedback('Pré-visualização aplicada.', 'info');
            });
        }

        if (dom.saveButton) {
            dom.saveButton.addEventListener('click', (event) => {
                event.preventDefault();
                if (activeTheme !== 'custom') {
                    handleThemeSelection('custom');
                }
                const palette = getPaletteFromInputs();
                applyTheme('custom', { palette, persist: true });
                showFeedback('Paleta personalizada salva com sucesso.', 'success');
            });
        }

        if (dom.resetButton) {
            dom.resetButton.addEventListener('click', (event) => {
                event.preventDefault();
                resetToDefault();
            });
        }
    }

    function handleThemeSelection(themeName) {
        if (!isRecognizedTheme(themeName)) {
            return;
        }
        if (themeName === 'custom') {
            applyTheme('custom', { palette: getPaletteFromInputs(), persist: false });
            showFeedback('Editando paleta personalizada. Lembre-se de salvar.', 'info');
            return;
        }
        applyTheme(themeName, { persist: true });
        showFeedback(`Tema ${themeName === 'dark' ? 'escuro' : 'claro'} aplicado.`, 'success');
    }

    function applyTheme(themeName, options = {}) {
        const theme = isRecognizedTheme(themeName) ? themeName : 'light';
        const shouldPersist = Boolean(options.persist);
        let appliedPalette;

        if (theme === 'custom') {
            appliedPalette = applyPalette(options.palette || customPaletteState, { theme: 'custom' });
            customPaletteState = appliedPalette;
            const scheme = inferScheme(appliedPalette);
            htmlElement.setAttribute('data-theme', 'custom');
            htmlElement.setAttribute('data-bs-theme', scheme);
            if (shouldPersist) {
                saveTheme('custom');
                savePalette(appliedPalette);
            }
        } else {
            const fallbackPalette = theme === 'dark' ? DARK_PALETTE : DEFAULT_PALETTE;
            appliedPalette = applyPalette(fallbackPalette, { theme });
            htmlElement.setAttribute('data-theme', theme);
            htmlElement.setAttribute('data-bs-theme', theme);
            if (shouldPersist) {
                saveTheme(theme);
            }
        }

        activeTheme = theme;
        updateControlState(theme);
        return appliedPalette;
    }

    function applyPalette(palette, options = {}) {
        const theme = options.theme || 'custom';
        const normalized = normalizePalette(palette);
        const vars = buildCssVariables(normalized);
        Object.entries(vars).forEach(([property, value]) => {
            htmlElement.style.setProperty(property, value);
        });

        if (theme === 'custom' && options.commitState !== false) {
            customPaletteState = normalized;
        }

        if (theme === 'custom') {
            renderWarnings(validateContrast(normalized));
            reflectPaletteInputs(normalized);
        } else if (!options.keepWarnings) {
            renderWarnings([]);
        }

        return normalized;
    }

    function previewPalette(palette, options = {}) {
        if (activeTheme !== 'custom') {
            return;
        }
        const delay = options.immediate ? 0 : 120;
        window.clearTimeout(previewTimer);
        previewTimer = window.setTimeout(() => {
            const normalized = applyPalette(palette, { theme: 'custom' });
            const scheme = inferScheme(normalized);
            htmlElement.setAttribute('data-theme', 'custom');
            htmlElement.setAttribute('data-bs-theme', scheme);
        }, delay);
    }

    function resetToDefault() {
        storage.remove(STORAGE_KEYS.theme);
        storage.remove(STORAGE_KEYS.palette);
        customPaletteState = normalizePalette(DEFAULT_PALETTE);
        reflectPaletteInputs(customPaletteState);
        applyTheme('light', { persist: false });
        showFeedback('Tema restaurado para o padrão claro.', 'info');
    }

    function saveTheme(theme) {
        if (isRecognizedTheme(theme)) {
            storage.set(STORAGE_KEYS.theme, theme);
        }
    }

    function savePalette(palette) {
        const normalized = normalizePalette(palette);
        storage.set(STORAGE_KEYS.palette, JSON.stringify(normalized));
    }

    function validateContrast(palette) {
        const normalized = normalizePalette(palette);
        const messages = [];

        const ratioText = getContrastRatio(normalized.bg, normalized.text);
        if (ratioText < 4.5) {
            messages.push(`O contraste entre Fundo e Texto é ${ratioText.toFixed(2)} (mínimo recomendado: 4.5).`);
        }

        const primaryContrast = getContrastRatio(normalized.primary, chooseContrastColor(normalized.primary));
        if (primaryContrast < 4.5) {
            messages.push(`O contraste do botão Primário é ${primaryContrast.toFixed(2)} (mínimo recomendado: 4.5).`);
        }

        const secondaryContrast = getContrastRatio(normalized.secondary, chooseContrastColor(normalized.secondary));
        if (secondaryContrast < 4.5) {
            messages.push(`O contraste do botão Secundário é ${secondaryContrast.toFixed(2)} (mínimo recomendado: 4.5).`);
        }

        const alertContrast = getContrastRatio(normalized.warning, chooseContrastColor(normalized.warning));
        if (alertContrast < 4.5) {
            messages.push(`O contraste da cor de Aviso é ${alertContrast.toFixed(2)} (mínimo recomendado: 4.5).`);
        }

        return messages;
    }

    function renderWarnings(messages) {
        if (!dom.warningBox) {
            return;
        }
        dom.warningBox.innerHTML = '';
        if (!messages.length) {
            dom.warningBox.setAttribute('hidden', 'hidden');
            dom.warningBox.classList.remove('alert', 'alert-warning');
            return;
        }

        dom.warningBox.classList.add('alert', 'alert-warning');
        dom.warningBox.removeAttribute('hidden');

        const list = document.createElement('ul');
        messages.forEach((message) => {
            const item = document.createElement('li');
            item.textContent = message;
            list.appendChild(item);
        });
        dom.warningBox.appendChild(list);
    }

    function showFeedback(message, tone = 'success') {
        if (!dom.feedbackBox) {
            return;
        }
        dom.feedbackBox.textContent = message;
        dom.feedbackBox.classList.remove('alert-success', 'alert-info', 'alert-danger');
        dom.feedbackBox.classList.add('alert', `alert-${tone}`);
        dom.feedbackBox.removeAttribute('hidden');
        window.clearTimeout(feedbackTimer);
        feedbackTimer = window.setTimeout(() => {
            if (dom.feedbackBox) {
                dom.feedbackBox.setAttribute('hidden', 'hidden');
            }
        }, 4000);
    }

    function updateControlState(theme) {
        if (dom.root) {
            dom.root.dataset.activeTheme = theme;
        }

        dom.themeRadios.forEach((radio) => {
            radio.checked = radio.value === theme;
        });

        const customEnabled = theme === 'custom';
        dom.colorInputs.forEach((input) => {
            input.disabled = !customEnabled;
        });

        if (dom.previewButton) {
            dom.previewButton.disabled = !customEnabled;
        }
        if (dom.saveButton) {
            dom.saveButton.disabled = !customEnabled;
        }
    }

    function reflectPaletteInputs(palette) {
        const normalized = normalizePalette(palette);
        dom.colorInputs.forEach((input) => {
            const key = input.dataset.colorKey;
            if (!key || !(key in normalized)) {
                return;
            }
            input.value = normalized[key];
        });
    }

    function getPaletteFromInputs() {
        const palette = {};
        dom.colorInputs.forEach((input) => {
            const key = input.dataset.colorKey;
            if (!key) {
                return;
            }
            palette[key] = input.value;
        });
        return palette;
    }

    function normalizePalette(palette = {}) {
        const normalized = {};
        COLOR_KEYS.forEach((key) => {
            const candidate = palette[key];
            const fallback = DEFAULT_PALETTE[key];
            normalized[key] = normalizeHex(isValidHex(candidate) ? candidate : fallback);
        });
        return normalized;
    }

    function normalizeHex(value) {
        if (!isValidHex(value)) {
            return '#000000';
        }
        let hex = value.trim();
        if (!hex.startsWith('#')) {
            hex = `#${hex}`;
        }
        if (hex.length === 4) {
            hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
        }
        return `#${hex.slice(1).toUpperCase()}`;
    }

    function isValidHex(value) {
        return typeof value === 'string' && /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());
    }

    function buildCssVariables(palette) {
        const scheme = inferScheme(palette);
        const primaryRgb = rgbToCss(hexToRgb(palette.primary));
        const secondaryRgb = rgbToCss(hexToRgb(palette.secondary));
        const successRgb = rgbToCss(hexToRgb(palette.success));
        const warningRgb = rgbToCss(hexToRgb(palette.warning));
        const dangerRgb = rgbToCss(hexToRgb(palette.danger));
        const infoRgb = rgbToCss(hexToRgb(palette.info));
        const textRgb = rgbToCss(hexToRgb(palette.text));

        const surface = scheme === 'dark'
            ? mixHex(palette.bg, '#ffffff', 0.12)
            : mixHex(palette.bg, '#000000', 0.06);
        const textMuted = mixHex(palette.text, scheme === 'dark' ? '#ffffff' : '#000000', 0.3);
        const primaryHover = scheme === 'dark'
            ? mixHex(palette.primary, '#ffffff', 0.18)
            : mixHex(palette.primary, '#000000', 0.18);
        const primaryActive = scheme === 'dark'
            ? mixHex(palette.primary, '#ffffff', 0.28)
            : mixHex(palette.primary, '#000000', 0.28);
        const secondaryHover = scheme === 'dark'
            ? mixHex(palette.secondary, '#ffffff', 0.14)
            : mixHex(palette.secondary, '#000000', 0.18);
        const secondaryActive = scheme === 'dark'
            ? mixHex(palette.secondary, '#ffffff', 0.24)
            : mixHex(palette.secondary, '#000000', 0.28);
        const successHover = scheme === 'dark'
            ? mixHex(palette.success, '#ffffff', 0.16)
            : mixHex(palette.success, '#000000', 0.2);
        const successActive = scheme === 'dark'
            ? mixHex(palette.success, '#ffffff', 0.26)
            : mixHex(palette.success, '#000000', 0.3);
        const warningHover = scheme === 'dark'
            ? mixHex(palette.warning, '#ffffff', 0.1)
            : mixHex(palette.warning, '#000000', 0.18);
        const warningActive = scheme === 'dark'
            ? mixHex(palette.warning, '#ffffff', 0.18)
            : mixHex(palette.warning, '#000000', 0.28);
        const dangerHover = scheme === 'dark'
            ? mixHex(palette.danger, '#ffffff', 0.12)
            : mixHex(palette.danger, '#000000', 0.2);
        const dangerActive = scheme === 'dark'
            ? mixHex(palette.danger, '#ffffff', 0.22)
            : mixHex(palette.danger, '#000000', 0.3);
        const infoHover = scheme === 'dark'
            ? mixHex(palette.info, '#ffffff', 0.14)
            : mixHex(palette.info, '#000000', 0.18);
        const infoActive = scheme === 'dark'
            ? mixHex(palette.info, '#ffffff', 0.24)
            : mixHex(palette.info, '#000000', 0.28);
        const sidebarBg = scheme === 'dark'
            ? mixHex(palette.bg, '#000000', 0.18)
            : palette.bg;
        const sidebarGradient = scheme === 'dark'
            ? `linear-gradient(145deg, color-mix(in srgb, ${sidebarBg} 85%, transparent), color-mix(in srgb, ${sidebarBg} 70%, rgba(0, 0, 0, 0.25)))`
            : 'none';

        const vars = {
            '--color-primary': palette.primary,
            '--color-primary-contrast': chooseContrastColor(palette.primary),
            '--color-primary-hover': primaryHover,
            '--color-primary-active': primaryActive,
            '--color-primary-rgb': primaryRgb,
            '--color-secondary': palette.secondary,
            '--color-secondary-contrast': chooseContrastColor(palette.secondary),
            '--color-secondary-hover': secondaryHover,
            '--color-secondary-active': secondaryActive,
            '--color-secondary-rgb': secondaryRgb,
            '--color-bg': palette.bg,
            '--color-surface': surface,
            '--color-text': palette.text,
            '--color-text-muted': textMuted,
            '--color-text-rgb': textRgb,
            '--color-border': palette.border,
            '--color-success': palette.success,
            '--color-success-contrast': chooseContrastColor(palette.success),
            '--color-success-hover': successHover,
            '--color-success-active': successActive,
            '--color-success-rgb': successRgb,
            '--color-warning': palette.warning,
            '--color-warning-contrast': chooseContrastColor(palette.warning),
            '--color-warning-hover': warningHover,
            '--color-warning-active': warningActive,
            '--color-warning-rgb': warningRgb,
            '--color-danger': palette.danger,
            '--color-danger-contrast': chooseContrastColor(palette.danger),
            '--color-danger-hover': dangerHover,
            '--color-danger-active': dangerActive,
            '--color-danger-rgb': dangerRgb,
            '--color-info': palette.info,
            '--color-info-contrast': chooseContrastColor(palette.info),
            '--color-info-hover': infoHover,
            '--color-info-active': infoActive,
            '--color-info-rgb': infoRgb,
            '--color-sidebar-bg': sidebarBg,
            '--color-sidebar-gradient': sidebarGradient,
            '--computed-color-scheme': scheme,
            '--bs-body-bg': palette.bg,
            '--bs-body-color': palette.text,
            '--bs-border-color': palette.border,
            '--bs-heading-color': palette.text,
            '--bs-link-color': palette.primary,
            '--bs-link-hover-color': primaryHover,
            '--bs-primary': palette.primary,
            '--bs-primary-rgb': primaryRgb,
            '--bs-secondary': palette.secondary,
            '--bs-secondary-rgb': secondaryRgb,
            '--bs-success': palette.success,
            '--bs-success-rgb': successRgb,
            '--bs-warning': palette.warning,
            '--bs-warning-rgb': warningRgb,
            '--bs-danger': palette.danger,
            '--bs-danger-rgb': dangerRgb,
            '--bs-info': palette.info,
            '--bs-info-rgb': infoRgb,
            '--bs-primary-text-emphasis': palette.primary,
            '--bs-primary-bg-subtle': `rgba(${primaryRgb}, 0.12)`,
            '--bs-primary-border-subtle': `rgba(${primaryRgb}, 0.3)`,
            '--bs-secondary-text-emphasis': palette.secondary,
            '--bs-secondary-bg-subtle': `rgba(${secondaryRgb}, 0.16)`,
            '--bs-secondary-border-subtle': `rgba(${secondaryRgb}, 0.32)`,
            '--bs-success-text-emphasis': palette.success,
            '--bs-success-bg-subtle': `rgba(${successRgb}, 0.14)`,
            '--bs-success-border-subtle': `rgba(${successRgb}, 0.3)`,
            '--bs-warning-text-emphasis': palette.warning,
            '--bs-warning-bg-subtle': `rgba(${warningRgb}, 0.2)`,
            '--bs-warning-border-subtle': `rgba(${warningRgb}, 0.32)`,
            '--bs-danger-text-emphasis': palette.danger,
            '--bs-danger-bg-subtle': `rgba(${dangerRgb}, 0.16)`,
            '--bs-danger-border-subtle': `rgba(${dangerRgb}, 0.32)`,
            '--bs-info-text-emphasis': palette.info,
            '--bs-info-bg-subtle': `rgba(${infoRgb}, 0.16)`,
            '--bs-info-border-subtle': `rgba(${infoRgb}, 0.32)`
        };

        vars['--color-shadow-soft'] = scheme === 'dark'
            ? '0 22px 50px rgba(15, 23, 42, 0.55)'
            : '0 18px 40px rgba(13, 110, 253, 0.08)';
        vars['--color-shadow'] = scheme === 'dark'
            ? '0 16px 40px rgba(2, 6, 23, 0.45)'
            : '0 8px 32px rgba(33, 37, 41, 0.12)';

        return vars;
    }

    function inferScheme(palette) {
        const luminance = getRelativeLuminance(palette.bg);
        return luminance < 0.45 ? 'dark' : 'light';
    }

    function getPreferredTheme() {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return 'light';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function chooseContrastColor(hex) {
        const whiteContrast = getContrastRatio(hex, '#FFFFFF');
        const blackContrast = getContrastRatio(hex, '#000000');
        return whiteContrast >= blackContrast ? '#FFFFFF' : '#000000';
    }

    function hexToRgb(hex) {
        const normalized = normalizeHex(hex).slice(1);
        const numeric = parseInt(normalized, 16);
        return {
            r: (numeric >> 16) & 255,
            g: (numeric >> 8) & 255,
            b: numeric & 255
        };
    }

    function rgbToCss({ r, g, b }) {
        return `${r}, ${g}, ${b}`;
    }

    function rgbToHex({ r, g, b }) {
        const toHex = (value) => value.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    }

    function mixHex(source, target, amount) {
        const ratio = clamp(amount, 0, 1);
        const from = hexToRgb(source);
        const to = hexToRgb(target);
        const mixed = {
            r: Math.round(from.r + (to.r - from.r) * ratio),
            g: Math.round(from.g + (to.g - from.g) * ratio),
            b: Math.round(from.b + (to.b - from.b) * ratio)
        };
        return rgbToHex(mixed);
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function getRelativeLuminance(hex) {
        const { r, g, b } = hexToRgb(hex);
        const [rLin, gLin, bLin] = [r, g, b].map((channel) => {
            const srgb = channel / 255;
            return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
    }

    function getContrastRatio(hexA, hexB) {
        const lumA = getRelativeLuminance(hexA);
        const lumB = getRelativeLuminance(hexB);
        const lighter = Math.max(lumA, lumB);
        const darker = Math.min(lumA, lumB);
        return (lighter + 0.05) / (darker + 0.05);
    }
})();
