(function() {
    "use strict";

    /**
     * Easy selector helper function
     */
    const select = (el, all = false) => {
        el = el.trim()
        if (all) {
            return [...document.querySelectorAll(el)]
        }
        else {
            return document.querySelector(el)
        }
    }

    /**
     * Easy event listener function
     */
    const on = (type, el, listener, all = false) => {
        let selectEl = select(el, all)
        if (selectEl) {
            if (all) {
                selectEl.forEach(e => e.addEventListener(type, listener))
            } else {
                selectEl.addEventListener(type, listener)
            }
        }
    }

    /**
     * Easy on scroll event listener 
     */
    const onscroll = (el, listener) => {
        el.addEventListener('scroll', listener)
    }

    /**
     * Sidebar toggle
     */
    if (select('.toggle-sidebar-btn')) {
        on('click', '.toggle-sidebar-btn', function(e) {
            select('body').classList.toggle('toggle-sidebar')
        })
    }

    /**
     * Collapse sidebar automatically on smaller screens
     */
    const responsiveSidebarMq = window.matchMedia('(max-width: 991px)');

    const syncSidebarWithViewport = (isSmallScreen) => {
        const bodyEl = select('body');

        if (!bodyEl || !bodyEl.classList.contains('app-body')) {
            return;
        }

        if (bodyEl.classList.contains('menu-top')) {
            bodyEl.classList.remove('toggle-sidebar');
            return;
        }

        if (isSmallScreen) {
            bodyEl.classList.add('toggle-sidebar');
        } else {
            bodyEl.classList.remove('toggle-sidebar');
        }
    };

    syncSidebarWithViewport(responsiveSidebarMq.matches);

    const handleSidebarBreakpoint = (event) => syncSidebarWithViewport(event.matches);

    if (typeof responsiveSidebarMq.addEventListener === 'function') {
        responsiveSidebarMq.addEventListener('change', handleSidebarBreakpoint);
    } else if (typeof responsiveSidebarMq.addListener === 'function') {
        responsiveSidebarMq.addListener(handleSidebarBreakpoint);
    }

    window.addEventListener('load', () => syncSidebarWithViewport(responsiveSidebarMq.matches));

    /**
     * Back to top button
     */
    let backtotop = select('.back-to-top')
    if (backtotop) {
        const toggleBacktotop = () => {
            if (window.scrollY > 100) {
                backtotop.classList.add('active')
            } else {
                backtotop.classList.remove('active')
            }
        }
        window.addEventListener('load', toggleBacktotop)
        onscroll(document, toggleBacktotop)
    }

    /**
     * Theme Toggle
     */
    const themeToggleBtn = select('#theme-toggle-icon');

    const getStoredTheme = () => localStorage.getItem('theme');
    const setStoredTheme = theme => localStorage.setItem('theme', theme);

    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme();
        if (storedTheme) {
            return storedTheme;
        }
        // Por padrão, usar o tema claro
        return 'light';
    };

    const setTheme = theme => {
        document.documentElement.setAttribute('data-bs-theme', theme);
        if (theme === 'dark') {
            themeToggleBtn.classList.remove('bi-sun');
            themeToggleBtn.classList.add('bi-moon');
        } else {
            themeToggleBtn.classList.remove('bi-moon');
            themeToggleBtn.classList.add('bi-sun');
        }
    };

    // Aplica o tema no carregamento inicial
    setTheme(getPreferredTheme());

    if (themeToggleBtn) {
        on('click', '#theme-toggle-icon', function(e) {
            e.preventDefault();
            const currentTheme = getPreferredTheme() === 'dark' ? 'light' : 'dark';
            setStoredTheme(currentTheme);
            setTheme(currentTheme);
        });
    }

    /**
     * Theme Palette
     */
    const themePaletteButtons = select('[data-theme-palette]', true);
    const themeCustomizer = select('#themeCustomizer');
    const themeColorPrimary = select('#themeColorPrimary');
    const themeColorBackground = select('#themeColorBackground');
    const themeColorSurface = select('#themeColorSurface');
    const themeColorText = select('#themeColorText');
    const themeColorMuted = select('#themeColorMuted');

    const setStoredPalette = palette => localStorage.setItem('theme-palette', palette);
    const getStoredPalette = () => localStorage.getItem('theme-palette');
    const setStoredCustomPalette = palette => localStorage.setItem('theme-palette-custom', JSON.stringify(palette));
    const getStoredCustomPalette = () => {
        const stored = localStorage.getItem('theme-palette-custom');
        return stored ? JSON.parse(stored) : null;
    };

    const defaultCustomPalette = {
        primary: '#2f6aa6',
        background: '#eef2f7',
        surface: '#ffffff',
        text: '#1f2b3a',
        muted: '#62708a'
    };

    const hexToRgb = hex => {
        const normalized = hex.replace('#', '');
        if (normalized.length !== 6) {
            return null;
        }
        const r = parseInt(normalized.slice(0, 2), 16);
        const g = parseInt(normalized.slice(2, 4), 16);
        const b = parseInt(normalized.slice(4, 6), 16);
        return { r, g, b };
    };

    const withAlpha = (hex, alpha) => {
        const rgb = hexToRgb(hex);
        if (!rgb) {
            return null;
        }
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    };

    const applyPalette = palette => {
        if (palette === 'nevoa' || palette === 'areia') {
            document.documentElement.setAttribute('data-theme-palette', palette);
            clearCustomPalette();
        } else if (palette === 'custom') {
            document.documentElement.setAttribute('data-theme-palette', palette);
        } else {
            document.documentElement.removeAttribute('data-theme-palette');
            clearCustomPalette();
        }
    };

    const applyCustomPalette = palette => {
        if (!palette) {
            return;
        }

        const rootStyle = document.documentElement.style;
        rootStyle.setProperty('--color-primary', palette.primary);
        rootStyle.setProperty('--color-primary-rgb', hexToRgb(palette.primary) ? `${hexToRgb(palette.primary).r}, ${hexToRgb(palette.primary).g}, ${hexToRgb(palette.primary).b}` : '47, 106, 166');
        rootStyle.setProperty('--color-background', palette.background);
        rootStyle.setProperty('--color-surface', palette.surface);
        rootStyle.setProperty('--color-dark', palette.text);
        rootStyle.setProperty('--color-muted', palette.muted);
        rootStyle.setProperty('--color-border', withAlpha(palette.primary, 0.25) || 'rgba(46, 74, 104, 0.25)');

        const headerBg = withAlpha(palette.primary, 0.06) || palette.surface;
        const sidebarBg = withAlpha(palette.primary, 0.08) || palette.surface;
        rootStyle.setProperty('--custom-header-bg', headerBg);
        rootStyle.setProperty('--custom-header-border', withAlpha(palette.primary, 0.2) || 'rgba(46, 74, 104, 0.2)');
        rootStyle.setProperty('--custom-sidebar-bg', sidebarBg);
        rootStyle.setProperty('--custom-sidebar-border', withAlpha(palette.primary, 0.22) || 'rgba(46, 74, 104, 0.22)');
        rootStyle.setProperty('--custom-button-bg', withAlpha(palette.primary, 0.14) || 'rgba(46, 74, 104, 0.14)');
        rootStyle.setProperty('--custom-button-border', withAlpha(palette.primary, 0.45) || 'rgba(46, 74, 104, 0.45)');
    };

    const clearCustomPalette = () => {
        const rootStyle = document.documentElement.style;
        rootStyle.removeProperty('--custom-header-bg');
        rootStyle.removeProperty('--custom-header-border');
        rootStyle.removeProperty('--custom-sidebar-bg');
        rootStyle.removeProperty('--custom-sidebar-border');
        rootStyle.removeProperty('--custom-button-bg');
        rootStyle.removeProperty('--custom-button-border');
    };

    const syncCustomizerInputs = palette => {
        if (!themeColorPrimary || !themeColorBackground || !themeColorSurface || !themeColorText || !themeColorMuted) {
            return;
        }
        themeColorPrimary.value = palette.primary;
        themeColorBackground.value = palette.background;
        themeColorSurface.value = palette.surface;
        themeColorText.value = palette.text;
        themeColorMuted.value = palette.muted;
    };

    const readCustomizerInputs = () => {
        return {
            primary: themeColorPrimary ? themeColorPrimary.value : defaultCustomPalette.primary,
            background: themeColorBackground ? themeColorBackground.value : defaultCustomPalette.background,
            surface: themeColorSurface ? themeColorSurface.value : defaultCustomPalette.surface,
            text: themeColorText ? themeColorText.value : defaultCustomPalette.text,
            muted: themeColorMuted ? themeColorMuted.value : defaultCustomPalette.muted
        };
    };

    const updatePaletteButtons = palette => {
        themePaletteButtons.forEach(button => {
            const isActive = button.dataset.themePalette === palette;
            button.classList.toggle('active', isActive);
            button.classList.toggle('btn-secondary', isActive);
            button.classList.toggle('btn-outline-secondary', !isActive);
        });
    };

    if (themePaletteButtons.length > 0) {
        const storedPalette = getStoredPalette();
        const initialPalette = (storedPalette === 'nevoa' || storedPalette === 'areia' || storedPalette === 'custom')
            ? storedPalette
            : 'default';
        const storedCustomPalette = getStoredCustomPalette() || defaultCustomPalette;

        if (themeCustomizer) {
            themeCustomizer.hidden = initialPalette !== 'custom';
            syncCustomizerInputs(storedCustomPalette);
        }

        applyPalette(initialPalette);
        updatePaletteButtons(initialPalette);

        if (initialPalette === 'custom') {
            applyCustomPalette(storedCustomPalette);
        }

        themePaletteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const selected = this.dataset.themePalette;
                setStoredPalette(selected);
                applyPalette(selected);
                updatePaletteButtons(selected);

                if (selected === 'custom') {
                    const customPalette = getStoredCustomPalette() || defaultCustomPalette;
                    setStoredCustomPalette(customPalette);
                    syncCustomizerInputs(customPalette);
                    applyCustomPalette(customPalette);
                }

                if (themeCustomizer) {
                    themeCustomizer.hidden = selected !== 'custom';
                }
            });
        });
    }

    if (themeColorPrimary && themeColorBackground && themeColorSurface && themeColorText && themeColorMuted) {
        const onCustomChange = () => {
            const palette = readCustomizerInputs();
            setStoredCustomPalette(palette);
            applyCustomPalette(palette);
        };

        themeColorPrimary.addEventListener('input', onCustomChange);
        themeColorBackground.addEventListener('input', onCustomChange);
        themeColorSurface.addEventListener('input', onCustomChange);
        themeColorText.addEventListener('input', onCustomChange);
        themeColorMuted.addEventListener('input', onCustomChange);
    }

    /**
     * Menu Position
     */
    const getStoredMenuPosition = () => localStorage.getItem('menuPosition');
    const setStoredMenuPosition = position => localStorage.setItem('menuPosition', position);

    const setMenuPosition = position => {
        const body = select('body');
        body.classList.remove('menu-left', 'menu-right', 'menu-top');
        if (position === 'right') {
            body.classList.add('menu-right');
        } else if (position === 'top') {
            body.classList.add('menu-top');
        } else {
            body.classList.add('menu-left'); // Default
        }

        syncSidebarWithViewport(responsiveSidebarMq.matches);
    };

    // Apply menu position on initial load
    const savedMenuPosition = getStoredMenuPosition();
    if (savedMenuPosition) {
        setMenuPosition(savedMenuPosition);
    }

    // Logic for settings page
    const menuPositionRadios = select('input[name="menuPosition"]', true);
    if (menuPositionRadios.length > 0) {
        const currentPosition = getStoredMenuPosition() || 'left';
        menuPositionRadios.forEach(radio => {
            if (radio.value === currentPosition) {
                radio.checked = true;
            }
        });

        on('change', 'input[name="menuPosition"]', function(e) {
            const newPosition = e.target.value;
            setStoredMenuPosition(newPosition);
            setMenuPosition(newPosition);
        }, true);
    }

})()
