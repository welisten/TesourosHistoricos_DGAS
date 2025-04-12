/**
 * @class IntroForm
 * @classdesc Responsável pela criação e gerenciamento da cena inicial do jogo da memória.
 * 
 * A classe controla a exibição do formulário de introdução, onde o usuário insere seu nome,
 * e inicia o jogo após validação. Também é responsável por interações de acessibilidade,
 * efeitos sonoros, e interfaces visuais secundárias (aside displays).
 * 
 * Funcionalidades principais:
 * - Criação do formulário de entrada.
 * - Configuração da interface lateral com informações e acessibilidade.
 * - Reproduzir sons de fundo, transições e efeitos de erro.
 * - Gerenciamento de acessibilidade com foco em leitores de tela e VLibras.
 * - Exibição de mensagens com efeito de digitação.
 * - Feedback visual e sonoro para validações.
 * 
 * Utiliza elementos externos como:
 * - `MemoryGame` para iniciar o jogo.
 * - `GameDisplay` e `GameAcessibleDisplay` para interfaces auxiliares.
 * - Arquivos de áudio contidos em `gameAssets`.
 * - Elementos e estilos definidos no DOM.
 */


// CLASES
import  { MemoryGame } from './Game.js';
import  { GameDisplay } from '../Class/GameDisplay.js'
import  { GameAcessibleDisplay} from '../Class/GameAccessible.js'
// DATA
import  { colors } from '../Consts/Colors.js';
import { gameData } from '../Consts/gameData.js';
// UTIL
import { createElement } from '../js/utils/createElements.js';

class IntroForm {
    constructor(){
        this.container = document.getElementById('introFormContainer') // SCENE (MAIN CONTAINER)
        this.gameDisplay   = undefined               // ASIDE GAME DISPLAY iNFO
        this.gameAcessibleDisplay   = undefined      // ASIDE GAME DISPLAY ACCESSIBILITY
        this.isActive = false 

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)()//rever propriedade do obj          ASIDE GAME ACCESSIBLE CONTAINER
        this.ucarineSong    = gameAssets['ucarine']
        this.transitionSong = gameAssets['transition']
        this.errorSong      = gameAssets['incorrect']
        this.click          = gameAssets['click']
        this.currentAudio = null
        this.gainNode = this.audioContext.createGain()

        this.init()

    }
// ========= INICIALIZAÇÃO =========
    init(){                            // CHAMADA DAS FUNÇOES CRIADORAS E CONFIGURADORAS DA CENA
        document.getElementById('gameBoard').style.display = 'none'
        this.playAudio(this.ucarineSong, 1, true)
        
        this.createForm()
        this.createAside()
        this.setupMuteButton()
        this.isActive = true

        gameData.class = 'IntroForm'
    }
// ========= CRIAÇÃO DE ELEMENTOS =========
    createForm(){                      // CRIA OS ELEMENTOS DO FORMULÁRIO
                                                // LEVAR EM CONSIDERAÇÃO O USO OU NÃO USO DE UM BANCO DE DADOS
        const introForm = createElement('form', 'introForm',)
        const formTitle = createElement('p', 'formTitle', '', {
            tabindex: '2',
            'aria-label' : "Olá, vamos começar digitando o seu nome",
        })
        const formBody = createElement('div', 'formBody')
        const nameLabel = createElement('label', 'nameLabel', '', {
            for: 'user_name',
            title: "Digite seu nome"
        }, 'Nome: ')

        const nameInput = createElement('input', 'nameInput', '', {
            tabindex: '2',
            type: 'text',
            name: 'user_name',
            placeholder: 'Digite seu nome',
            id: 'user_name',
            'aria-label': 'Digite seu nome',
            'aria-required': 'true'
        })
        const startBtn  = createElement('button', 'startBtn', '', {
            tabindex: '2',
            'aria-label': 'Iniciar',
        }, 'iniciar')

        formBody.append(nameLabel,nameInput, startBtn)                                         // APPEND OS ELEMENTOS
        introForm.append(formTitle, formBody)
        this.container.appendChild(introForm)
        
        this.setupFormInteractions(nameInput, nameLabel, startBtn)                                                   // CONFIGURA COMPORTAMENTO DINÂMICO DOS ELEMENTOS
        this.typewriter('Olá ! Vamos começar digitando o seu nome.', formTitle)
    }
    
    createAside(){                     // CRIA OS ELEMENTOS DA SEÇÃO AO LADO DO CONTAINER DO JOGO
        const gameBoard_aside = document.getElementById('gameBoard_aside')
        
        this.gameDisplay = new GameDisplay(gameBoard_aside)
        this.gameAcessibleDisplay = new GameAcessibleDisplay(gameBoard_aside)
    }

    setupMuteButton(){                 // CONFIGURA AS AÇOES DOS config_btn PARA COM O ELEMENTOS RECÉM CRIADOS
        const mute_btn = document.querySelector('.mute_btn')
        mute_btn?.addEventListener('click', () => {
            this.gainNode.gain.value = gameData.isMute ? 0 : 1
        })
    }
