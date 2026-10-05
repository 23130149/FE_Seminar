(()=>{
    const el = id => document.getElementById(id);

    const screenMenu = el('screen-menu');
    const screenGame = el('screen-game');
    const levelList = el('level-list');

    const modelHowto =el('model-howto');
    const modelPause = el('model-pause');

        function showScreen(name){
            screenMenu.classList.toggle('screen-isactive', name === 'menu');
            screenMenu.classList.toggle('screen-isactive',name === 'game');
        }
        function openModel(m){
            m.classList.add('is-open');
        }
        function closeModel(m){m.classList.remove('is-open');}

        LEVELS.forEach((lv,index)=>{
            const btn = document.createElement('button');
            btn.className = 'btn-level';
            btn.textContent = lv.name;
            btn.addEventListener('click',()=>{
                showScreen('game');
            });
           levelList.appendChild(btn);
        });

        el('btn-how-to-play').addEventListener('click',()=>openModel(modelHowto));
        document.querySelectorAll('[data-close]').forEach(btn =>{
            btn.addEventListener('click',()=>{
                const target = el('model-'+ btn.dataset.close);
                if(target) closeModel(target);
            });
        });
        el('btn-pause').addEventListener('click',()=>openModel(modelPause));
        el('btn-resume').addEventListener('click',()=>closeModel(modelPause));
        el('btn-back-menu').addEventListener('click',()=>{
            closeModel(modelPause);
            showScreen('menu');
        });
    showScreen('menu');
})();
