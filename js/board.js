const Board = (() => {
    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function generate({ rows, cols, iconTypes }) {
        const total = rows * cols;
        const icons = ICON_SET.slice(0, iconTypes);
        const pool = [];
        for (let i = 0; pool.length < total; i++) {
            const icon = icons[i % icons.length];
            pool.push(icon, icon);
        }
        shuffleArray(pool);

        const grid = [];
        let idx = 0;
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) row.push(pool[idx++]);
            grid.push(row);
        }
        return grid;
    }

    function reshuffleRemaining(grid) {
        const values = [];
        const positions = [];
        grid.forEach((row, r) => row.forEach((val, c) => {
            if (val !== null) { values.push(val); positions.push({ r, c }); }
        }));
        shuffleArray(values);
        positions.forEach((p, i) => { grid[p.r][p.c] = values[i]; });
    }

    function findHint(grid) {
        const byIcon = new Map();
        grid.forEach((row, r) => row.forEach((val, c) => {
            if (val === null) return;
            if (!byIcon.has(val)) byIcon.set(val, []);
            byIcon.get(val).push({ r, c });
        }));

        for (const cells of byIcon.values()) {
            for (let i = 0; i < cells.length; i++) {
                for (let j = i + 1; j < cells.length; j++) {
                    const path = Pathfinder.findConnection(grid, cells[i], cells[j]);
                    if (path) return { a: cells[i], b: cells[j], path };
                }
            }
        }
        return null;
    }

    function isCleared(grid) {
        return grid.every(row => row.every(v => v === null));
    }

    return { generate, reshuffleRemaining, findHint, isCleared };
})();