/**
 * @class BoardRender
 * @classdesc Responsável por renderizar e controlar a lógica visual do tabuleiro do jogo da memória.
 * 
 * Esta classe lida com a criação do layout do tabuleiro, instanciamento das cartas, controle de foco para acessibilidade,
 * e atualização da interface visual conforme as cartas são manipuladas. Ela também gerencia a criação do botão de pausa e a
 * interação com leitores de tela e o modo Libras, promovendo acessibilidade para diferentes públicos.
 * 
 * @param {string} containerSelector - Seletor CSS do container onde o tabuleiro será renderizado.
 * @param {Function} onCardsClick - Função de callback chamada quando uma carta é clicada.
 * @param {Object} user - Objeto representando o jogador atual, com dados como nível e tesouros.
 * @param {number} size - Quantidade total de cartas (deve formar um quadrado perfeito).
 * @param {Object} gameMemory - Objeto que encapsula funcionalidades do jogo como controle de áudio e cronômetro.
 * 
 * @property {HTMLElement} container - Referência ao elemento DOM que representa o tabuleiro.
 * @property {Function} onCardsClick - Callback para clique nas cartas.
 * @property {Card[]} cards - Array de instâncias da classe Card que representam cada carta do tabuleiro.
 * @property {HTMLElement[]} elemArry - Array dos elementos HTML das cartas para controle de foco e acessibilidade.
 * @property {number[]} orderedArray - Array ordenado usado para mapeamento do tabindex.
 * @property {number[]} unorderedArray - Array desordenado usado para navegação e rotação dos tabindex.
 * @property {Object} user - Dados do jogador atual.
 * @property {number} size - Tamanho do tabuleiro (número de cartas).
 * @property {Object} gameMemory - Referência à instância do jogo que gerencia música, acessibilidade, entre outros.
 * @property {Object} accessibilityManager - Gerencia a acessibilidade do Jogo
 * */

import { colors } from '../../Consts/Colors.js';
import { cardsImagesDataArr } from '../../Consts/Values.js'
import { Card } from '../../Class/Card.js'
import { getDeviceSize } from '../../js/utils/getDeviceSize.js';
import { gameData } from '../../Consts/gameData.js';
import { AccessibilityManager } from './AccessibilityManager.js';

export default class BoardRender{
    constructor(containerSelector, onCardsClick, user, size, gameMemory){
        this.container = document.querySelector(containerSelector)
        this.onCardsClick = onCardsClick
        this.cards = []
        this.elemArry = []
        this.orderedArray = undefined
        this.unorderedArray = undefined
        this.user = user
        this.size = size
        this.gameMemory =  gameMemory// retirar apartir da v@0.1.0
        this.accessibilityManager = new AccessibilityManager()

        this.presetGameElements()
    }
    /**
     * Cria e inicializa o tabuleiro, configurando as réguas e elementos necessários.
     * @throws {Error} Se o tamanho do tabuleiro não formar um quadrado perfeito.
     */
    presetGameElements(){       //PRÉ CONFIGURAÇÃO E CRIAÇÃO PARA AS REGUAS(HORIZ. VERTI.) E GAMEBOARD RESPECTIVAMENTE
        const rulers = document.querySelectorAll('.ruler')
        rulers.forEach(ruler => ruler.style.display = 'flex')
        
        let [height]  = getDeviceSize()
        let sqrt = Math.sqrt(this.size)
        if(!Number.isInteger(sqrt)){
            throw new Error(`Tamanho do tabuleiro inválido: ${sqrt} cartas não formam um quadrado perfeito.`)
        }

        this.container.style.display = 'grid'
        this.container.style.gridTemplateColumns = `repeat(${sqrt}, ${100 / sqrt}%)`
        this.container.style.border = '3px solid var(--blue-baby)'
        this.container.style.height = `${height}px` 
        this.container.style.width = `${height}px` 
        this.container.setAttribute('tabindex', '1')
        this.container.setAttribute('aria-label', 'tabuleiro')

        if(gameData.isScreenReaderActive || gameData.isLibrasActive){
            let controls = document.querySelector('#gameControls')
            controls.style.display = 'none'
        }

        this.createPauseBtn()

        this.orderedArray = this.createSortedArr(2, 17)
        this.unorderedArray = this.createUnsortedArr(2, 17)
    } 

    /**
     * Cria um array ordenado de números entre os valores `min` e `max`.
     * Organiza os números de acordo com uma matriz quadrada.
     * @param {number} min O valor mínimo do intervalo.
     * @param {number} max O valor máximo do intervalo.
     * @returns {number[]} Array ordenado de números.
     */
    createSortedArr(min, max){
        const sqrt = Math.sqrt((max - min) + 1)
        const outArray = new Array((max - min) + 1)
        
        let idx = 0
        for(let i = 0; i < sqrt; i++){
            for(let j = min; j <= max; j += sqrt, idx++){
                outArray[idx] = j + i
            }
        }

        return outArray
    }

