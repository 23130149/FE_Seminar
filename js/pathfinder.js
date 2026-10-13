const Pathfinder = (() => {
    const DIRS = [
        { dr: -1, dc: 0 },
        { dr: 1,  dc: 0 },
        { dr: 0,  dc: -1 },
        { dr: 0,  dc: 1 }
    ];


    function findConnection(grid, start, end) {
        const rows = grid.length;
        const cols = grid[0].length;

        const isOpen = (r, c) => {
            if (r < -1 || r > rows || c < -1 || c > cols) return false;
            if (r === end.r && c === end.c) return true;
            if (r < 0 || r >= rows || c < 0 || c >= cols) return true;
            return grid[r][c] === null;
        };

        const visited = new Set();
        const queue = [];

        for (let d = 0; d < 4; d++) {
            queue.push({ r: start.r, c: start.c, dir: d, turns: 0, path: [{ r: start.r, c: start.c }] });
        }

        let head = 0;
        while (head < queue.length) {
            const cur = queue[head++];
            const nr = cur.r + DIRS[cur.dir].dr;
            const nc = cur.c + DIRS[cur.dir].dc;

            if (nr === end.r && nc === end.c) {
                return [...cur.path, { r: nr, c: nc }];
            }
            if (!isOpen(nr, nc)) continue;

            const key = `${nr},${nc},${cur.dir},${cur.turns}`;
            if (visited.has(key)) continue;
            visited.add(key);

            const newPath = [...cur.path, { r: nr, c: nc }];

            queue.push({ r: nr, c: nc, dir: cur.dir, turns: cur.turns, path: newPath });

            if (cur.turns < 2) {
                for (let d = 0; d < 4; d++) {
                    if (d === cur.dir) continue;
                    queue.push({ r: nr, c: nc, dir: d, turns: cur.turns + 1, path: newPath });
                }
            }
        }
        return null;
    }

    return { findConnection };
})();