/**
 * script.js
 * 
 * Script principal de configuração e interação inicial do jogo acessível.
 * Responsável por:
 * - Carregar variáveis de ambiente e pré-carregamento (Preloader)
 * - Ajustar tamanhos de containers com base no dispositivo
 * - Configurar eventos dos botões de controle (áudio, Libras, leitor de tela)
 * - Gerenciar modos de acessibilidade (VLibras e Leitor de Tela)
 * - Manter a interface acessível com suporte visual, auditivo e navegabilidade por teclado
 * 
 * Dependências:
 * - ./Scenes/Preload.js            → Inicialização e carregamento inicial
 * - ./js/getDeviceSize.js          → Obtenção de dimensões responsivas
 * - ./Consts/Colors.js             → Paleta de cores (modo claro/escuro)
 * - ./Consts/gameData.js          → Objeto global de dados do jogo
 * - ./Consts/Values.js            → Variáveis e valores de ambiente
 * 
 * Documentação sugerida:
 * - VLibras: https://www.gov.br/governodigital/pt-br/vlibras
 * - Acessibilidade na Web: https://developer.mozilla.org/pt-BR/docs/Web/Accessibility
 * - MutationObserver: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
 * - Web Speech API (Screen Reader): https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
 * 
 * Observações:
 * - O script considera conflitos entre modos de acessibilidade e previne uso simultâneo.
 * - Adota uma abordagem progressiva para inclusão de acessibilidade visual e auditiva.
 * - Inclui fallback e mensagens de erro caso ferramentas externas (como VLibras) não carreguem corretamente.
 * 
 * Autor: [Wesley Welisten Rocha Santos Vieira]
 * Última atualização: [09/04/2025]
 */

import { Preloader } from './Scenes/Preload.js';
import { getDeviceSize } from './js/utils/getDeviceSize.js';
import { colors } from './Consts/Colors.js';
import { gameData } from './Consts/gameData.js';
import { loadEnviromentVariables } from './Consts/Values.js';

loadEnviromentVariables()
  .then(() => new Preloader())
  .then(() => {
    setLightModeSlider(updateGame3Colors)
    updateDarkModeSwitch()
  })


const accessibleContainer = document.querySelector('.gameAccessibleContainer')
const mainContainers      = document.querySelectorAll('.mainContainer') /*Game_container e GameBoard */
const allControlBtns =  document.querySelectorAll('.controlBtn') 
const vwBtn = document.querySelector('[vw-access-button]')// Botão de acesso ao vLibras. Opacity 0 por padrão
const vLibrasContainer = document.getElementById('vLibras_container') 

let [containerHeight] = getDeviceSize()

mainContainers.forEach( (container) => {
  container.style.width = `${containerHeight}px`
  container.style.height = `${containerHeight}px`  
})

handlePopUp()

//matriz bidimencional de botões e classes
const controlBtnsAndTheirClss = Array.from(allControlBtns).map((btn) =>{
  return [btn, btn.className.split(' ')[1]]
})

