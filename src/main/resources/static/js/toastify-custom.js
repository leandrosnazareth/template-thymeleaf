(function () {
    const containers = {};

    function createContainer(gravity, position) {
        const key = `${gravity}-${position}`;
        if (containers[key]) {
            return containers[key];
        }
        const div = document.createElement('div');
        div.className = `toastify-container toastify-${gravity} toastify-${position}`;
        document.body.appendChild(div);
        containers[key] = div;
        return div;
    }

    window.Toastify = function Toastify(options = {}) {
        const opts = Object.assign({
            text: '',
            duration: 3000,
            gravity: 'top',
            position: 'right',
            close: true,
            stopOnFocus: true,
            style: {},
            offset: { x: 12, y: 12 },
            className: ''
        }, options);

        let toastEl;
        let timeoutId;

        function buildToast() {
            toastEl = document.createElement('div');
            toastEl.className = `toastify ${opts.className}`.trim();

            const body = document.createElement('div');
            body.className = 'toastify-body';

            if (opts.avatar) {
                const avatar = document.createElement('img');
                avatar.className = 'toastify-avatar';
                avatar.src = opts.avatar;
                avatar.alt = 'Avatar';
                body.appendChild(avatar);
            }

            const textNode = document.createElement('span');
            textNode.textContent = opts.text;
            body.appendChild(textNode);
            toastEl.appendChild(body);

            if (opts.close) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'toastify-close';
                closeBtn.innerHTML = '&times;';
                closeBtn.type = 'button';
                closeBtn.addEventListener('click', hide);
                toastEl.appendChild(closeBtn);
            }

            if (opts.style && typeof opts.style === 'object') {
                Object.assign(toastEl.style, opts.style);
            }

            if (opts.destination) {
                toastEl.style.cursor = 'pointer';
                toastEl.addEventListener('click', () => {
                    if (opts.newWindow === false) {
                        window.location = opts.destination;
                    } else {
                        window.open(opts.destination, '_blank');
                    }
                });
            }

            if (typeof opts.onClick === 'function') {
                toastEl.addEventListener('click', opts.onClick);
            }

            if (opts.stopOnFocus) {
                toastEl.addEventListener('mouseenter', () => clearTimeout(timeoutId));
                toastEl.addEventListener('mouseleave', startTimer);
            }
        }

        function startTimer() {
            if (!opts.duration) {
                return;
            }
            timeoutId = window.setTimeout(hide, opts.duration);
        }

        function showToast() {
            buildToast();
            const container = createContainer(opts.gravity, opts.position);
            const offsetX = typeof opts.offset?.x === 'number' ? `${opts.offset.x}px` : (opts.offset?.x || '12px');
            const offsetY = typeof opts.offset?.y === 'number' ? `${opts.offset.y}px` : (opts.offset?.y || '12px');
            container.style.setProperty('--offset-x', offsetX);
            container.style.setProperty('--offset-y', offsetY);
            container.appendChild(toastEl);
            startTimer();
        }

        function hide() {
            if (!toastEl) {
                return;
            }
            toastEl.classList.add('toastify-hide');
            toastEl.addEventListener('animationend', () => toastEl.remove(), { once: true });
        }

        return {
            showToast
        };
    };
})();
