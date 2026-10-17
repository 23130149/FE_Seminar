const Pathfinder = (() => {
    const DIRECTIONS = [
        { deltaRow: -1, deltaCol: 0 },   // lên
        { deltaRow: 1,  deltaCol: 0 },   // xuống
        { deltaRow: 0,  deltaCol: -1 },  // trái
        { deltaRow: 0,  deltaCol: 1 }    // phải
    ];

    function findConnection(grid, start, end) {
        const rows = grid.length;
        const cols = grid[0].length;

        const isOpen = (row, col) => {
            if (row < -1 || row > rows || col < -1 || col > cols) return false;
            if (row === end.row && col === end.col) return true;
            if (row < 0 || row >= rows || col < 0 || col >= cols) return true;
            return grid[row][col] === null;
        };

        const visited = new Set();
        const queue = [];

        for (let direction = 0; direction < 4; direction++) {
            queue.push({
                row: start.row,
                col: start.col,
                direction,
                turns: 0,
                path: [{ row: start.row, col: start.col }]
            });
        }

        let head = 0;
        while (head < queue.length) {
            const current = queue[head++];
            const { deltaRow, deltaCol } = DIRECTIONS[current.direction];
            const nextRow = current.row + deltaRow;
            const nextCol = current.col + deltaCol;

            if (nextRow === end.row && nextCol === end.col) {
                return [...current.path, { row: nextRow, col: nextCol }];
            }

            if (!isOpen(nextRow, nextCol)) continue;

            const key = `${nextRow},${nextCol},${current.direction},${current.turns}`;
            if (visited.has(key)) continue;
            visited.add(key);

            const newPath = [...current.path, { row: nextRow, col: nextCol }];

            queue.push({
                row: nextRow,
                col: nextCol,
                direction: current.direction,
                turns: current.turns,
                path: newPath
            });

            if (current.turns < 2) {
                for (let direction = 0; direction < 4; direction++) {
                    if (direction === current.direction) continue;
                    queue.push({
                        row: nextRow,
                        col: nextCol,
                        direction,
                        turns: current.turns + 1,
                        path: newPath
                    });
                }
            }
        }
        return null;
    }

    return { findConnection };
})();