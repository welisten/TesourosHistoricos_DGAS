/**
 * Classe principal do jogo da memória.
 * Gerencia toda a lógica do jogo: renderização do tabuleiro, controle de cartas,
 * verificação de combinações, vitória, sons, acessibilidade e atualização da UI.
 *
 * @class MemoryGame
 */
import  { User }  from '../Class/User.js';
import { LevelScore } from './LevelScore.js'
import { BoardRender } from './manegers/BoardRender.js'
import { AccessibilityManager } from './manegers/AccessibilityManager.js';
import { AudioManager } from './manegers/Audiomanager.js';
import { gameData } from '../Consts/gameData.js';
import { fitTextContent } from '../js/utils/fitTextContent.js';


class MemoryGame {
    /**
     * Cria uma instância do jogo da memória.
     * 
     * @param {number} size - Quantidade de cartas no jogo.
     * @param {string} user_name - Nome do usuário jogador.
     * @param {object} gameDisplay - Interface gráfica do jogo (header, body, footer...).
     * @param {GainNode} gainNode - Nó de controle de volume para áudio.
     * @param {AudioContext} audioContext - Contexto de áudio da Web Audio API.
     */
    constructor(size, user_name, gameDisplay, gainNode, audioContext) {
        this.mainContainer = document.querySelector('#game_Container')               // SCENE(GAME CONTAINER)

        this.size = size                                                        // CARD AMOUNT
        this.user = new User(user_name)
        this.board = new BoardRender('#gameBoard', this.onCardClick.bind(this), this.user, size, this)
        this.audioContext = audioContext
        this.gainNode = gainNode
        this.accessibilityManager = new AccessibilityManager('.textToReader')
        this.audioManager = new AudioManager(this.audioContext, this.gainNode)
        this.gameDisplay = gameDisplay
        this.flippedCards = []                            // ASIDE GAME ACCESSIBLE CONTAINER
        this.isClickAble = true

        this.board.render()
        this.user.updateUser()
        this.gameDisplay.onMemoryGameConstruction(this.user)
        gameData.class = 'MemoryGame'
    }

    /**
     * Manipula o clique em uma carta.
     * Só permite ação se as cartas estiverem habilitadas para clique.
     * 
     * @param {MouseEvent} e - Evento de clique.
     * @param {number} index - Índice da carta clicada.
     */
    onCardClick(e, index){
        if(this.isClickAble){   
            this.flipCard(index, e)
        }
    }

    /**
     * Lida com a ação de virar uma carta.
     * Atualiza interface, acessibilidade e verifica se é necessário checar por combinação.
     * 
     * @param {number} index - Índice da carta a ser virada.
     */
    flipCard(index) {
        const card = this.board.cards[index];
        
        if(card.isFlipped || card.isMatched) return;                           
                                                                                
        card.flip();                                                            // ALTERA O ESTADO DA CARTA
        this.flippedCards.push(card);                                           // ADICIONA NO ARRAY DE CARTAS VIRADAS 
                                               
        this.audioManager.playAudio(gameAssets['select'])
        this.board.updateBoard(index)

        const cardName = card.name.split('_')[0]   
 
        this.gameDisplay.header.setCardsInfo(cardName, `${card.location.column}${card.location.row}`)
        this.gameDisplay.header.updateInfoContainer()
        this.gameDisplay.body.updateDisplayImg(card.src, cardName, card.description) 
        this.gameDisplay.footer.updateFooterText(card.description, fitTextContent)

        if (this.flippedCards.length === 2) {                                   // VERIFICA A NECESSIDADE DE CONFERIR MATCH
            this.checkForMatch();
        }else{
            this.accessibilityManager.readText(`${cardName}.`)
            this.accessibilityManager.readWithAccessibility(`${cardName} ${card.location.column}${card.location.row}`)
        }
    }

    /**
     * Verifica se as duas cartas viradas formam um par.
     * Se sim, marca como combinadas; se não, vira as cartas de volta após um atraso.
     * Também atualiza o placar e verifica vitória.
     */
    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        const c1Name = card1.name.split('_')[0]
        const c2Name = card2.name.split('_')[0]

