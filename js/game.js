(()=>{
    const el = id => document.getElementById(id);

    const screenMenu = el('screen-menu');
    const screenGame = el('screen-game');
    const levelList = el('level-list');

    const svg = el('connector-svg');
    const boardEl = el('board');
    // hud
    const hudScore =el('hud-score');
    const hudLevel= el('hud-level');
    const timeFill = el('time-fill');
    const hintCount = el('hint-count');
    const shuffleCount = el('shuffle-count');


    const modelHowto =el('model-howto');
    const modelPause = el('model-pause');
    const modelResult = el('model-result');

    const state ={
        levelIndex: 0,
        config: null,
        grid: [],
        tileEls: [],
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

        function showScreen(name){
           screenMenu.style.display = name === 'menu' ? 'flex' : 'none';
           screenMenu.style.display = name === 'game' ? 'flex' : 'none';
        }
        function openModel(m){
            m.style.display = 'flex';
        }
        function closeModel(m){m.style.display = 'none';}

        function goMenu(){
            stopTimer();
            state.paused = false;
            state.busy = false;
            state.over = false;
            closeModel(modelPause);
            closeModel(modelResult);
            showScreen('menu');
        }

        LEVELS.forEach((lv,index)=>{
            const btn = document.createElement('button');
            btn.className = 'btn-level';
            btn.textContent = lv.name;
            btn.addEventListener('click',()=>{
                state.score = 0;
                startLevel(index);
            });
           levelList.appendChild(btn);
        });

        el('btn-how-to-play').addEventListener('click',()=>openModel(modelHowto));
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => closeModel(el('model-' + btn.dataset.close)));
        });

        el('btn-menu').addEventListener('click',goMenu);
        el('btn-pause').addEventListener('click',() =>{
          if(state.over) return;
          state.paused = true;
          openModel(modelPause);
        });
        el('btn-resume').addEventListener('click',()=>closeModel(modelPause));
        el('btn-back-menu').addEventListener('click',()=>{
            closeModel(modelPause);
            showScreen('menu');
        });
    showScreen('menu');
})();
