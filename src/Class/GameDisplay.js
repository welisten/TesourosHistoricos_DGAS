/**
 * @file GameDisplay.js
 * @description Este arquivo define a estrutura principal da interface do jogo,
 * dividindo-a em quatro componentes visuais: cabeçalho (DisplayHeader), barra de status (DisplayBar),
 * corpo do jogo (DisplayBody) e rodapé (DisplayFooter). A classe `GameDisplay` é responsável por
 * inicializar, exibir e atualizar a interface do usuário durante a execução do jogo.
 * 
 * A estrutura foi desenvolvida com foco em acessibilidade (compatível com Libras),
 * alternância entre modos claro e escuro, e feedback visual em tempo real durante o progresso do jogador.
 * 
 * As principais funcionalidades incluem:
 * - Exibição do nome do usuário, nível e número de tesouros.
 * - Timer com controle de pausa e reinício.
 * - Alternância de layout para compatibilidade com interpretação em Libras.
 * - Modo claro/escuro para conforto visual.
 * 
 * As classes auxiliares (DisplayHeader, DisplayBar, DisplayBody e DisplayFooter)
 * são instanciadas dentro da `GameDisplay` e comunicam-se por meio de métodos de atualização e resgate de estado.
 * 
 * @author [Wesley Welisten Rocha Santos Vieira]
 * @date [10/04/2025]
 * @version 0.9.0
 */

import { generalImagesDataArr } from "../Consts/Values.js"
import { gameData } from '../Consts/gameData.js';
import { createElement } from "../js/utils/createElements.js";

class GameDisplay{
    constructor(father,){
        this.father = father
        this.element = document.getElementById('gameDisplay')
        this.user = ''
        this.LibrasBtn =  document.querySelector('.libras_btn')
        this.LightBtn =  document.querySelector('.lightMode_btn')
        
        this.header = new DisplayHeader(this.element) 
        this.bar = new DisplayBar(this.element, this) 
        this.body = new DisplayBody(this.element) 
        this.footer = new DisplayFooter(this.element) 
        
        this.initDisplay()
    }
    initDisplay(){
        this.father.appendChild(this.element)
        
        Array.from([this.header, this.bar, this.body]).forEach( (component, idx) => {
            const line = document.createElement('div')
            line.classList.add('line')
            line.style.display = 'absolute'
            component.element.appendChild(line)
        })

        this.setupLibrasBtn()
    }

    setupLibrasBtn(){
        this.LibrasBtn?.addEventListener('click', (e)=>{
            e.preventDefault()
            this.toggleDisplayLines()
        })
    }

    handleWin(){
        Array.from([this.header, this.body, this.footer]).forEach(component => component.handleWin())
    }

    resetDisplay(){
        [this.header, this.bar, this.body, this.footer].forEach(component => component.reset())
    }

    toggleDisplay(){
        const isLibrasActive = this.LibrasBtn.classList.contains('active')
        if(isLibrasActive){
            this.element.style.height = '33%' 
            setTimeout(()=>{this.element.style.margin = '12% 0 0 '},50) 
        }else{
            this.header.element.style.transition = 'none'
            setTimeout(()=>{
                this.element.style.height = '100%'
                this.element.style.margin = '0'
            }, 1000)
        }   

        Array.from([this.body, this.bar, this.footer]).forEach(component => component.toggleDisplay())
        this.toggleDisplayLines()    
    }

    toggleLight(){
        const isLight = this.LightBtn.classList.contains('active')
            
        this.element.style.backgroundColor = isLight ?'#ffffff10' : "#ffffff"
        this.element.style.border = isLight ? '1px solid #3498db' : '3px solid #3498db'
            
        document.querySelectorAll('.line').forEach((line) => {
            line.style.borderBottom = '1px solid #ffffff80'
        })
        
        Array.from([this.header, this.bar, this.body, this.footer]).forEach((component) => {
            isLight ? component.darkMode() : component.lightMode()
        })
    }

    toggleDisplayLines(){
        const lines = document.querySelectorAll('.line')
        const isLibrasActive = this.LibrasBtn.classList.contains('active')
        setTimeout(() => {
            lines.forEach( line => {
                line.style.display = isLibrasActive ? 'none' : 'block'
            })
        }, isLibrasActive ? 10 : 1000)
    }

    update(){
        this.header.updateClockContainer()
        this.header.updateInfoContainer()
    }

    onMemoryGameConstruction(user){
        this.user = user
        this.bar.setBarName(this.user.name.split(' ')[0])
        this.bar.updateBar()
    }
}

