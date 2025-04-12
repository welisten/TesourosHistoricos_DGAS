// Modularizar estados booleanos que podem crescer
// Comentário leve por seção ou contexto

const savedDarkMode = (() => {
    try {
        return  JSON.parse(localStorage.getItem('isDarkMode')) ?? false
    } catch {
        return false
    }
})()

const gameData = {
     // Estado de carregamento
     isPreloadComplete: false,

    //  Cenas
     intro: undefined,
     score: undefined,
     class: 'Preload',
     
     // Jogo
     lastLevel: 1,
     isPaused: false,
 
     // UI
     isMute: false,
     isDarkMode: savedDarkMode,
     isClickable: true,
 
     // Acessibilidade
     isScreenReaderActive: false,
     isLibrasActive: false,
     lastAccText: '',
     lastReadText: '',

     // Auxiliares
     lastBtnTarget: undefined
}

export{
    gameData
}