    /**
     * Cria um array simples de números entre `min` e `max`.
     * @param {number} min O valor mínimo do intervalo.
     * @param {number} max O valor máximo do intervalo.
     * @returns {number[]} Array de números não ordenados.
     */
    createUnsortedArr(min, max){
        const outArray = new Array((max - min) + 1)
        let idx = 0

        for(let i = min; i <= max; i++, idx++){
            outArray[idx] = i
        }
        return outArray
    }

    
    /**
     * Cria um array embaralhado de cartas, com base nos dados de `cardsImagesDataArr`.
     * Cada carta é representada como um objeto `Card` e as cartas são posicionadas aleatoriamente.
     */
    createShuffledCardsArray(){
        const allCardsValues = []

        for(let dataObj of cardsImagesDataArr){ //OBTEM OS ATRIBUTOS
            allCardsValues.push([`${dataObj.name}_1`, this.getImage(`${dataObj.name}_1`), dataObj.description, dataObj.src])
            allCardsValues.push([`${dataObj.name}_2`, this.getImage(`${dataObj.name}_2`), dataObj.description, dataObj.src])
        }

        allCardsValues.sort(() => Math.random() - 0.5);                              //ORDENA ALEATÓRIA E ARBITRARIALMENTE
        
        let idx = 0
        const columns = ['A', 'B', 'C', 'D']

        for(let x = 0; x < 4; x++){                                             // INSTANCIA AS CARTAS POSICIONANDOAS NA RÉGUA HxV
            for(let y = 0; y < 4; y++, idx++){
                this.cards.push(new Card(
                    allCardsValues[idx][0],         //name
                    columns[y],                     //column
                    x + 1,                          // row
                    allCardsValues[idx][1],         // image
                    allCardsValues[idx][2],         // description
                    allCardsValues[idx][3]          // src
                )) 
            }
        }
    }

    /**
     * Renderiza o tabuleiro, criando as cartas e configurando seus eventos de interação.
     * @param {number} firstElemIdx Índice da primeira carta a ser renderizada.
     */
    render(firstElemIdx = 0){
        document.title = `Seja bem vindo! a fase ${this.user.level} começou !`
        this.container.innerHTML = '' //Limpa o tabuleiro

        this.createShuffledCardsArray()
        this.createAndSetupCardsElement()
        this.mapCardsTabindex(firstElemIdx, this.elemArry)
    }

    /**
     * Cria e configura os elementos DOM das cartas e suas propriedades acessíveis.
     */
    createAndSetupCardsElement(){
        const elementTag = gameData.isScreenReaderActive ? 'p' : 'div'

        this.cards.forEach((card, index) => {
            const cardElement = document.createElement(elementTag);
            const cardImage =  card.imageEl

            cardElement.appendChild(cardImage)
            
            cardElement.setAttribute('data-index', index) 
            cardElement.setAttribute('tabindex',   index) //ajustar 
            cardElement.setAttribute('aria-label', `${card.location.column}${card.location.row}`) 
            cardImage.setAttribute('alt', card.description) 
            cardImage.setAttribute('title', card.name) 
            cardElement.classList.add('card');

            cardElement.addEventListener('click', (e) => {
                this.onCardsClick(e, index)
                document.title = this.user.treasures <= 7 ? `${card.location.column}${card.location.row}` : `Placar da fase ${this.user.level}`
            })
            cardElement.addEventListener('focus', () => this.onCardsFocus(card, cardElement))  
                        
            this.container.appendChild(cardElement)
            this.elemArry.push(cardElement)
        })
    }

    /**
     * Atualiza o estado do tabuleiro, alterando o visual das cartas.
     * @param {number} flippedCardindex Índice da carta virada.
     */
    updateBoard(flippedCardindex = 0){
        const cardElements = this.container.querySelectorAll('.card');

        this.cards.forEach((card, index) => {
            const el = cardElements[index];
            if (!el) return;
            
            el.classList.toggle('flipped', card.isFlipped || card.isMatched );
            el.classList.toggle('matched', card.isMatched);
            el.classList.toggle('isNotMatched', card.incorrectMatch);
            el.setAttribute('aria-label', card.isFlipped ?
                `${card.location.column}${card.location.row}. ${card.name}` 
                :
                `${card.location.column}${card.location.row}`
            );
        });
        this.mapCardsTabindex(flippedCardindex, this.elemArry)
    }

    
    /**
     * Reinicia o tabuleiro, apagando as cartas e recomeçando a renderização.
     */
    resetBoard(){
        this.cards = []
        this.elemArry = []
        this.orderedArray = []
        this.unorderedArray = []

        this.render()
        this.createPauseBtn()
    }