// ========= CONFIGURAÇÃO DE ELEMENTOS =========
    setupFormInteractions(nameInput, nameLabel, startBtn){  // CONFIGURA COMPORTAMENTO DINAMICO DOS ELEMENTOS DO FORMULARIO
        
        nameInput.addEventListener('focus', ()=>{
            if(!gameData.isLibrasActive) {
                nameLabel.style.transform = 'translateY(0)'
                nameLabel.style.color = colors.white
            }
        })
        nameInput.addEventListener('blur', ()=>{
            if(!nameInput.value && !gameData.isLibrasActive){
                nameLabel.style.transform = 'translateY(5.5vh)'
                nameLabel.style.color = colors.black
            }
        })
        
        startBtn.addEventListener('click', (e) => {
            e.preventDefault()
            this.handleStartButton(nameInput)
        })
    }

    handleStartButton(nameInput){
        if(!nameInput.value){
            this.invalidNameFeedback()
            return 
        }

        if(!gameData.isClickable) return
        
        gameData.isClickable  = false
        this.playAudio(this.click)
        
        const accessibleDelay = gameData.isScreenReaderActive || gameData.isLibrasActive  ? 4500 : 1000

        if(gameData.isScreenReaderActive || gameData.isLibrasActive){
            this.countdownToStart()
        }else{
            this.stopCurrentAudio()
            this.playAudio(this.transitionSong)
        }

        setTimeout(() => {
            this.startGame(nameInput.value)
        }, accessibleDelay)
    }

    invalidNameFeedback(){
        const popUpEl = document.querySelector('#popUp')
        const accessibleDelay = gameData.isLibrasActive ? null : 2500
        const accessibleFocus = gameData.isLibrasActive ? null : '.nameInput'

        popUpEl.style.display = 'flex'
        popUpEl.classList.add('animated')

        setTimeout(() => popUpEl.classList.remove('animated'), 1000)
        
        this.playAudio(this.errorSong)

        this.popUpMessage('Digite um nome válido', accessibleFocus, accessibleDelay, true, true)
    }
    
    countdownToStart(){
        let count = 3
        const verb = gameData.isLibrasActive ? 'começou' : 'começa em'
        this.readText(`O jogo ${verb}`, false)

        setTimeout(() => {
            const interval = setInterval(() => {
                if(count <= 0) {
                    clearInterval(interval)
                }else{
                    if(count == 1){
                        this.stopCurrentAudio()
                        this.playAudio(this.transitionSong)
                    }
                    this.readText(count, false)
                    count--
                }
            }, 1000)
        }, 500)
    }

    startGame(name){
        this.isActive =  false
        this.container.style.display = "none"
        document.querySelector('#popUp').style.opacity = 0

        const game = new MemoryGame(16, name, this.gameDisplay, this.gainNode, this.audioContext)
        gameData.isClickable = true
        game.startGame()
    }
// ========= CONFIGURAÇÃO DE AUDIO =========
    playAudio(audioBuffer, volume = 1.0, loop = false){         //INICIA MÚSICA
        if(!audioBuffer) return
        const src = this.audioContext.createBufferSource()
        src.buffer = audioBuffer
        src.loop = loop
        
        let aux = volume

        volume = gameData.isMute === true ? 0 : aux
        this.gainNode.gain.value = volume 
        
        src.connect(this.gainNode)
        this.gainNode.connect(this.audioContext.destination)
        src.start()

        if(loop === true) this.currentAudio = src
    }

    stopCurrentAudio(){                                         //PAUSA OS AUDIOS QUE ESTÃO SENTO TOCADOS
        if(this.currentAudio) {
            this.currentAudio.stop()
            this.currentAudio = null
        }
    }
