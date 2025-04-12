/**
 * Classe responsável por exibir a pontuação do jogador ao final de uma fase do jogo.
 * 
 * O componente `LevelScore` é instanciado quando o jogador finaliza um nível.
 * Ele apresenta um painel com:
 *  - Nome do jogador formatado
 *  - Estrelas de desempenho com base no tempo
 *  - Informações da fase e do tempo de conclusão
 *  - Botões para jogar novamente ou avançar (quando disponível)
 * 
 * Também gerencia acessibilidade (Leitor de Tela e Libras), sons de vitória,
 * e feedback via popup.
 * 
 * Utiliza utilitários como `createElement`, `fitTextContent`, e gerenciadores como `AudioManager` e `AccessibilityManager`.
 */

import { colors } from "../Consts/Colors.js"
import { generalImagesDataArr } from "../Consts/Values.js"
import { gameData } from "../Consts/gameData.js"
import { AudioManager } from "./manegers/Audiomanager.js"
import { createElement } from "./../js/utils/createElements.js" 
import { fitTextContent } from "./../js/utils/fitTextContent.js"
import AccessibilityManager from "./manegers/AccessibilityManager.js"

class LevelScore{

    /**
     * Cria a instância do painel de pontuação após o fim da fase.
     * 
     * @param {HTMLElement} father - Elemento pai onde o painel será anexado.
     * @param {string} name - Nome do usuário.
     * @param {number} time - Tempo gasto pelo usuário para completar o nível.
     * @param {number} level - Número do nível finalizado.
     * @param {GainNode} gainNode - Nó de ganho de áudio para controle de volume.
     * @param {AudioContext} audioContext - Contexto de áudio utilizado para reprodução.
     * @param {object} game - Instância principal do jogo.
     */
    constructor(father, name, time, level, gainNode, audioContext, game ){
        this.father = father
        this.container = createElement('div', 'levelScore', 'levelScore')
        this.userName = name[0].toUpperCase() + name.slice(1).toLowerCase()
        this.userTime = time
        this.userLevel = level
        this.game = game
        this.audioManager = new AudioManager(audioContext, gainNode)
        this.accessibilityManager = new AccessibilityManager()


        this.audioManager.playAudio( gameAssets['victory'], 1.0, true )
        this.audioManager.playAudio( gameAssets['aplause'], 1.0, true )
        this.createPainel()
        gameData.class = 'LevelScore'

    }

    /**
     * Cria e renderiza todo o painel de pontuação, contendo cabeçalho, corpo e rodapé.
     * Inclui chamadas para ajuste de texto e construção de partes específicas.
     */
    createPainel(){ 
        this.hideRulers()

        const scoreContainer = createElement('div', 'scoreContainer', '', {
            tabindex:'2',
            'aria-label' :'Placar'
        })
        
        const painelHeader = createElement('p', 'scoreHeader', '', {
            tabindex:'3',
            'aria-label':`Parabens ${this.userName} !`
        })
        
        const title = createElement('span', 'scoreTitle FIT', '', {}, `Parabéns ${this.userName}`)
        const painelBody = createElement('p', 'scoreBody', '', { tabindex:'4' })
        painelBody.style.background = gameData.isDarkMode ? 'none' : colors.light_blue_9c
        
        const painelFooter = createElement('div', 'scoreFooter')

        painelHeader.appendChild(title)
        scoreContainer.append(painelHeader, painelBody, painelFooter)
        this.container.appendChild(scoreContainer)
        this.father.appendChild(this.container)

        fitTextContent('.scoreTitle')
        
        this.buildBody(painelBody)
        this.buildFooter(painelFooter)
    }

    hideRulers(){
        const rulers = document.querySelectorAll('.ruler')
        rulers.forEach(ruler => ruler.style.display = 'none')
    }

    /**
     * Constrói o corpo do painel com base nas estrelas de desempenho.
     * 
     * @param {HTMLElement} father - Elemento onde os elementos visuais serão inseridos.
     */
    buildBody(father){
        const star1Container = createElement('div', 'star1')
        const star2Container = createElement('div', 'star2')
        const star3Container = createElement('div', 'star3')

        let [star1, star2, star3, golden] = this.handleScore(this.userTime, this.userLevel)
        
        if(gameData.isScreenReaderActive || gameData.isLibrasActive) {
            golden = 3
        }

        this.father.setAttribute('aria-label', `Você conseguiu ${golden} estrelas`)
       
        
        star1Container.appendChild(star1)
        star2Container.appendChild(star2)
        star3Container.appendChild(star3)

        father.append(star1Container, star2Container, star3Container)
        
    }

