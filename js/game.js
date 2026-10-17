(() => {
    const el = id => document.getElementById(id);

    const TILE = 48;
    const GAP = 4;
    const REMOVE_MS = 350;
    const HINT_MS = 1500;
    const FLIP_BACK_MS = 700;

    const screenMenu = el('screen-menu');
    const screenGame = el('screen-game');
    const levelList = el('level-list');
    const boardEl = el('board');
    const svg = el('connector-svg');
    const hudScore = el('hud-score');
    const hudLevel = el('hud-level');
    const timeFill = el('time-fill');
    const timeText = el('time-text');
    const hintCount = el('hint-count');
    const shuffleCount = el('shuffle-count');
    const modalHowto = el('model-howto');
    const modalPause = el('model-pause');
    const modalResult = el('model-result');

    const state = {
        levelIndex: 0,
        config: null,
        grid: [],
        boxEls: [],
        faceUp: [],
        selected: null,
        score: 0,
        timeLeft: 0,
        timerId: null,
        hintsLeft: 0,
        shufflesLeft: 0,
        paused: false,
        busy: false,
        over: false
    };

    function isFaceDownLevel() { return !!state.config.faceDown; }

    function showScreen(name) {
        screenMenu.style.display = name === 'menu' ? 'flex' : 'none';
        screenGame.style.display = name === 'game' ? 'flex' : 'none';
    }
    function openModal(modal) { modal.style.display = 'flex'; }
    function closeModal(modal) { modal.style.display = 'none'; }

    function goMenu() {
        stopTimer();
        state.paused = false;
        state.busy = false;
        state.over = false;
        closeModal(modalPause);
        closeModal(modalResult);
        showScreen('menu');
    }

    LEVELS.forEach((level, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn-level';
        btn.textContent = level.name;
        btn.addEventListener('click', () => {
            state.score = 0;
            startLevel(index);
        });
        levelList.appendChild(btn);
    });

    el('btn-how-to-play').addEventListener('click', () => openModal(modalHowto));
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(el('model-' + btn.dataset.close)));
    });

    el('btn-menu').addEventListener('click', goMenu);
    el('btn-pause').addEventListener('click', () => {
        if (state.over) return;
        state.paused = true;
        openModal(modalPause);
    });
    el('btn-hint').addEventListener('click', onHint);
    el('btn-shuffle').addEventListener('click', onShuffle);

    el('btn-resume').addEventListener('click', () => {
        state.paused = false;
        closeModal(modalPause);
    });
    el('btn-restart').addEventListener('click', () => {
        closeModal(modalPause);
        startLevel(state.levelIndex);
    });
    el('btn-back-menu').addEventListener('click', goMenu);

    el('btn-result-next').addEventListener('click', () => {
        closeModal(modalResult);
        if (state.levelIndex + 1 < LEVELS.length) startLevel(state.levelIndex + 1);
        else goMenu();
    });
    el('btn-result-retry').addEventListener('click', () => {
        closeModal(modalResult);
        startLevel(state.levelIndex);
    });
    el('btn-result-menu').addEventListener('click', goMenu);

    function startLevel(index) {
        stopTimer();
        state.levelIndex = index;
        state.config = LEVELS[index];
        state.grid = Board.generate(state.config);
        state.faceUp = state.grid.map(rowValues => rowValues.map(() => !isFaceDownLevel()));
        state.selected = null;
        state.timeLeft = state.config.timeLimit;
        state.hintsLeft = state.config.hints;
        state.shufflesLeft = state.config.shuffles;
        state.paused = false;
        state.busy = false;
        state.over = false;

        hudLevel.textContent = index + 1;
        hudScore.textContent = state.score;
        hintCount.textContent = state.hintsLeft;
        shuffleCount.textContent = state.shufflesLeft;

        renderBoard();
        updateTimerUI();
        showScreen('game');
        state.timerId = setInterval(tick, 1000);
    }

    function renderBoard() {
        const { rows, cols } = state.config;

        boardEl.innerHTML = '';
        boardEl.style.gridTemplateColumns = `repeat(${cols}, ${TILE}px)`;
        boardEl.style.gap = GAP + 'px';

        const width = cols * TILE + (cols - 1) * GAP;
        const height = rows * TILE + (rows - 1) * GAP;
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        clearConnector();

        state.boxEls = [];
        for (let row = 0; row < rows; row++) {
            const rowBoxes = [];
            for (let col = 0; col < cols; col++) {
                const box = document.createElement('div');
                box.className = 'box';
                box.addEventListener('click', () => onBoxClick(row, col));
                boardEl.appendChild(box);
                rowBoxes.push(box);
            }
            state.boxEls.push(rowBoxes);
        }
        refreshBoxes();
    }

    function renderBox(row, col) {
        const value = state.grid[row][col];
        const box = state.boxEls[row][col];
        const hidden = isFaceDownLevel() && !state.faceUp[row][col] && value !== null;

        box.textContent = '';

        if (value === null || hidden) {
            box.style.backgroundImage = 'none';
        } else {
            box.style.backgroundImage = `url("${value}")`;
        }

        box.classList.toggle('is-empty', value === null);
        box.classList.toggle('is-back', hidden);
    }

    function refreshBoxes() {
        const { rows, cols } = state.config;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) renderBox(row, col);
        }
    }

    function select(row, col) {
        state.selected = { row, col };
        state.boxEls[row][col].classList.add('is-selected');
    }

    function deselect() {
        if (!state.selected) return;
        const { row, col } = state.selected;
        state.boxEls[row][col].classList.remove('is-selected');
        state.selected = null;
    }

    function onBoxClick(row, col) {
        if (isFaceDownLevel()) {
            onFlipClick(row, col);
            return;
        }
        if (state.paused || state.busy || state.over) return;

        const value = state.grid[row][col];
        if (value === null) return;

        if (!state.selected) {
            select(row, col);
            return;
        }

        const first = state.selected;

        if (first.row === row && first.col === col) {
            deselect();
            return;
        }

        if (state.grid[first.row][first.col] !== value) {
            deselect();
            select(row, col);
            return;
        }

        const path = Pathfinder.findConnection(state.grid, first, { row, col });
        if (!path) {
            deselect();
            select(row, col);
            return;
        }

        matchPair(first, { row, col }, path);
    }

    function onFlipClick(row, col) {
        if (state.paused || state.busy || state.over) return;
        if (state.grid[row][col] === null || state.faceUp[row][col]) return;

        state.faceUp[row][col] = true;
        renderBox(row, col);

        if (!state.selected) {
            state.selected = { row, col };
            return;
        }

        const first = state.selected;
        const second = { row, col };
        state.selected = null;
        state.busy = true;

        const sameIcon = state.grid[first.row][first.col] === state.grid[second.row][second.col];
        const path = sameIcon ? Pathfinder.findConnection(state.grid, first, second) : null;

        if (path) {
            drawConnector(path);
            addScore(state.config.scorePerPair);
            setTimeout(() => {
                removePair(first, second);
                clearConnector();
                state.busy = false;
                afterRemove();
            }, REMOVE_MS);
        } else {
            setTimeout(() => {
                state.faceUp[first.row][first.col] = false;
                state.faceUp[second.row][second.col] = false;
                refreshBoxes();
                state.busy = false;
            }, FLIP_BACK_MS);
        }
    }

    function matchPair(first, second, path) {
        deselect();
        state.busy = true;
        drawConnector(path);
        addScore(state.config.scorePerPair);

        setTimeout(() => {
            removePair(first, second);
            clearConnector();
            state.busy = false;
            afterRemove();
        }, REMOVE_MS);
    }

    function addScore(points) {
        state.score += points;
        hudScore.textContent = state.score;
    }

    function removePair(first, second) {
        state.grid[first.row][first.col] = null;
        state.grid[second.row][second.col] = null;
        refreshBoxes();
    }

    function afterRemove() {
        if (Board.isCleared(state.grid)) {
            onWin();
            return;
        }
        ensurePlayable();
    }

    function ensurePlayable() {
        let attempts = 0;
        while (!Board.findHint(state.grid) && attempts < 30) {
            Board.reshuffleRemaining(state.grid);
            attempts++;
        }
        refreshBoxes();
    }

    function drawConnector(path) {
        const points = path
            .map(pos => `${pos.col * (TILE + GAP) + TILE / 2},${pos.row * (TILE + GAP) + TILE / 2}`)
            .join(' ');
        svg.innerHTML = `<polyline points="${points}"></polyline>`;
    }

    function clearConnector() {
        svg.innerHTML = '';
    }

    function onHint() {
        if (state.paused || state.busy || state.over || state.hintsLeft <= 0) return;
        const hint = Board.findHint(state.grid);
        if (!hint) return;

        state.hintsLeft--;
        hintCount.textContent = state.hintsLeft;

        [hint.first, hint.second].forEach(pos => {
            const box = state.boxEls[pos.row][pos.col];
            box.classList.add('is-hint');
            setTimeout(() => box.classList.remove('is-hint'), HINT_MS);
        });
    }

    function onShuffle() {
        if (state.paused || state.busy || state.over || state.shufflesLeft <= 0) return;

        if (isFaceDownLevel() && state.selected) {
            const { row, col } = state.selected;
            state.faceUp[row][col] = false;
        }
        deselect();

        state.shufflesLeft--;
        shuffleCount.textContent = state.shufflesLeft;
        Board.reshuffleRemaining(state.grid);
        ensurePlayable();
    }

    function tick() {
        if (state.paused || state.over) return;
        state.timeLeft--;
        updateTimerUI();
        if (state.timeLeft <= 0) onLose();
    }

    function stopTimer() {
        clearInterval(state.timerId);
        state.timerId = null;
    }

    function updateTimerUI() {
        const remaining = Math.max(0, state.timeLeft);
        const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
        const seconds = String(remaining % 60).padStart(2, '0');
        timeText.textContent = `${minutes}:${seconds}`;
        timeFill.style.width = (remaining / state.config.timeLimit * 100) + '%';
    }

    function onWin() {
        stopTimer();
        state.over = true;

        const bonus = state.timeLeft * 2;
        addScore(bonus);

        el('result-title').textContent = 'Chúc mừng! Qua màn';
        el('result-desc').textContent = `Thưởng thời gian: +${bonus} điểm`;
        el('result-score').textContent = state.score;
        el('btn-result-next').style.display =
            state.levelIndex + 1 < LEVELS.length ? 'block' : 'none';

        openModal(modalResult);
    }

    function onLose() {
        stopTimer();
        state.over = true;

        el('result-title').textContent = 'Hết giờ!';
        el('result-desc').textContent = 'Thử lại nhé.';
        el('result-score').textContent = state.score;
        el('btn-result-next').style.display = 'none';

        openModal(modalResult);
    }

    showScreen('menu');
})();