// ========= EVENTOS E INTERAÇÕES =========
    readText(text, textChaining = false){                                       // LIDA COM TEXTOS DE LEITURA ACESSÍVEL IMEDIATA
        const textToReaderEl = document.querySelector('.textToReader')
        const popupText = document.querySelector('.popupText');

        textToReaderEl.textContent = textChaining ? `${popupText.textContent} ${text}` : `${text}`

        if(gameData.isLibrasActive || gameData.isScreenReaderActive){
            gameData.intro.gameAcessibleDisplay.readWithAccessibility(text)
        }

    }

    popUpMessage(message, nxtElem, delay = 2500, isVisible = true, isDurable = false, chaining = false){   // EXIBE MENSAGEM NO POPUP VISÍVEL
        const popUp = document.getElementById('popUp')
        const popupText = document.querySelector('.popupText')
        const nextFocusElement = document.querySelector(nxtElem)
        const display = popUp.style.display
        
        if(display != 'flex')   popUp.style.display = 'flex'
        if(isVisible)
            popUp.style.opacity = 1
        
        if(!chaining)
            popupText.textContent = ''

        popupText.setAttribute('tabindex', 1)
        popupText.textContent = message
        popupText.focus() 
        if(gameData.isLibrasActive)
            gameData.intro.gameAcessibleDisplay.readWithAccessibility(message)
        
        if(!isDurable)
            setTimeout(() => {
                popUp.style.opacity = 0
                popUp.style.display = 'none'
            }, 1500)
        
        if(nxtElem && delay)
            setTimeout(() => nextFocusElement.focus(), delay + 100)
        
        
    }

    typewriter(text, container){  // EFEITO MAQUINA DE ESCREVER PARA TEXTO SENDO MOSTRADO EM UM CONTAINER
        let i = 0
        const speed = 50
        
        setTimeout( function tWriter(){//RECURSIVIDADE
            if(i < text.length){
                container.textContent += text.charAt(i) 
                const delay = [".", "!", "?", ","].includes(text.charAt(i)) ? 500 : speed               //ATUALIZAÇÃO DO PARAMETRO
                i++       
                setTimeout(tWriter, delay)           //CHAMADA RECURSIVA
                
            } else if(gameData.isScreenReaderActive){
                document.querySelector('.formTitle').focus()
                return
            }
        }, 2000)
    }
// ========= ACESSIBILIDADE =========
    changeToAccessibility(){   //  ALTERNA ACCESSIBILITY
        const formBodyEl = document.querySelector('.formBody')
        const formLabel =  document.querySelector('.nameLabel')
        const formInput =  document.querySelector('.nameInput')

        const isAccessible = formBodyEl.classList.toggle('accessible')
        
        formLabel.innerHTML = isAccessible ? 'Digite seu Nome:' : 'Nome:'
        formInput.placeholder = isAccessible ? 'Nome' : 'Digite seu Nome'

        formLabel.style.transform = isAccessible ?  'translateY(0)' : 'translateY(5.5vh)'
        formLabel.style.color = isAccessible ?  colors.white : colors.black
        formInput.style.color = isAccessible ?  colors.white : colors.black
    }

    toggleLight(){   // ALTERNA COR DOS ELEMENTOS
        const form = document.querySelector('.introForm')
        const lightMode_btn = document.querySelector('.lightMode_btn')

        if(lightMode_btn.classList.contains('active')){
            this.container.style.backgroundColor =  colors.black
            form.style.backgroundColor =  colors.transparent_a23
            form.style.boxShadow = `0 0 .5em ${colors.blue_serious_ac7}`
        }
        else
        {
            this.container.style.backgroundColor = colors.white
            form.style.backgroundColor = colors.blue_baby
            form.style.boxShadow ='none'
        }
    }
}

export{
    IntroForm
}