    /**
     * Constrói o rodapé do painel com informações do nível e do tempo de conclusão.
     * Também insere os botões de controle no rodapé.
     * 
     * @param {HTMLElement} father - Container do rodapé.
     */
    buildFooter(father){ 
        const gameInfo = createElement('div', 'footerInfo')
        
        let timeInSec = this.game.gameDisplay.header.getTimer()
        let timeInMin = null;
        let restInSec = null;
        
        if(timeInSec > 60){
            timeInMin = Math.floor(timeInSec / 60)
            restInSec = timeInSec % 60
        }
        
        const levelInfo = createElement('p', 'levelInfo', '', {
            tabindex : '5',
            'aria-label' : `na fase ${this.userLevel}`
        })
        levelInfo.innerHTML = `<span class="levelSpan">Level</span> <span class="levelNumber">${this.userLevel}</span>`
        
        const timeInfo = createElement('p','timeInfo', '', {
            tabindex:'6',
            'aria-label':`em ${timeInMin
                ? `${timeInMin} minuto ${restInSec ? `e ${restInSec}` 
                : ''}` : timeInSec} segundos`
        })
        timeInfo.innerHTML = `<span>${this.userTime}s</span>`
        
        const level_OBJ = generalImagesDataArr.find(obj => obj.name === 'level')
        const clock_OBJ = generalImagesDataArr.find(obj => obj.name === 'clock')
        
        const levelImg = createElement('img' ,'levelImg', '', {
            src: level_OBJ.src,
            alt: level_OBJ.description
        }) 

        const clockImg = createElement('img', 'clockImg', '', {
            src: clock_OBJ.src,
            alt: clock_OBJ.description
        })
        
        levelInfo.appendChild(levelImg)
        timeInfo.appendChild(clockImg)
        gameInfo.append(levelInfo, timeInfo)
        father.appendChild(gameInfo)

        this.buildFooterButtons(father)
    }

    /**
     * @param {HTMLElement} father - Container do rodapé.
     */
    buildFooterButtons(father){
        const btnsContainer = createElement('div', 'btnsContainer')

        const btnReplay = createElement('button', 'btnReplay fa-solid fa-repeat', '', {
            tabindex: 7,
            title: 'Jogar Novamente',
            'aria-label': 'Jogar Novamente'
        })
        
        const btnNext = createElement('button', 'btnNext fa-solid fa-forward', {
            tabindex: '8',
            title: `Jogar próxima fase (indisponível no momento)`,
            'aria-label': `Jogar próxima fase (momentaneamente indisponível)`
        })

        btnsContainer.append(btnReplay, btnNext)
        father.appendChild(btnsContainer)
        
        this.setFooterButtons(btnReplay, btnNext, father)
    }

    /**
     * Adiciona eventos aos botões de "Jogar Novamente" e "Próxima Fase".
     * Inclui suporte a Libras e Leitor de Tela com feedback auditivo e visual.
     * 
     * @param {HTMLButtonElement} btnReplay - Botão de reinício da fase.
     * @param {HTMLButtonElement} btnNext - Botão de próxima fase.
     */
    setFooterButtons(btnReplay, btnNext){
        let auxContrl = ''

        if(!btnNext || !btnReplay){
            throw new Error('Impossível configurar botões do score: parâmetros inexistentes')
        }

        btnReplay.addEventListener('mouseover', (e) => {
            if(auxContrl === e.target) return

            if(gameData.isLibrasActive){
                this.accessibilityManager.readWithAccessibility(`${e.target.title}`)
            }
            setTimeout(() => auxContrl =  '', 1000)
          })
  
        btnNext.addEventListener('mouseover', (e) => {
            if(auxContrl === e.target) return
            if(gameData.isLibrasActive)
              this.accessibilityManager.readWithAccessibility(`${e.target.title}`)
        
            setTimeout(() => auxContrl =  '', 1000)
          })
  
        btnReplay.addEventListener('click', (e) => {
            const isAccessibilityActive = gameData.isScreenReaderActive || gameData.isLibrasActive
            let delay =  isAccessibilityActive ? 4500 : 1000

            if(isAccessibilityActive){
                let aux = 3
                let verb = 'começou'

                this.accessibilityManager.readText(`O jogo ${verb}`, false)
                this.accessibilityManager.readWithAccessibility(`O jogo ${verb}`)
                
                setTimeout(() => {
                    let countdown = setInterval(() => {
                        if(aux <= 0 || gameData.isLibrasActive) {
                            clearInterval(countdown)
                            
                            return
                        }else if(aux === 1){
                            this.audioManager.stopCurrentAudio()
                            this.audioManager.playAudio(gameAssets['transition'])
                        }
                        this.accessibilityManager.readText(aux, false)
                        this.accessibilityManager.readWithAccessibility(aux)
                        aux--
                    }, 1000)
                }, 500)
            }
            else{
                this.audioManager.stopCurrentAudio()
                this.audioManager.playAudio(gameAssets['transition'])
            }

            setTimeout(() => {
                const gameBoard = document.getElementById('gameBoard')
            
                gameBoard.style.display = "grid"
                this.container.style.display = 'none'
                
                this.game.gameDisplay.body.reset()
                this.game.replayGame()
            }, delay)
        })
  
        btnNext.addEventListener('click', () => {
            this.popUpMessage('A fase 2 está momentaneamente indisponível. Aguarde as próximas atualizações', '.btnReplay', 6000)
            if(this.userLevel < gameData.lastLevel) this.game.user.updateUser()
        })
    }

