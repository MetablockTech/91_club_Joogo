(function() {
    function initDraggable() {
        const el = document.getElementById('customerId');
        if (!el) return;

        let isDragging = false;
        let currentX, currentY, initialX, initialY;
        let xOffset = 0, yOffset = 0;

        // Restore position from localStorage
        const savedX = localStorage.getItem('customerIconX');
        const savedY = localStorage.getItem('customerIconY');
        if (savedX !== null && savedY !== null) {
            el.style.right = 'auto';
            el.style.bottom = 'auto';
            el.style.left = savedX + 'px';
            el.style.top = savedY + 'px';
        }

        // Apply necessary styles
        el.style.cursor = 'move';
        el.style.touchAction = 'none';
        el.style.userSelect = 'none';
        el.style.webkitUserSelect = 'none';

        el.addEventListener("touchstart", dragStart, { passive: false });
        el.addEventListener("touchend", dragEnd, { passive: false });
        el.addEventListener("touchmove", drag, { passive: false });

        el.addEventListener("mousedown", dragStart, { passive: false });
        document.addEventListener("mousemove", drag, { passive: false });
        document.addEventListener("mouseup", dragEnd, { passive: false });

        function dragStart(e) {
            const rect = el.getBoundingClientRect();
            if (e.type === "touchstart") {
                initialX = e.touches[0].clientX - rect.left;
                initialY = e.touches[0].clientY - rect.top;
            } else {
                initialX = e.clientX - rect.left;
                initialY = e.clientY - rect.top;
            }

            if (e.target === el || el.contains(e.target)) {
                isDragging = true;
                xOffset = 0;
                yOffset = 0;
            }
        }

        function dragEnd() {
            if (isDragging) {
                // Save position to localStorage on drag end
                const rect = el.getBoundingClientRect();
                localStorage.setItem('customerIconX', rect.left);
                localStorage.setItem('customerIconY', rect.top);
            }
            isDragging = false;
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();

                let clientX, clientY;
                if (e.type === "touchmove") {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else {
                    clientX = e.clientX;
                    clientY = e.clientY;
                }

                // Desired position
                let newX = clientX - initialX;
                let newY = clientY - initialY;

                // Clamp to viewport
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const rect = el.getBoundingClientRect();
                
                newX = Math.max(0, Math.min(newX, viewportWidth - rect.width));
                newY = Math.max(0, Math.min(newY, viewportHeight - rect.height));

                // Convert absolute clamped to relative translate
                // This is still messy. Let's just use fixed top/left for the drag duration.
                el.style.right = 'auto';
                el.style.bottom = 'auto';
                el.style.left = newX + 'px';
                el.style.top = newY + 'px';
                el.style.transform = 'none';
                
                xOffset += 1; // Increment movement counter
            }
        }

        function setTranslate(xPos, yPos, el) {
            el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
        }

        // Intercept click if dragged
        el.addEventListener('click', function(e) {
            if (Math.abs(xOffset) > 5 || Math.abs(yOffset) > 5) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDraggable);
    } else {
        initDraggable();
    }
})();