class DisplayHeader{                // ESSA CLASSE SE DIFERENCIA DAS DEMAIS, REFATORAÇÃO É NECESSARIA
    constructor(father){
        this.father = father
        this.element = document.createElement("div");
        this.timer = 0
        this.counter = null
        this.isCounterPaused = null
        this.cardInfo = [] //card name e card location
        this.createDisplayHeader()
    }
    createDisplayHeader(){
        // CRIA
        this.element.id = 'gameDisplay_header'
        this.element.className = 'gameDisplay_header'

        this.clockContainer = createElement('div', 'clock')
        this.clockContainer.innerHTML = '<p>--</p><i class = "fa-regular fa-clock"></i>' // ESSA ICONE É ADICIONADO DINAMICAMENTE EM TODO UPDATECLOCK
        
        const infoContainer = createElement('div', 'info', 'info')
        const cardName = createElement('div', 'cardName')
        const cardLocation = createElement('div', 'cardLocation')
                                                        // ID E CLASSES

                                                        //ESTILIZA        
        const containerWidth  = Math.floor(window.innerWidth * 0.5) > 760 ? 760 : Math.floor(window.innerWidth * 0.4)
        this.element.style.height           = `${containerWidth * 0.25}px`
        this.clockContainer.style.height    = `${containerWidth * 0.21}px`
        this.clockContainer.style.width     = `${containerWidth * 0.19}px`
        infoContainer.style.height          = `${containerWidth * 0.23}px`
        
        // APPEND
        infoContainer.append(cardName, cardLocation)
        this.element.append(this.clockContainer, infoContainer)
        this.father.appendChild(this.element)

        //ATUALIZA  
        infoContainer.style.fontWeight = '200'     
        this.cardInfo[0] = 'Precione Iniciar para começar.'
        this.cardInfo[1] = '<3'

        this.clockContainer.addEventListener('click', () => {
            if(gameData.isLibrasActive){
                gameData.intro.gameAcessibleDisplay.readWithAccessibility('tempo do relógio')
            }
        })

        this.updateInfoContainer()
    }
    updateClockContainer(){
        if(this.timer === '--'){
            this.clockContainer.innerHTML = '<p class="clockNumber">--</p><i class = "fa-regular fa-clock"></i>'
        } else {
            const seconds = this.timer <= 9 ? `0${this.timer}` : this.timer
            this.clockContainer.innerHTML = `<div class="clockNumber">${seconds}</div><span class= clockSecond>s</span><i class = "fa-regular fa-clock"></i>`
        }
    }
    updateInfoContainer(){
        this.element.querySelector('.cardName').textContent = this.cardInfo[0]
        this.element.querySelector('.cardLocation').textContent =  this.cardInfo[1]
    }

    startClock(){   
        this.counter = setInterval(() => {
            if(typeof this.timer !== 'number') this.timer = 0
            this.timer++
            this.updateClockContainer()
        }, 1000)
        this.isCounterPaused = false
    }
    pauseClock(){
        if(this.counter){
            this.stopClock()
            this.counter = null
            this.isCounterPaused = true
        }
    }
    resumeClock(){
        if(this.isCounterPaused) this.startClock()
    }
    stopClock(){
        clearInterval(this.counter)
    }
    setCardsInfo(name, location){
        this.cardInfo = [name, location]
    }
    getTimer(){
        return this.timer
    }
    handleWin(){
        this.stopClock()
        this.setCardsInfo("Voce Conseguiu", "<3")
        this.timer = '--'
        this.updateInfoContainer()
        this.updateClockContainer()
    }
    reset(){
        this.stopClock()
        this.setCardsInfo("", "")
        this.timer = "--"
        this.updateInfoContainer()
        this.updateClockContainer()
    }

    darkMode(){
        const info = this.element.children[1]
        info.style.fontWeight = '200'
        info.style.color = '#efefef'
        this.clockContainer.style.border = '2px solid #ffffff56'
        this.clockContainer.style.backgroundColor = 'var(--body-color-dark)'
    }
    lightMode(){
        const info = this.element.children[1]

        info.style.fontWeight = '400'
        info.style.color = '#3e3e3f'
        this.clockContainer.style.border = '2px solid #056db3'
        this.clockContainer.style.backgroundColor = '#3498db'       
    }
}

class DisplayBar{
    constructor(father, game){
        this.father = father
        this.game = game
        this.element = null
        this.LibrasBtn =  document.querySelector('.libras_btn')

        this.createDisplayBar()
    }
    createDisplayBar(){  // constroi a barra
        this.element =  createElement('div', 'gameDisplay_bar', 'gameDisplay_bar')
        this.element.style.display = 'flex'
        

        const userName =  createElement('div', 'userName')
        userName.classList.add()
        userName.innerText = this.game.user.name || '--' 
        
        const userLevel = createElement('div', 'userLevel')
        userLevel.innerText = `level ${this.game.user.level || 0}`
        
        const treasureImg = createElement('img', 'treasure', '', {
            src : "https://res.cloudinary.com/dqzwqdc0a/image/upload/v1743020777/DGAS-Plataforma/game3/general/roy5gguau9x7utyszcyb.png",
            alt: 'tesouros coletados',
            title: 'tesouros coletados',
        })

        const treasureNumber = createElement('span', 'treasuresNumber')
        treasureNumber.innerText = this.game.user.treasures || 0 
        
        const userTreasures =  createElement('div', 'userTreasure')

        userTreasures.append(treasureNumber, treasureImg)
        this.element.append(userName, userTreasures, userLevel)
        this.father.appendChild(this.element)

    }
    updateBar(){  // atualiza de acordo com os dados do usuario
        document.querySelector('.treasuresNumber').textContent = this.game.user.treasures
        document.querySelector('.userLevel').textContent = `level ${this.game.user.level}`
    }
    reset(){  // atualiza de acordo com os dados do usuario
        this.setBarName('--')
        this.setBarLevel(`--`)
        document.querySelector('.treasuresNumber').textContent = '-'
    }
    setBarLevel(value){ //atualiza para um valor expecífico
        const level = value === '--' ? '--' : `level ${value}`
        document.querySelector('.userLevel').textContent = level
    }
    setBarName(value){  //atualiza para um valor expecífico
        document.querySelector('.userName').textContent = value.toString()
    }