gameData.lastBtnTarget = ''
controlBtnsAndTheirClss.forEach( elemAndClassNameArr => { // configura os botões baseado em suas classes
  setControlsBtnsEvents(elemAndClassNameArr[0])

  // configura o comportamento do botão mediante sua classe
  switch(elemAndClassNameArr[1]){
    
    case 'mute_btn':
      elemAndClassNameArr[0].addEventListener('click', () => {
        gameData.isMute = !gameData.isMute

        elemAndClassNameArr[0].classList.toggle('active')
        
        if(gameData.isScreenReaderActive){
          let soundState = elemAndClassNameArr[0].classList.contains('active') ? 'desativado' : 'ativado'
          readText(`O Som foi ${soundState} `)
        }
        
        const icon = elemAndClassNameArr[0].children[0]
        icon.classList.toggle('fa-volume-xmark')
        icon.classList.toggle('fa-volume-high')
      })
      break
      
    case 'libras_btn':  //libras btn
      if(!vwBtn) {
        console.error("O botão de acesso do vlibras não foi encontrado.\nNão foi possível ativar o vlibras.")
        alert("Não foi possível ativar a acessibilidade em Libras\nVerifique o console para mais informações")
        return
      }

      elemAndClassNameArr[0].addEventListener('click', (e) => {
        const vlInterface = document.querySelector('[vw]')
        
        if(preventAccessibilityConflict()){
          announceMessageWithPopUp("Infelizmente, não é possivel ativar 2 modos de acessibilidade ao mesmo tempo", null, 6000)
          return
        }
        
        elemAndClassNameArr[0].classList.add('active')
        accessibleContainer.classList.add('active')

        if(!gameData.isLibrasActive){
          gameData.isLibrasActive = true

          if(gameData.intro.isActive){ 
            // MUDA O COMPORTAMENTO DO LABEL E DO INPUT NO FORMULARIO DA INTRODUÇÃO
            gameData.intro.changeToAccessibility()
          }

          setTimeout(() =>{   // tempo que demora para a transição do design do container pai
            vlInterface.style.display = "block"
            vlInterface.style.opacity = "1"

            vwBtn.click();
                                            // PENSAR SOBRE ISSO
            /* O vLibras demora um certo tempo para ser carregado, e quando não carregado o botão de fechamento não poderá
             ser encontrado impedindo o fluxo da aplicação, por isso o uso do multationObserver.
             Vale-se resaltar que esse tempo é relativo (não preciso)
            */
            let closeFound = false

            const observer = new MutationObserver((MutationObserver, obs) => {
              const closeVl = document.querySelector('.vpw-header-btn-close')
              if(closeVl) {

                closeFound = true

                closeVl.addEventListener('click', () => {
                  vlInterface.style.display = "none !important"
                  vlInterface.style.opacity = "0"

                  gameData.isLibrasActive = false
                  elemAndClassNameArr[0].classList.remove('active')
                  accessibleContainer.classList.remove('active')

                  gameData.intro.changeToAccessibility() // toggle
                
                  gameData.intro.gameDisplay.toggleDisplay()
                  gameData.intro.gameAcessibleDisplay.toggleDisplay()
                })
                // Botão encontrado, para de observar
                obs.disconnect()
              } 

            })

            observer.observe(vLibrasContainer, {
              childList: true,
              subtree: true
            })

            /*  Para garantir que o observador não permaneça escutando indefinidamente 
                (caso o botão nunca seja carregado por algum erro), um tempo máximo de 
                15 segundos é definido.
             */
            setTimeout(() => {
              if(!closeFound){
                observer.disconnect()
                announceMessageWithPopUp('O botão de fechar não foi carregado. Recarregue a pagina', null, 6000)
              }
            },15000)

          }, 1000) // time para a alteração do display no frontEnd
          gameData.intro.gameDisplay.toggleDisplay()
          gameData.intro.gameAcessibleDisplay.toggleDisplay()
        }
        else
        {
          announceMessageWithPopUp("Vlibras ja está ativado, Aperte no Botão de sair do Vlibras para fechar a ferramenta", null, null)
        }
    
      })
      break

    case 'screenReader_btn':

      elemAndClassNameArr[0].addEventListener('click', () => {
        if(preventAccessibilityConflict()){
          announceMessageWithPopUp("Infelizmente, não é possivel ativar 2 modos de acessibilidade ao mesmo tempo", null, 6000)
          return
        }
        gameData.isScreenReaderActive = !gameData.isScreenReaderActive
        let status = gameData.isScreenReaderActive ? 'ativado' : 'desativado'
        
        readText(`O aprimoramento do leitor de tela foi ${status}.\n Para jogar no modo acessível para pessoas com deficiência visual recomendamos mantê-lo ativo.`)
        
        elemAndClassNameArr[0].classList.toggle('active')
        handleOutline()
        
        if(!gameData.isPaused && gameData.isScreenReaderActive && gameData.class == 'MemoryGame'){
          document.querySelector('#gameControls').style.display = 'none'
        }
      })
      handleOutline()
      break
    default:
      break
  }
});


