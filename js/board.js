const Board = (() => {
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function buildGrid(config) {
        const { rows, cols, iconTypes } = config;
        const total = rows * cols;
        const icons = ICON_SET.slice(0, iconTypes);

        const values = [];
        for (let i = 0; values.length < total; i++) {
            const icon = icons[i % icons.length];
            values.push(icon, icon);
        }
        shuffleArray(values);

        const grid = [];
        let index = 0;
        for (let row = 0; row < rows; row++) {
            const rowValues = [];
            for (let col = 0; col < cols; col++) {
                rowValues.push(values[index++]);
            }
            grid.push(rowValues);
        }
        return grid;
    }

    function generate(config) {
        for (let attempt = 0; attempt < 100; attempt++) {
            const grid = buildGrid(config);
            if (findHint(grid)) return grid;
        }
        return buildGrid(config);
    }

    function reshuffleRemaining(grid) {
        const values = [];
        const positions = [];
        grid.forEach((rowValues, row) => rowValues.forEach((value, col) => {
            if (value !== null) {
                values.push(value);
                positions.push({ row, col });
            }
        }));
        shuffleArray(values);
        positions.forEach((pos, i) => {
            grid[pos.row][pos.col] = values[i];
        });
    }

    function findHint(grid) {
        const positionsByIcon = new Map();
        grid.forEach((rowValues, row) => rowValues.forEach((value, col) => {
            if (value === null) return;
            if (!positionsByIcon.has(value)) positionsByIcon.set(value, []);
            positionsByIcon.get(value).push({ row, col });
        }));

        for (const positions of positionsByIcon.values()) {
            for (let i = 0; i < positions.length; i++) {
                for (let j = i + 1; j < positions.length; j++) {
                    const path = Pathfinder.findConnection(grid, positions[i], positions[j]);
                    if (path) return { first: positions[i], second: positions[j], path };
                }
            }
        }
        return null;
    }

    function isCleared(grid) {
        return grid.every(rowValues => rowValues.every(value => value === null));
    }

    return { generate, reshuffleRemaining, findHint, isCleared };
})();