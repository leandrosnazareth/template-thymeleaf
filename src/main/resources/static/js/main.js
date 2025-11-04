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