        if (c1Name === c2Name) {
            card1.match();
            card2.match();
            setTimeout(() => this.audioManager.playAudio(gameAssets['success']), 100)
            this.user.treasures++
            this.gameDisplay.bar.updateBar()
            if(this.user.treasures < (this.size / 2)){
                this.accessibilityManager.readText(`${c2Name}. Parabéns ${this.user.name} ! você Já tem ${this.user.treasures} tesouros. ${card1.description}`)
                this.accessibilityManager.readWithAccessibility(`Parabéns ! Você coletou uma nova riquesa. ${card1.description}`)
            }
        } else {
            const delay = 1000
            this.temporarilyDisableClick(delay)
            card1.fail()
            card2.fail()
            setTimeout(() => this.audioManager.playAudio(gameAssets['fail']), 100)
            setTimeout(() => {
                card1.fail()
                card2.fail()
                card1.flip()
                card2.flip()
                
                this.flippedCards = []
                this.board.updateBoard()
                this.accessibilityManager.readText(`${c2Name}. Não foi dessa vez`)
                this.accessibilityManager.readWithAccessibility(`Errado ! ${c1Name} ${card2.location.column}${card2.location.row}`)
            }, delay);
        }
        

        this.checkForVictory()
        
        this.flippedCards = [];                                                 // RESETA O ARRAY DE CARTAS VIRADAS
        this.board.updateBoard();                                                     // ATUALIZA DO JOGO
    }

    /**
     * Verifica se todas as combinações foram encontradas.
     * Se sim, finaliza o jogo, atualiza a interface e apresenta a tela de vitória.
     */
    checkForVictory(){
        if(this.user.treasures == ( this.size / 2 )){
            let timeInSec = this.gameDisplay.header.getTimer()
            let timeInMin = null;
            let restInSec = null;

            if(timeInSec > 60){
                timeInMin = Math.floor(timeInSec / 60)
                restInSec = timeInSec % 60
            }

            this.audioManager.stopCurrentAudio()
            document.getElementById('gameBoard').style.display = "none"
            
            this.accessibilityManager.readText(`Parabéns ${this.user.name} ! você coletou todos os ${this.user.treasures} tesouros em ${timeInMin ? `${timeInMin} minutos ${restInSec ? `e ${restInSec}` : ''}` : timeInSec} segundos ! por isso você ganhou 3 estrelas na fase ${this.user.level}`)
            
            this.accessibilityManager.readWithAccessibility(`Parabéns ${this.user.name} ! você coletou todos os ${this.user.treasures} tesouros em ${timeInMin ? `${timeInMin} minutos ${restInSec ? `e ${restInSec}` : ''}` : timeInSec} segundos ! por isso você ganhou 3 estrelas na fase ${this.user.level}`)
            
            document.title = `Placar da fase ${this.user.level}` // adjust
            this.board.removePauseBtn()
            gameData.score =  new LevelScore(this.mainContainer, this.user.name.split(' ')[0], this.gameDisplay.header.getTimer(), this.user.level, this.gainNode, this.audioContext, this)
            this.gameDisplay.handleWin()
        }
    }
    /**
     * Inicia o jogo após o carregamento inicial.
     * Começa o cronômetro e a música ambiente, atualiza UI e barra de progresso.
     */
    startGame() {
        this.gameDisplay.header.setCardsInfo('', '')
        this.gameDisplay.header.startClock();
        this.gameDisplay.bar.updateBar()
        this.gameDisplay.update()

        setTimeout(() => {
            this.audioManager.playAudio(gameAssets['main'], .5, true)
        }, 1500)
    }
    
    /**
     * Reinicia o estado do jogo para o usuário tentar novamente.
     * Reseta tabuleiro e usuário, recomeça o cronômetro e atualiza a interface.
     */
    replayGame(){
        this.user.replayUserGame()
        this.board.resetBoard()
        this.gameDisplay.footer.updateFooterText('Desenvolvido por Wesley Welisten', fitTextContent)
        this.audioManager.reloadManager()
        this.startGame()
        gameData.class = 'MemoryGame'

    }
    
    /**
     * Impede cliques por um tempo determinado.
     * Usado para impedir spam de cliques enquanto cartas são desviradas.
     * 
     * @param {number} timeInMili - Tempo de bloqueio do clique (em milissegundos).
     */
    temporarilyDisableClick(timeInMili){
        this.isClickAble = false
        setTimeout(() => {
            this.isClickAble = true
        },timeInMili)
    }
}

export {
    MemoryGame
}
    