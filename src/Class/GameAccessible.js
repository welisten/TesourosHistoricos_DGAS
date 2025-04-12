/**
 * @file GameAcessibleDisplay.js
 * @description Esta classe gerencia os elementos da interface relacionados à acessibilidade do jogo.
 * Ela permite a alternância entre modos visuais acessíveis e a integração com leitores de tela
 * ou ferramentas como o VLibras, além de emitir eventos que facilitam a leitura de textos por tecnologias assistivas.
 * 
 * A `GameAcessibleDisplay` atua como um componente complementar à interface principal do jogo,
 * com foco na inclusão de pessoas com deficiência auditiva ou visual.
 * 
 * As principais funcionalidades incluem:
 * - Alternância de exibição do container acessível com base na ativação do modo Libras.
 * - Leitura acessível de textos via simulação de eventos do mouse para leitores de tela.
 * - Estilização dinâmica da área acessível para melhor adaptação visual do usuário.
 * 
 * O container de acessibilidade é mostrado ou ocultado com transições visuais suaves e,
 * quando ativo, reposiciona dinamicamente elementos da interface, como a barra de status.
 * 
 * @class GameAcessibleDisplay
 * @param {Object} father - Referência à instância pai ou componente controlador principal do jogo.
 * @version 0.9.0
 * @author [Wesley Welisten Rocha Santos Vieira]
 * @date [10/04/2025]
 */

class GameAcessibleDisplay{
    constructor(father){
        this.father = father
        
        this.container = document.querySelector('.gameAccessibleContainer')
        this.librasBtn = document.querySelector('.libras_btn')
        this.lightModeBtn = document.querySelector('.lightMode_btn')
        this.accessibleTextEl = document.querySelector('.accessible_text');

        this.infoHeader = document.querySelector('#info');
        this.displayBar = document.querySelector('#gameDisplay_bar');
        this.displayBody = document.querySelector('#gameDisplay_body');
        this.gameDisplay = document.querySelector('#gameDisplay');

        this.STYLES = {
            visible: {
                height: '73%',
                width: '100%',
                opacity: 1,
                display: 'block'
            },
            hidden: {
                height: '0%',
                width: '0%',
                opacity: 0,
                display: 'none',
                color: 'transparent'
            }
        };
    }

    toggleDisplay(){
        const isActive = this.librasBtn.classList.contains('active')
        
        if(isActive){
            this.container.style.display = this.STYLES.visible.display
            setTimeout(() => {
              this.container.style.height = this.STYLES.visible.height
              this.container.style.width  = this.STYLES.visible.width
              this.container.style.opacity  = this.STYLES.visible.opacity
              this.infoHeader.appendChild(this.displayBar)
            }, 20)
        }else{
            this.container.style.color = this.STYLES.hidden.color
            this.container.style.height = this.STYLES.hidden.height
            this.container.style.width  = this.STYLES.hidden.width
            this.container.style.opacity  = this.STYLES.hidden.opacity
            setTimeout(()=>{
                this.gameDisplay.insertBefore(this.displayBar, this.displayBody)
                this.container.style.display = this.STYLES.hidden.display
            }, 1000)
        }
    }

    readWithAccessibility(text){
        if(!text || typeof text !== 'string') return

        const mouseOverEvent = new MouseEvent('mouseover', {
            bubbles: true,
            cancelable: false,
            view: window
        })
        const mouseOutEvent = new MouseEvent('mouseout', {
            bubbles: true,
            cancelable: false,
            view: window
        })
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: false,
            view: window
        })

        this.accessibleTextEl.textContent = text
        
        this.accessibleTextEl.dispatchEvent(mouseOverEvent)
        setTimeout(() => this.accessibleTextEl.dispatchEvent(clickEvent), 200)
        this.accessibleTextEl.dispatchEvent(mouseOutEvent)

        setTimeout(() => this.accessibleTextEl.textContent = '', 300)
    }
}
export {
    GameAcessibleDisplay
}