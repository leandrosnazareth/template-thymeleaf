(function() {
    "use strict";

    const select = (el, all = false) => {
        el = typeof el === 'string' ? el.trim() : el;
        if (all) {
            return Array.from(document.querySelectorAll(el));
        }
        return document.querySelector(el);
    };

    const on = (type, el, listener, all = false) => {
        const selectEl = select(el, all);
        if (!selectEl) {
            return;
        }
        if (all) {
            selectEl.forEach(e => e.addEventListener(type, listener));
        } else {
            selectEl.addEventListener(type, listener);
        }
    };

    const onscroll = (el, listener) => {
        el.addEventListener('scroll', listener);
    };

    if (select('.toggle-sidebar-btn')) {
        on('click', '.toggle-sidebar-btn', () => {
            const bodyEl = select('body');
            if (bodyEl) {
                bodyEl.classList.toggle('toggle-sidebar');
            }
        });
    }

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

    const backtotop = select('.back-to-top');
    if (backtotop) {
        const toggleBacktotop = () => {
            if (window.scrollY > 100) {
                backtotop.classList.add('active');
            } else {
                backtotop.classList.remove('active');
            }
        };
        window.addEventListener('load', toggleBacktotop);
        onscroll(document, toggleBacktotop);
    }

    const getStoredMenuPosition = () => localStorage.getItem('menuPosition');
    const setStoredMenuPosition = (position) => localStorage.setItem('menuPosition', position);

    const setMenuPosition = (position) => {
        const body = select('body');
        if (!body) {
            return;
        }
        body.classList.remove('menu-left', 'menu-right', 'menu-top');
        if (position === 'right') {
            body.classList.add('menu-right');
        } else if (position === 'top') {
            body.classList.add('menu-top');
        } else {
            body.classList.add('menu-left');
        }
        syncSidebarWithViewport(responsiveSidebarMq.matches);
    };

    const savedMenuPosition = getStoredMenuPosition();
    if (savedMenuPosition) {
        setMenuPosition(savedMenuPosition);
    }

    const menuPositionRadios = select('input[name="menuPosition"]', true);
    if (menuPositionRadios.length > 0) {
        const currentPosition = getStoredMenuPosition() || 'left';
        menuPositionRadios.forEach(radio => {
            radio.checked = radio.value === currentPosition;
        });

        on('change', 'input[name="menuPosition"]', (event) => {
            const newPosition = event.target.value;
            setStoredMenuPosition(newPosition);
            setMenuPosition(newPosition);
        }, true);
    }

})();