    /**
     * Adiciona eventos aos botões de "Jogar Novamente" e "Próxima Fase".
     * Inclui suporte a Libras e Leitor de Tela com feedback auditivo e visual.
     * 
     * @param {HTMLButtonElement} btnReplay - Botão de reinício da fase.
     * @param {HTMLButtonElement} btnNext - Botão de próxima fase.
     */
    popUpMessage(message, nxtElem, delay = 2500, isVisible = true, chaining = false){
        const popUp = document.getElementById('popUp')
        const popupText = document.querySelector('.popupText')
        const nextFocusElement = document.querySelector(nxtElem)
        let display = popUp.style.display
        
        if(display != 'flex')   popUp.style.display = 'flex'
        if(isVisible)
            popUp.style.opacity = 1
        
        if(!chaining)
            popupText.textContent = ''

        popupText.setAttribute('tabindex', 1)
        popupText.textContent = message
        popupText.focus() 
        
        if(isVisible)
            setTimeout(() => {
                popUp.style.opacity = 0
                popUp.style.display = 'none'
            }, delay - 1000)
        
        if(nxtElem && gameData.isScreenReaderActive)
            setTimeout(() => nextFocusElement.focus(), delay + 100)
        
        
    }

    /**
     * Define as estrelas exibidas no painel com base no tempo do jogador.
     * 
     * @param {number} time - Tempo usado para concluir o nível.
     * @param {number} level - Número do nível.
     * @returns {Array} Um array com os elementos de imagem das estrelas e a quantidade de estrelas douradas.
     */
    handleScore(time, level){
        const userTime = time
        const factor = Number(level)
        const maxTime = 100
        const minTime = maxTime - (10 * factor)

        let star1 = createElement('img')
        let star2 = createElement('img')
        let star3 = createElement('img')

        let goldenStar_src = generalImagesDataArr.find(obj => obj.name === 'golden star').src
        let steelStar_src = generalImagesDataArr.find(obj => obj.name === 'steel star').src
        
        function getstars(userTime, minTime, maxTime){
            if(userTime <= minTime) return 3
            if(userTime <= minTime + 10) return 2
            if(userTime <= maxTime) return 1
            return 0
        }
        let goldenStars = getstars(userTime, minTime, maxTime)

        if(!gameData.isScreenReaderActive && !gameData.isLibrasActive){

            star1.src =  goldenStars >= 1 ? goldenStar_src : steelStar_src
            star2.src =  goldenStars >= 2 ? goldenStar_src : steelStar_src
            star3.src =  goldenStars >= 3 ? goldenStar_src : steelStar_src

            return [star1, star2, star3, goldenStars];
        } else {
            star1.src =  goldenStar_src
            star2.src =  goldenStar_src
            star3.src =  goldenStar_src
            goldenStars = 3

            return [star1, star2, star3, goldenStars];
        }
    }

    getImage(name){
        return gameAssets[name]
    }

    destroyScore(){
        this.container.style.display = 'none'
        this.father.remove(this.container)
    }
}

export{
    LevelScore
}