    /**
     * Mapeia e ajusta os índices de tabulação (tabindex) das cartas no tabuleiro.
     * @param {number} firstEle Índice da primeira carta.
     * @param {HTMLElement[]} elemArray Array de elementos DOM das cartas.
     */
    // A lógica de rotação de tabIndex (em mapCardsTabindex) pode ser complexa demais para manutenção.
    // Poder ser simplificada com uma abordagem baseada em arrays 2D ou maps.
    mapCardsTabindex( firstEle, elemArray){
        let amount = this.size
        let sqrt = Math.sqrt(amount)
        let col = firstEle % 4
        let row = Math.floor(firstEle / 4) 
        let mtSorted =  []

        let aux = 0
        let auxArr = []
        
        for(let i = 0; i < amount; i += sqrt){
            mtSorted.push(this.orderedArray.slice(i, i + sqrt))
        }

        mtSorted.forEach( (array) => {
            for(let i = col; i > 0; i--){
                aux = array.pop()
                array.unshift(aux)
            }
        })

        for(let i = row; i > 0; i--){
            aux = mtSorted[4 - i].pop()
            mtSorted[4 - i].unshift(aux)
        }
        for(let i = row; i > 0; i--){
           auxArr =  mtSorted.pop()
           mtSorted.unshift(auxArr)
        }

        mtSorted = mtSorted.flat()
        elemArray.forEach((elem, i) => {
            elem.setAttribute('tabindex', mtSorted[i])
        })
    }

    /**
     * Atualiza a acessibilidade do elemento quando a carta recebe foco.
     * @param {Card} card Objeto que representa a carta.
     * @param {HTMLElement} cardElement Elemento DOM que representa a carta.
     */
    onCardsFocus(card, cardElement){
        if(card.isFlipped){
            let name = card.name.split("_")[0]
            cardElement.setAttribute('aria-label', `${card.location.column}${card.location.row}. ${name}`)
        } 
    }

    /**
     * Obtém a imagem da carta a partir do objeto global de pré-carregamento.
     * @param {string} name Nome da carta (identificador da imagem).
     * @returns {HTMLImageElement} Imagem correspondente ao nome.
     */
    getImage(name){                 // RETORNA A IMAGEM DO OBJ GLOBAL, ARMAZENADA NO PRELOAD (BLOB)
        return gameAssets[name]
    }

    /**
     * Cria o botão de pausar o jogo, com lógica de controle e acessibilidade.
     */
    createPauseBtn(){
        // Extração de métodos depois da v@0.1.0
        const mainContainer =  document.querySelector('#game_Container')
        
        let isReplay = mainContainer.querySelector('.pause_btn') // se já houver um pause btn, significa que não é a primeira partida
        if(isReplay) return
       
        const pauseBtn = document.createElement('button')
        const btnIcon =  document.createElement('icon')

        let label = gameData.isPaused ? 'Play no jogo' : 'Pausar Jogo'
        let iconClass = gameData.isPaused ? 'fa-play' : 'fa-pause'
        
        pauseBtn.setAttribute('class', 'pause_btn controlBtn')
        pauseBtn.setAttribute('id', 'pause')
        pauseBtn.setAttribute('title', 'botão de pausar')
        pauseBtn.setAttribute('tabindex', '18')
        pauseBtn.setAttribute('aria-label', label)
        
        btnIcon.setAttribute('class', `fa-solid ${iconClass}`)
        pauseBtn.appendChild(btnIcon)
        mainContainer.appendChild(pauseBtn)
        
        pauseBtn.addEventListener('click', () => {
            toggleIconClass(btnIcon)
            gameData.isPaused = !gameData.isPaused
            if(gameData.isScreenReaderActive || gameData.isLibrasActive){
              toggleDisplay(document.querySelector('#gameControls'), 'flex')
            }

            if(gameData.isPaused){
                this.gameMemory.gameDisplay.header.pauseClock()
                this.gameMemory.audioManager.stopCurrentAudio()
                pauseBtn.style.backgroundColor = colors.green_play
                this.gameMemory.isClickAble = false
            }else{
                this.gameMemory.audioManager.playAudio(gameAssets['main'], 1, true)
                this.gameMemory.gameDisplay.header.resumeClock()
                pauseBtn.style.backgroundColor = colors.red_pause
                this.gameMemory.isClickAble = true

            }
            let status = gameData.isPaused ? 'pausado' : 'liberado'
            this.accessibilityManager.readText(`O jogo foi ${status}.`)
        })
        let auxContrl = ''
        pauseBtn.addEventListener('mouseover', (e) => {
              if(auxContrl === e.target) return
              if(gameData.isLibrasActive)
                this.accessibilityManager.readWithAccessibility(`${gameData.isPaused ? 'botão play' : 'botão pausar'}`)
          
              setTimeout(() => auxContrl =  '', 1000)
        })

        function toggleDisplay(element, display){
            let value = element.style.display
            if(value != 'none'){
                element.style.display = 'none'
            }else{
                element.style.display = display
            }
        }
        function toggleIconClass(icon){
            if(btnIcon.classList.contains('fa-pause')){
              btnIcon.classList.remove('fa-pause')
              btnIcon.classList.add('fa-play')
            } else {
              btnIcon.classList.remove('fa-play')
              btnIcon.classList.add('fa-pause')
            }
        }

    }
    /**
     * Remove o botão de pausar o jogo da DOM.
     */
    removePauseBtn(){
        document.querySelector('.pause_btn')?.remove()
    }
}

export{
    BoardRender
}