(function() {
    "use strict";

    const select = (el, all = false) => {
        el = typeof el === 'string' ? el.trim() : el;
        if (all) {
            return Array.from(document.querySelectorAll(el));
        }
        return document.querySelector(el);
    };

    const STORAGE_KEYS = {
        activeTheme: 'activeTheme',
        activeThemeVariables: 'activeThemeVariables',
        customThemes: 'customThemes',
        legacyThemeMode: 'theme'
    };

    const RAW_PRESET_THEMES = [
        {
            id: 'light',
            name: 'Padrão Claro',
            description: 'Layout equilibrado para ambientes iluminados.',
            mode: 'light',
            palette: {
                primary: '#7367f0',
                accent: '#f9a826',
                success: '#28c76f',
                danger: '#ea5455',
                background: '#f8f9fa',
                surface: '#ffffff',
                text: '#2f365f',
                muted: '#7c859f'
            }
        },
        {
            id: 'dark',
            name: 'Noite Profunda',
            description: 'Contraste alto para ambientes escuros.',
            mode: 'dark',
            palette: {
                primary: '#8c7ae6',
                accent: '#fd9644',
                success: '#2ed573',
                danger: '#ff6b81',
                background: '#101624',
                surface: '#1b2435',
                text: '#f8fbff',
                muted: '#94a3b8'
            }
        },
        {
            id: 'aurora',
            name: 'Aurora Polar',
            description: 'Gradientes frios com realces vibrantes.',
            mode: 'dark',
            palette: {
                primary: '#9b5de5',
                accent: '#f15bb5',
                success: '#00f5d4',
                danger: '#f46036',
                background: '#0f172a',
                surface: '#182341',
                text: '#f8fafc',
                muted: '#93a5c6'
            }
        },
        {
            id: 'sunset',
            name: 'Pôr do Sol',
            description: 'Tons quentes inspirados no final da tarde.',
            mode: 'light',
            palette: {
                primary: '#f97316',
                accent: '#fbbf24',
                success: '#34d399',
                danger: '#fb7185',
                background: '#fff7ed',
                surface: '#ffffff',
                text: '#432c20',
                muted: '#8b6b57'
            }
        },
        {
            id: 'ocean',
            name: 'Mar Profundo',
            description: 'Paleta fresca para dados operacionais.',
            mode: 'light',
            palette: {
                primary: '#0ea5e9',
                accent: '#22d3ee',
                success: '#38bdf8',
                danger: '#f97316',
                background: '#eef6ff',
                surface: '#ffffff',
                text: '#041527',
                muted: '#5b728f'
            }
        }
    ];

    const normalizeHex = (hex) => {
        if (!hex) {
            return '000000';
        }
        let sanitized = hex.toString().trim().replace('#', '');
        if (sanitized.length === 3) {
            sanitized = sanitized.split('').map(ch => ch + ch).join('');
        }
        if (sanitized.length !== 6) {
            sanitized = sanitized.substring(0, 6).padEnd(6, '0');
        }
        return sanitized.toLowerCase();
    };

    const hexToRgb = (hex) => {
        const value = normalizeHex(hex);
        const intVal = parseInt(value, 16);
        return {
            r: (intVal >> 16) & 255,
            g: (intVal >> 8) & 255,
            b: intVal & 255
        };
    };

    const rgbToString = ({ r, g, b }) => `${r}, ${g}, ${b}`;

    const shadeHexColor = (hex, percent) => {
        const value = normalizeHex(hex);
        const amt = Math.round(2.55 * percent);
        const { r, g, b } = hexToRgb(value);
        const clamp = (num) => Math.min(255, Math.max(0, num));
        const rr = clamp(r + amt);
        const gg = clamp(g + amt);
        const bb = clamp(b + amt);
        return `#${((1 << 24) + (rr << 16) + (gg << 8) + bb).toString(16).slice(1)}`;
    };

    const buildThemeVariables = (theme) => {
        const palette = theme.palette || {};
        const mode = theme.mode === 'dark' ? 'dark' : 'light';
        const primary = palette.primary || '#7367f0';
        const accent = palette.accent || '#f9a826';
        const success = palette.success || '#28c76f';
        const danger = palette.danger || '#ea5455';
        const background = palette.background || (mode === 'dark' ? '#111827' : '#f8f9fa');
        const surface = palette.surface || (mode === 'dark' ? '#1f2536' : '#ffffff');
        const text = palette.text || (mode === 'dark' ? '#f5f7ff' : '#2f365f');
        const muted = palette.muted || (mode === 'dark' ? '#94a3b8' : '#77829a');
        const textVariant = palette.textVariant || shadeHexColor(text, mode === 'dark' ? -18 : 18);

        const primaryRgb = rgbToString(hexToRgb(primary));
        const accentRgb = rgbToString(hexToRgb(accent));
        const textRgb = rgbToString(hexToRgb(text));
        const backgroundRgb = rgbToString(hexToRgb(background));

        const lightLayer = mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
        const borderColor = `rgba(${textRgb}, ${mode === 'dark' ? 0.28 : 0.18})`;
        const shadowSoft = mode === 'dark'
            ? `0 24px 45px rgba(${primaryRgb}, 0.35)`
            : `0 20px 45px rgba(${primaryRgb}, 0.22)`;
        const shadowMedium = mode === 'dark'
            ? `0 24px 45px rgba(${textRgb}, 0.28)`
            : `0 12px 30px rgba(${textRgb}, 0.12)`;

        return {
            '--color-primary': primary,
            '--color-primary-rgb': primaryRgb,
            '--color-accent': accent,
            '--color-accent-rgb': accentRgb,
            '--color-success': success,
            '--color-danger': danger,
            '--color-background': background,
            '--color-background-rgb': backgroundRgb,
            '--color-surface': surface,
            '--color-white': '#ffffff',
            '--color-dark': text,
            '--color-dark-variant': textVariant,
            '--color-muted': muted,
            '--color-border': borderColor,
            '--color-light': lightLayer,
            '--shadow-soft': shadowSoft,
            '--shadow-medium': shadowMedium,
            '--card-border-radius': '0.5rem',
            '--box-shadow': '0 2px 10px var(--color-light)'
        };
    };

    const decorateTheme = (theme, source = 'preset') => ({
        id: theme.id,
        name: theme.name,
        description: theme.description || '',
        mode: theme.mode === 'dark' ? 'dark' : 'light',
        palette: theme.palette || {},
        createdAt: theme.createdAt || null,
        source,
        variables: buildThemeVariables(theme)
    });

    const PRESET_THEMES = RAW_PRESET_THEMES.map(theme => decorateTheme(theme, 'preset'));

    const loadCustomThemes = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.customThemes);
            if (!stored) {
                return [];
            }
            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed)) {
                return [];
            }
            return parsed
                .filter(theme => theme && theme.id)
                .map(theme => decorateTheme(theme, 'custom'));
        } catch (error) {
            console.warn('Não foi possível carregar os temas personalizados:', error);
            return [];
        }
    };

    const saveCustomThemes = () => {
        try {
            const serializable = customThemes.map(theme => ({
                id: theme.id,
                name: theme.name,
                description: theme.description,
                mode: theme.mode,
                palette: theme.palette,
                createdAt: theme.createdAt
            }));
            localStorage.setItem(STORAGE_KEYS.customThemes, JSON.stringify(serializable));
        } catch (error) {
            console.warn('Falha ao salvar os temas personalizados:', error);
        }
    };

    let customThemes = loadCustomThemes();

    const getThemeCollection = (source = 'preset') => source === 'custom' ? customThemes : PRESET_THEMES;

    const getThemeById = (id, source = 'preset') => {
        if (!id) {
            return null;
        }
        const collection = getThemeCollection(source);
        const match = collection.find(theme => theme.id === id);
        if (match) {
            return match;
        }
        if (source === 'custom') {
            return null;
        }
        return PRESET_THEMES.find(theme => theme.id === id) || null;
    };

    const ensureThemeStyleElement = () => {
        let styleTag = document.getElementById('theme-variables-style');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'theme-variables-style';
            document.head.appendChild(styleTag);
        }
        return styleTag;
    };

    const writeVariablesToStyle = (variables) => {
        if (!variables) {
            return;
        }
        const styleTag = ensureThemeStyleElement();
        let css = ':root {\n';
        Object.keys(variables).forEach((key) => {
            css += `  ${key}: ${variables[key]};\n`;
        });
        css += '}';
        styleTag.innerHTML = css;
    };

    const saveActiveTheme = (theme) => {
        if (!theme) {
            return;
        }
        const payload = {
            id: theme.id,
            source: theme.source || 'preset',
            mode: theme.mode
        };
        localStorage.setItem(STORAGE_KEYS.activeTheme, JSON.stringify(payload));
        localStorage.setItem(STORAGE_KEYS.activeThemeVariables, JSON.stringify(theme.variables || {}));
        localStorage.setItem(STORAGE_KEYS.legacyThemeMode, theme.mode);
    };

    const updateThemeToggleIcon = (mode) => {
        const themeToggleBtn = select('#theme-toggle-icon');
        if (!themeToggleBtn) {
            return;
        }
        themeToggleBtn.classList.remove('bi-sun', 'bi-moon');
        themeToggleBtn.classList.add(mode === 'dark' ? 'bi-moon' : 'bi-sun');
    };

    const updateThemeToggleMetadata = (theme) => {
        const themeToggleLink = select('#theme-toggle-link');
        if (!themeToggleLink || !theme) {
            return;
        }
        const label = `Alternar modo (atual: ${theme.name})`;
        themeToggleLink.setAttribute('title', label);
        themeToggleLink.setAttribute('aria-label', label);
    };

    const applyThemeToDocument = (theme, persist = true) => {
        if (!theme) {
            return;
        }
        document.documentElement.setAttribute('data-bs-theme', theme.mode);
        writeVariablesToStyle(theme.variables);
        updateThemeToggleIcon(theme.mode);
        if (persist) {
            saveActiveTheme(theme);
        }
        activeTheme = theme;
    };

    const resolveActiveTheme = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.activeTheme);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && parsed.id) {
                    const storedTheme = getThemeById(parsed.id, parsed.source || 'preset');
                    if (storedTheme) {
                        return storedTheme;
                    }
                }
            }
        } catch (error) {
            console.warn('Falha ao recuperar o tema armazenado, usando padrão.', error);
        }
        const legacy = localStorage.getItem(STORAGE_KEYS.legacyThemeMode);
        if (legacy) {
            const legacyTheme = getThemeById(legacy, 'preset');
            if (legacyTheme) {
                return legacyTheme;
            }
        }
        return PRESET_THEMES[0];
    };

    const fallbackState = {
        backdrop: null,
        active: false,
        escListener: null
    };

    const fallbackShowModal = (modalEl) => {
        if (!modalEl || fallbackState.active) {
            return;
        }
        modalEl.classList.add('show');
        modalEl.style.display = 'block';
        modalEl.removeAttribute('aria-hidden');
        modalEl.setAttribute('aria-modal', 'true');
        document.body.classList.add('modal-open');

        if (!fallbackState.backdrop) {
            fallbackState.backdrop = document.createElement('div');
            fallbackState.backdrop.className = 'modal-backdrop fade show';
        }
        if (!fallbackState.backdrop.parentNode) {
            document.body.appendChild(fallbackState.backdrop);
        }

        fallbackState.escListener = (event) => {
            if (event.key === 'Escape') {
                fallbackHideModal(modalEl);
            }
        };
        document.addEventListener('keydown', fallbackState.escListener, { once: true });

        fallbackState.active = true;
    };

    const fallbackHideModal = (modalEl) => {
        if (!modalEl || !fallbackState.active) {
            return;
        }
        modalEl.classList.remove('show');
        modalEl.style.display = 'none';
        modalEl.setAttribute('aria-hidden', 'true');
        modalEl.removeAttribute('aria-modal');
        document.body.classList.remove('modal-open');
        if (fallbackState.backdrop && fallbackState.backdrop.parentNode) {
            fallbackState.backdrop.parentNode.removeChild(fallbackState.backdrop);
        }
        if (fallbackState.escListener) {
            document.removeEventListener('keydown', fallbackState.escListener, { once: true });
        }
        fallbackState.active = false;
        stagedTheme = activeTheme;
        updateThemePreview(activeTheme, { preserveMeta: true });
        updateApplyButtonState();
    };

    const themeToggleLink = select('#theme-toggle-link');
    const themeModalEl = select('#themeModal');
    const themeModalTriggers = select('[data-theme-modal-trigger]', true);
    const themePresetListEl = select('#themePresetList');
    const customThemeListEl = select('#customThemeList');
    const customThemeEmptyStateEl = select('#customThemeEmptyState');
    const themePreviewEl = select('#themePreview');
    const themePreviewModeBadge = select('#themePreviewModeBadge');
    const themeSelectionStatusEl = select('#themeSelectionStatus');
    const applyThemeButton = select('#applyThemeButton');
    const previewCustomThemeBtn = select('#previewCustomThemeBtn');
    const customThemeForm = select('#customThemeForm');
    const customThemeFeedback = select('#customThemeFeedback');
    const customThemeNameInput = select('#customThemeName');
    const customThemePrimaryInput = select('#customThemePrimary');
    const customThemeSuccessInput = select('#customThemeSuccess');
    const customThemeDangerInput = select('#customThemeDanger');
    const customThemeAccentInput = select('#customThemeAccent');
    const customThemeBackgroundInput = select('#customThemeBackground');
    const customThemeSurfaceInput = select('#customThemeSurface');
    const customThemeTextInput = select('#customThemeText');
    const customThemeMutedInput = select('#customThemeMuted');

    let activeTheme = null;
    let stagedTheme = null;
    let customThemeFeedbackTimeout = null;

    const updateThemeSelectionStatus = (message) => {
        if (!themeSelectionStatusEl) {
            return;
        }
        if (message) {
            themeSelectionStatusEl.innerHTML = message;
            return;
        }
        if (stagedTheme && activeTheme) {
            if (stagedTheme.id === activeTheme.id && stagedTheme.source === activeTheme.source) {
                themeSelectionStatusEl.innerHTML = `Tema atual: <strong>${activeTheme.name}</strong>`;
            } else {
                themeSelectionStatusEl.innerHTML = `Pronto para aplicar: <strong>${stagedTheme.name}</strong>`;
            }
        } else if (activeTheme) {
            themeSelectionStatusEl.innerHTML = `Tema atual: <strong>${activeTheme.name}</strong>`;
        } else {
            themeSelectionStatusEl.textContent = 'Selecione um tema para aplicar.';
        }
    };

    const updateApplyButtonState = () => {
        if (!applyThemeButton) {
            return;
        }
        if (!stagedTheme || (activeTheme && stagedTheme.id === activeTheme.id && stagedTheme.source === activeTheme.source)) {
            applyThemeButton.disabled = true;
            applyThemeButton.textContent = 'Aplicar tema';
            return;
        }
        applyThemeButton.disabled = false;
        applyThemeButton.textContent = `Aplicar "${stagedTheme.name}"`;
    };

    const applyVariablesToElement = (element, variables) => {
        if (!element || !variables) {
            return;
        }
        const inline = Object.entries(variables)
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ');
        element.setAttribute('style', inline);
    };

    const updateThemePreview = (theme, options = {}) => {
        if (!themePreviewEl || !theme) {
            return;
        }
        applyVariablesToElement(themePreviewEl, theme.variables);

        const previewPill = themePreviewEl.querySelector('.preview-pill');
        if (previewPill) {
            previewPill.textContent = theme.name;
        }

        if (themePreviewModeBadge) {
            themePreviewModeBadge.textContent = theme.mode === 'dark' ? 'Modo escuro' : 'Modo claro';
            themePreviewModeBadge.classList.toggle('text-bg-dark', theme.mode === 'dark');
            themePreviewModeBadge.classList.toggle('text-bg-secondary', theme.mode !== 'dark');
        }

        if (!options.preserveMeta) {
            const metaPositive = themePreviewEl.querySelector('.preview-card-meta.positive');
            if (metaPositive) {
                metaPositive.textContent = theme.mode === 'dark' ? '+18% vs. sprint anterior' : '+12% vs. mês anterior';
            }

            const warningChip = themePreviewEl.querySelector('.preview-chip.warning');
            if (warningChip) {
                warningChip.textContent = theme.mode === 'dark' ? 'Monitorar backlog' : '2 riscos ativos';
            }
        }
    };

    const showCustomThemeFeedback = (message, variant = 'info') => {
        if (!customThemeFeedback) {
            return;
        }
        customThemeFeedback.classList.remove('d-none', 'alert-info', 'alert-success', 'alert-warning', 'alert-danger');
        customThemeFeedback.classList.add(`alert-${variant}`);
        customThemeFeedback.textContent = message;
        customThemeFeedback.classList.remove('d-none');

        if (customThemeFeedbackTimeout) {
            clearTimeout(customThemeFeedbackTimeout);
        }
        customThemeFeedbackTimeout = setTimeout(() => {
            customThemeFeedback.classList.add('d-none');
            customThemeFeedbackTimeout = null;
        }, 4800);
    };

    const buildThemeCard = (theme) => {
        const card = document.createElement('div');
        card.className = 'theme-card';
        card.dataset.themeId = theme.id;
        card.dataset.themeSource = theme.source || 'preset';

        const header = document.createElement('div');
        header.className = 'theme-card-header';

        const headerInfo = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'theme-card-title';
        title.textContent = theme.name;
        headerInfo.appendChild(title);

        if (theme.description) {
            const description = document.createElement('p');
            description.className = 'theme-card-description';
            description.textContent = theme.description;
            headerInfo.appendChild(description);
        }

        const badgeGroup = document.createElement('div');
        badgeGroup.className = 'd-flex flex-column align-items-end gap-1';

        const modeBadge = document.createElement('span');
        modeBadge.className = 'theme-card-mode';
        modeBadge.textContent = theme.mode === 'dark' ? 'Modo escuro' : 'Modo claro';

        const statusBadge = document.createElement('span');
        statusBadge.className = 'theme-card-status badge rounded-pill text-bg-primary d-none';

        badgeGroup.appendChild(modeBadge);
        badgeGroup.appendChild(statusBadge);

        header.appendChild(headerInfo);
        header.appendChild(badgeGroup);

        const swatches = document.createElement('div');
        swatches.className = 'theme-swatches';
        const palette = {
            primary: theme.variables['--color-primary'] || theme.palette.primary,
            accent: theme.variables['--color-accent'] || theme.palette.accent,
            success: theme.variables['--color-success'] || theme.palette.success,
            danger: theme.variables['--color-danger'] || theme.palette.danger,
            background: theme.variables['--color-background'] || theme.palette.background,
            surface: theme.variables['--color-surface'] || theme.palette.surface
        };

        const createSwatch = (label, value) => {
            const swatch = document.createElement('div');
            swatch.className = 'theme-swatch';
            if (value) {
                swatch.style.setProperty('--swatch-color', value);
            }
            const swatchLabel = document.createElement('span');
            swatchLabel.textContent = label;
            swatch.appendChild(swatchLabel);
            return swatch;
        };

        swatches.appendChild(createSwatch('Prim.', palette.primary));
        swatches.appendChild(createSwatch('Dest.', palette.accent));
        swatches.appendChild(createSwatch('Succ.', palette.success));
        swatches.appendChild(createSwatch('Alert.', palette.danger));
        swatches.appendChild(createSwatch('Fundo', palette.background));
        swatches.appendChild(createSwatch('Card', palette.surface));

        const actions = document.createElement('div');
        actions.className = 'theme-card-actions';

        const previewButton = document.createElement('button');
        previewButton.type = 'button';
        previewButton.className = 'btn btn-outline-primary btn-sm';
        previewButton.dataset.themeAction = 'stage';
        previewButton.textContent = 'Pré-visualizar';

        const applyButton = document.createElement('button');
        applyButton.type = 'button';
        applyButton.className = 'btn btn-primary btn-sm';
        applyButton.dataset.themeAction = 'apply';
        applyButton.textContent = 'Aplicar agora';

        actions.appendChild(previewButton);
        actions.appendChild(applyButton);

        if (theme.source === 'custom') {
            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'btn btn-outline-danger btn-sm btn-delete';
            deleteButton.dataset.themeAction = 'delete';
            deleteButton.setAttribute('aria-label', `Excluir tema ${theme.name}`);
            deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
            actions.appendChild(deleteButton);
        }

        card.appendChild(header);
        card.appendChild(swatches);
        card.appendChild(actions);

        return card;
    };

    const renderThemeCollections = () => {
        if (themePresetListEl) {
            themePresetListEl.innerHTML = '';
            PRESET_THEMES.forEach(theme => {
                themePresetListEl.appendChild(buildThemeCard(theme));
            });
        }

        if (customThemeListEl) {
            customThemeListEl.innerHTML = '';
            if (!customThemes.length) {
                if (customThemeEmptyStateEl) {
                    customThemeEmptyStateEl.classList.remove('d-none');
                }
            } else {
                if (customThemeEmptyStateEl) {
                    customThemeEmptyStateEl.classList.add('d-none');
                }
                customThemes.forEach(theme => {
                    customThemeListEl.appendChild(buildThemeCard(theme));
                });
            }
        }

        const cards = select('.theme-card', true);
        cards.forEach((card) => {
            const cardId = card.dataset.themeId;
            const cardSource = card.dataset.themeSource || 'preset';
            const isSelected = stagedTheme && cardId === stagedTheme.id && cardSource === stagedTheme.source;
            const isCurrent = activeTheme && cardId === activeTheme.id && cardSource === activeTheme.source;

            card.classList.toggle('is-active', Boolean(isSelected));
            card.classList.toggle('is-current', Boolean(isCurrent));

            const statusBadge = card.querySelector('.theme-card-status');
            if (statusBadge) {
                if (isCurrent) {
                    statusBadge.textContent = 'Em uso';
                    statusBadge.classList.remove('d-none');
                    statusBadge.classList.add('theme-card-status-current');
                } else if (isSelected) {
                    statusBadge.textContent = 'Selecionado';
                    statusBadge.classList.remove('d-none');
                    statusBadge.classList.remove('theme-card-status-current');
                } else {
                    statusBadge.classList.add('d-none');
                    statusBadge.classList.remove('theme-card-status-current');
                }
            }
        });
    };

    const stageTheme = (theme, options = {}) => {
        if (!theme) {
            return;
        }
        stagedTheme = theme;
        updateThemePreview(theme, { preserveMeta: options.preserveMeta });
        renderThemeCollections();
        updateApplyButtonState();
        if (!options.silent) {
            updateThemeSelectionStatus();
        }
    };

    const resolveQuickToggleTarget = () => {
        if (!activeTheme) {
            return getThemeById('dark') || PRESET_THEMES[0];
        }
        const desiredMode = activeTheme.mode === 'dark' ? 'light' : 'dark';
        return getThemeById(desiredMode, 'preset') || PRESET_THEMES.find(theme => theme.mode === desiredMode) || PRESET_THEMES[0];
    };

    const handleQuickThemeToggle = (event) => {
        if (event) {
            event.preventDefault();
        }
        const targetTheme = resolveQuickToggleTarget();
        applyThemeToDocument(targetTheme, true);
        stagedTheme = activeTheme;
        updateThemePreview(activeTheme, { preserveMeta: true });
        renderThemeCollections();
        updateApplyButtonState();
        updateThemeSelectionStatus();
        updateThemeToggleMetadata(activeTheme);
    };

    const handleApplyTheme = (closeModal = false) => {
        if (!stagedTheme) {
            updateThemeSelectionStatus('Selecione um tema para aplicar.');
            return;
        }
        applyThemeToDocument(stagedTheme, true);
        stagedTheme = activeTheme;
        renderThemeCollections();
        updateApplyButtonState();
        updateThemeSelectionStatus(`Tema aplicado: <strong>${activeTheme.name}</strong>`);
        updateThemeToggleMetadata(activeTheme);
        updateThemePreview(activeTheme, { preserveMeta: true });

        if (closeModal && themeModalEl) {
            const hasBootstrapModal = typeof window !== 'undefined' && window.bootstrap && typeof window.bootstrap.Modal === 'function';
            if (hasBootstrapModal) {
                const instance = window.bootstrap.Modal.getOrCreateInstance(themeModalEl);
                setTimeout(() => instance.hide(), 360);
            } else {
                setTimeout(() => fallbackHideModal(themeModalEl), 360);
            }
        }

        setTimeout(() => updateThemeSelectionStatus(), 3200);
    };

    const deleteCustomTheme = (themeId) => {
        if (!themeId) {
            return;
        }
        const index = customThemes.findIndex(theme => theme.id === themeId);
        if (index === -1) {
            return;
        }
        const [removed] = customThemes.splice(index, 1);
        saveCustomThemes();
        renderThemeCollections();

        if (activeTheme && activeTheme.source === 'custom' && activeTheme.id === themeId) {
            const fallback = PRESET_THEMES[0];
            applyThemeToDocument(fallback, true);
        }

        if (stagedTheme && stagedTheme.source === 'custom' && stagedTheme.id === themeId) {
            stagedTheme = activeTheme;
            updateThemePreview(activeTheme, { preserveMeta: true });
        }

        updateThemeSelectionStatus();
        updateApplyButtonState();
        renderThemeCollections();
        showCustomThemeFeedback(`Tema "${removed.name}" removido.`, 'warning');
    };

    const themeCardClickHandler = (event) => {
        const actionTrigger = event.target.closest('[data-theme-action]');
        const card = event.target.closest('.theme-card');
        if (!card) {
            return;
        }
        const themeId = card.dataset.themeId;
        const source = card.dataset.themeSource || 'preset';
        const theme = getThemeById(themeId, source);
        if (!theme) {
            return;
        }

        if (actionTrigger) {
            const action = actionTrigger.dataset.themeAction;
            if (action === 'stage') {
                stageTheme(theme);
            } else if (action === 'apply') {
                stageTheme(theme, { silent: true, preserveMeta: true });
                handleApplyTheme(false);
            } else if (action === 'delete') {
                deleteCustomTheme(themeId);
            }
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        stageTheme(theme);
    };

    const collectCustomThemeData = () => {
        if (!customThemeForm) {
            return null;
        }
        const modeRadio = customThemeForm.querySelector('input[name="customThemeMode"]:checked');
        return {
            name: customThemeNameInput ? customThemeNameInput.value.trim() : '',
            mode: modeRadio ? modeRadio.value : 'light',
            palette: {
                primary: customThemePrimaryInput ? customThemePrimaryInput.value : '#7367f0',
                success: customThemeSuccessInput ? customThemeSuccessInput.value : '#28c76f',
                danger: customThemeDangerInput ? customThemeDangerInput.value : '#ea5455',
                accent: customThemeAccentInput ? customThemeAccentInput.value : '#f9a826',
                background: customThemeBackgroundInput ? customThemeBackgroundInput.value : '#f8f9fa',
                surface: customThemeSurfaceInput ? customThemeSurfaceInput.value : '#ffffff',
                text: customThemeTextInput ? customThemeTextInput.value : '#2f365f',
                muted: customThemeMutedInput ? customThemeMutedInput.value : '#8f9bb3'
            }
        };
    };

    const prepareThemeModal = () => {
        stageTheme(activeTheme, { silent: true, preserveMeta: true });
        renderThemeCollections();
        updateThemeSelectionStatus();
        updateApplyButtonState();
        updateThemePreview(activeTheme, { preserveMeta: true });
    };

    const openThemeModal = (event) => {
        if (event) {
            event.preventDefault();
        }
        if (!themeModalEl) {
            return false;
        }
        prepareThemeModal();
        const hasBootstrapModal = typeof window !== 'undefined' && window.bootstrap && typeof window.bootstrap.Modal === 'function';
        if (hasBootstrapModal) {
            window.bootstrap.Modal.getOrCreateInstance(themeModalEl).show();
        } else {
            fallbackShowModal(themeModalEl);
        }
        return false;
    };

    const attachThemeModalTriggers = () => {
        if (!themeModalTriggers.length) {
            return;
        }
        themeModalTriggers.forEach(trigger => {
            trigger.addEventListener('click', openThemeModal);
        });
    };

    const initializeThemeSystem = () => {
        activeTheme = resolveActiveTheme();
        applyThemeToDocument(activeTheme, true);
        stagedTheme = activeTheme;
        updateThemeToggleMetadata(activeTheme);
        updateThemePreview(activeTheme, { preserveMeta: true });
        renderThemeCollections();
        updateThemeSelectionStatus();
        updateApplyButtonState();

        if (themePresetListEl) {
            themePresetListEl.addEventListener('click', themeCardClickHandler);
        }
        if (customThemeListEl) {
            customThemeListEl.addEventListener('click', themeCardClickHandler);
        }
        if (themeToggleLink) {
            themeToggleLink.addEventListener('click', handleQuickThemeToggle);
        }

        if (themeModalEl) {
            attachThemeModalTriggers();

            const hasBootstrapModal = typeof window !== 'undefined' && window.bootstrap && typeof window.bootstrap.Modal === 'function';

            if (!hasBootstrapModal) {
                themeModalEl.querySelectorAll('[data-bs-dismiss="modal"]').forEach(btn => {
                    btn.addEventListener('click', (event) => {
                        event.preventDefault();
                        fallbackHideModal(themeModalEl);
                    });
                });

                themeModalEl.addEventListener('click', (event) => {
                    const dialog = themeModalEl.querySelector('.modal-dialog');
                    if (dialog && !dialog.contains(event.target)) {
                        fallbackHideModal(themeModalEl);
                    }
                });
            } else {
                themeModalEl.addEventListener('show.bs.modal', prepareThemeModal);
                themeModalEl.addEventListener('hidden.bs.modal', () => {
                    stagedTheme = activeTheme;
                    updateThemePreview(activeTheme, { preserveMeta: true });
                    updateApplyButtonState();
                });
            }
        }

        if (applyThemeButton) {
            applyThemeButton.addEventListener('click', () => handleApplyTheme(true));
        }

        if (previewCustomThemeBtn) {
            previewCustomThemeBtn.addEventListener('click', (event) => {
                event.preventDefault();
                const data = collectCustomThemeData();
                if (!data) {
                    return;
                }
                const previewTheme = decorateTheme({
                    id: 'custom-preview',
                    name: data.name || 'Pré-visualização',
                    description: 'Pré-visualização não salva',
                    mode: data.mode,
                    palette: data.palette
                }, 'custom');
                updateThemePreview(previewTheme);
                updateThemeSelectionStatus('Pré-visualização aplicada ao painel. Salve o tema para usá-lo no dashboard.');
                updateApplyButtonState();
            });
        }

        if (customThemeForm) {
            customThemeForm.addEventListener('submit', (event) => {
                event.preventDefault();
                event.stopPropagation();
                customThemeForm.classList.add('was-validated');
                if (!customThemeForm.checkValidity()) {
                    showCustomThemeFeedback('Preencha os campos obrigatórios para salvar o tema.', 'warning');
                    return;
                }
                const data = collectCustomThemeData();
                if (!data) {
                    return;
                }
                const themeId = `custom-${Date.now()}`;
                const newTheme = decorateTheme({
                    id: themeId,
                    name: data.name || `Tema personalizado ${customThemes.length + 1}`,
                    description: 'Tema personalizado criado manualmente.',
                    mode: data.mode,
                    palette: data.palette,
                    createdAt: new Date().toISOString()
                }, 'custom');

                customThemes.push(newTheme);
                saveCustomThemes();
                renderThemeCollections();
                stageTheme(newTheme);
                updateThemeSelectionStatus(`Tema salvo: <strong>${newTheme.name}</strong>. Clique em aplicar para ativá-lo.`);
                showCustomThemeFeedback('Tema salvo com sucesso! Ele já está disponível na lista.', 'success');
                customThemeForm.reset();
                customThemeForm.classList.remove('was-validated');
            });
        }
    };

    initializeThemeSystem();

    if (typeof window !== 'undefined') {
        window.__openThemeModal = openThemeModal;
    }

})();
