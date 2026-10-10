const Board =(() => {
    function shuffleArray(arr){
        for(let i = arr.length -1 ; i > 0 ; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }







        return arr;
    } function isCleared(grid) {
        return grid.every(row => row.every(v => v === null));
    }
    return{} ;
})();