function handlePopUp(){
  const popupCloseBtn       =  document.querySelector('.popup_close_btn')

  if(popupCloseBtn){
    popupCloseBtn.addEventListener('click', ()=>{ popupCloseBtn.parentNode.style.opacity = 0 })
  } else {
    console.error("Botão de fechamento do PopUp não encontrado.\nImpossível configurar")
  }
}
function setControlsBtnsEvents(btn){

  btn.addEventListener('mouseenter', () => {
    btn.classList.add('hovered');
  });

  btn.addEventListener('click', (e) => {
    e.preventDefault()
    btn.classList.remove('hovered');
  });

  btn.addEventListener('mouseleave', () => {
    btn.classList.remove('hovered');
  });
  
  // adiciona acessibilidade em libras no evento de "mouseover" aos botões armazenados no array "controlBtnsAndTheiClss"
  btn.addEventListener('mouseover', (e) => {
    if( gameData.lastBtnTarget === e.target) return
    if( gameData.isLibrasActive){
      gameData.intro.gameAcessibleDisplay.readWithAccessibility(`${e.target.title}`)
      gameData.lastBtnTarget = e.target
    }
    setTimeout(() => gameData.lastBtnTarget =  '', 1000)
  })
}
function preventAccessibilityConflict(){
  return gameData.isLibrasActive && gameData.isScreenReaderActive
}
function readText(text){
  let elem = document.querySelector('.textToReader')

  if(!elem) {
    console.error("Elemento '.textToReader' não encontrado. Leitura de textos não configurada.")
    return
  }

  //forçar a atualização em sistemas que só detectam mudança quando o conteúdo de fato muda.
  if(text === gameData.lastReadText) text += '.' 
  gameData.lastReadText = text

  setTimeout(() => {
    // Esse pequeno delay ajuda em alguns casos (Leitores de tela)
    elem.textContent = text
  }, 10)
}
function announceMessageWithPopUp(message, nxtElem, delay = 2500, isVisible = true, textChaining = false){   // EXIBE MENSAGEM NO POPUP VISÍVEL
  
  const popUp = document.getElementById('popUp')
  const popupText = document.querySelector('.popupText')
  const nextFocusElement = document.querySelector(nxtElem)
  
  if(!popUp ||!popupText){
    console.error("Pop-up ou texto do pop-up não encontrados.\nPopup não configurado!")
    return
  }
  let display = popUp.style.display
  
  if(display !== 'flex')  
    popUp.style.display = 'flex';

  if(isVisible)
    popUp.style.opacity = 1;
  
  
  popupText.setAttribute('tabindex', -1)
  if(!textChaining){
    popupText.textContent = message;
  } else {
    popupText.textContent += message
  }
  popupText.focus() 

  if(gameData.isLibrasActive)
    gameData.intro.gameAcessibleDisplay.readWithAccessibility(message);
  
  if(isVisible && delay){
      setTimeout(() => {
          popUp.style.opacity = 0
          popUp.style.display = 'none'
      }, delay)
  }
  
  if(nxtElem && gameData.isScreenReaderActive)
      setTimeout(() => nextFocusElement.focus(), delay + 100)
}
function handleOutline(){
  let aux = ""
  if(gameData.isScreenReaderActive){
    document.addEventListener('focus', handlerFocus, true)
    document.addEventListener('blur', handleBlur, true)
  }else{
    document.addEventListener('focus', handleBlur, true)
  }

  function handlerFocus(event){
    aux = event.target.style.borderRadius

    event.target.style.outline = '5px solid #FFA500'
    event.target.style.outlineOffset = '5px'
    event.target.style.borderRadius = '0px'
  }

  function handleBlur(event){
    event.target.style.outline = 'none'
    event.target.style.outlineOffset = 'none'
    event.target.style.borderRadius = aux
  }
}
function updateDarkModeSwitch() {
  const inputSlider = document.querySelector('input#slider')
  gameData.isDarkMode ? inputSlider.setAttribute('checked', '') : inputSlider.removeAttribute('checked')
}
function setLightModeSlider(updateGameColor){
  const slider = document.querySelector('input#slider')

  slider.addEventListener('click', () => {
      let root = document.documentElement

      if(slider.checked){
        gameData.isDarkMode = true
        localStorage.setItem('isDarkMode', JSON.stringify(gameData.isDarkMode))
        
        root.style.setProperty('--letter--', colors.letter_l)
        if(updateGameColor) updateGameColor()
      }else{
        gameData.isDarkMode = false
        localStorage.setItem('isDarkMode', JSON.stringify(gameData.isDarkMode))
        
        root.style.setProperty('--letter--', colors.letter_d)
        if(updateGameColor) updateGameColor()
      }
  })
}
function updateGame3Colors(){

  const rootStyle = document.documentElement.style

  if(gameData.isDarkMode){
    rootStyle.setProperty("--bg--", colors.body_color_dark )
    rootStyle.setProperty("--form-bg--", colors.transparent_a23 )
    rootStyle.setProperty("--form-boxShadow--", `0 0 .5em ${colors.blue_serious_ac7}`)
    rootStyle.setProperty("--form-border", `1px solid ${colors.formBorder_dark}`)
    rootStyle.setProperty("--formContainer-bg--", colors.black)
    rootStyle.setProperty("--gameDisplay-bg--", colors.black_a87)
    rootStyle.setProperty("--gameDisplay-border", `1px solid ${colors.blue_baby}`)
    rootStyle.setProperty("--line-borderBottom", `1px solid ${colors.white_ice_a9f}` )
    rootStyle.setProperty("--gameDisplayHeader-fontWeight", '200')
    rootStyle.setProperty("--gameDisplayHeader-color", colors.body_color_light)
    rootStyle.setProperty("--clock-border", `2px solid ${colors.white_a56}`)
    rootStyle.setProperty("--clock-bg", colors.body_color_dark)
    rootStyle.setProperty("--clock-color", colors.white_ice_a9f)
    rootStyle.setProperty("--headerBar-color", colors.body_color_light);
    rootStyle.setProperty("--accessContainer-bg", colors.transparent_a10);
    rootStyle.setProperty("--accessContainer-border", `1px solid ${colors.blue_baby}`);
    rootStyle.setProperty("--scoreBody-bg", colors.black);
    rootStyle.setProperty('--score-bg', colors.score_bg_dark)
    rootStyle.setProperty('--gameBoard-bg', colors.black)
    rootStyle.setProperty('--scoreInfo-color', colors.white)
    rootStyle.setProperty('--scoreBody-border', `1px solid ${colors.white_a56}`)
  } else {
    rootStyle.setProperty("--bg--", colors.body_color_light )
    rootStyle.setProperty("--form-bg--", colors.blue_baby )
    rootStyle.setProperty("--form-boxShadow--", 'none')
    rootStyle.setProperty("--form-border", `2px solid ${colors.blue_dark_theme}`)
    rootStyle.setProperty("--formContainer-bg--", colors.white)
    rootStyle.setProperty("--gameDisplay-bg--", colors.white)
    rootStyle.setProperty("--gameDisplay-border", `3px solid ${colors.blue_baby}`)
    rootStyle.setProperty("--line-borderBottom", `1px solid ${colors.blue_dark_theme}` )
    rootStyle.setProperty("--gameDisplayHeader-fontWeight", '400')
    rootStyle.setProperty("--gameDisplayHeader-color", colors.header_light_color)
    rootStyle.setProperty("--clock-border", `2px solid ${colors.blue_dark_theme}`)
    rootStyle.setProperty("--clock-bg", colors.blue_baby)
    rootStyle.setProperty("--clock-color", colors.header_light_color)
    rootStyle.setProperty("--headerBar-color", colors.header_light_color);
    rootStyle.setProperty("--accessContainer-bg", colors.white);
    rootStyle.setProperty("--accessContainer-border", `3px solid ${colors.blue_baby}`);
    rootStyle.setProperty("--scoreBody-bg", colors.light_blue_9c);
    rootStyle.setProperty('--score-bg', colors.white)
    rootStyle.setProperty('--gameBoard-bg', colors.white)
    rootStyle.setProperty('--scoreInfo-color', colors.scoreinfo_light)
    rootStyle.setProperty('--scoreBody-border', `1px solid ${colors.blue_baby_a80}`)
  }
}

export{
  updateGame3Colors
}