    toggleDisplay(){  // alterna o Display,
        const isActive = this.LibrasBtn.classList.contains('active')
        const toggle = () => {
            this.element.style.display = gameData.isLibrasActive ? 'none' : 'flex'
        }
        setTimeout(toggle, isActive  ? 10 : 1500)

    }
    darkMode(){
        Object.assign(this.element.style, {
            fontWeight : '200',
            color : '#efefef'
        })
    }
    lightMode(){
        Object.assign(this.element.style,{
            fontWeight: '400',
            color: '#3e3e3f'
        })
    }
}

class DisplayBody{
    constructor(father){
        this.father = father
        this.element = ''
        this.LibrasBtn =  document.querySelector('.libras_btn')
        this.img = ''
        this.imgContainer = ''
        this.createDisplayBody()
    }
    createDisplayBody(){   // constroi o Body
        this.element = createElement('div', 'gameDisplay_body', 'gameDisplay_body')
        this.element.style.display = 'flex'
       
        this.imgContainer = createElement('div', 'bodyImg_Container')
        this.img =  createElement('img', 'bodyImg')
        
        this.father.appendChild(this.element)
        this.element.appendChild(this.imgContainer)
        this.imgContainer.appendChild(this.img)
    }

    updateDisplayImg(src, alt = '', title = ''){   // atualiza a imagem com a URL passada
        if(this.img.style.display == 'none'){
            this.img.style.display = 'block'
        }
        this.img.src = src
        this.img.alt = alt
        this.img.title = title

    }
    handleWin(){
        const trophy_OBJ = generalImagesDataArr.find(obj => obj.name === 'trophy')
        if (trophy_OBJ){
            this.updateDisplayImg(trophy_OBJ.src, trophy_OBJ.description, 'troféu')
        }
    }
    reset(){
        this.img.style.display = 'none'
    }

    toggleDisplay(){
        const isActive = this.LibrasBtn.classList.contains('active')
        setTimeout(() => {
            this.element.style.display =  isActive ? 'none' : 'flex'
        }, isActive ? 10 : 1500)
    }
    darkMode(){
        this.element.style.color = '#efefef'
        this.imgContainer.style.border = '2px solid #ffffff56'
        this.imgContainer.style.backgroundColor = 'var(--body-color-dark)'

    }
    lightMode(){
        this.element.style.color = '#3e3e3f'
        this.imgContainer.style.border = '2px solid #056db3'
        this.imgContainer.style.backgroundColor = '#3498db80'

    }
}

class DisplayFooter{
    constructor(father){
        this.father = father
        this.element = null
        this.paragraf = null
        this.LibrasBtn = document.querySelector('.libras_btn')
        this.footerText = 'Desenvolvido por Wesley Welisten'
        
        this.generateFooter()
        this.updateFooterText(this.footerText)
    }
    generateFooter(){
        this.element = createElement('div', 'gameDisplay_footer', 'gameDisplay_footer')
        this.element.style.display = 'block'

        this.paragraf = createElement('p', 'description FIT')
        
        this.element.appendChild(this.paragraf)
        this.father.appendChild(this.element)
    }
    updateFooterText(text, callback = () => {}){
        this.footerText = text.toString()
        this.paragraf.innerHTML = this.footerText
        callback('.description')
    }

    handleWin(){
        this.element.firstChild.style.fontSize = '2rem'
        this.updateFooterText(`<p>Obrigado por Jogar !</p><br><p>Desenvolvido por Wesley Welisten</p>`)
    }
    reset(){
        this.footerText = ''
        this.element.firstChild.textContent = this.footerText
    }
    toggleDisplay(){
        const isActive = this.LibrasBtn.classList.contains('active')
        setTimeout(() => {
            this.element.style.display = isActive ? 'none' : 'block'
        }, isActive ? 10 : 1500)
    }

    darkMode(){
        this.element.style.fontWeight = '200'
        this.element.style.color = '#efefef'
    }
    lightMode(){
        this.element.style.fontWeight = '400'
        this.element.style.color = '#3e3e3f'
    }

}
export{
    GameDisplay
}