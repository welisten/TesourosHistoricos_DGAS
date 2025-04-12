/**
 * Classe responsável por gerenciar recursos de acessibilidade do jogo.
 * Permite a leitura de textos por leitores de tela e integração com ferramentas externas
 * de acessibilidade. Suporta encadeamento de textos e foco automático em elementos.
 *
 * A leitura é feita através de um elemento HTML invisível que recebe o texto,
 * forçando a ativação de leitores de tela em navegadores compatíveis.
 *
 * @class AccessibilityManager
 */


import { gameData } from "../../Consts/gameData.js";

export default class AccessibilityManager {
    /**
     * Cria uma instância do AccessibilityManager.
     *
     * @param {string} [focusSelector='.textToReader'] - Seletor CSS do elemento que receberá o texto para leitura de acessibilidade.
     */
    constructor(focusSelector = '.textToReader'){
        this.textToReaderEl = document.querySelector(focusSelector)
        this.lastText = ''
    }

    /**
     * Envia um texto para leitura por ferramentas de acessibilidade (como leitores de tela).
     * Pode concatenar texto anterior e opcionalmente dar foco em um elemento.
     *
     * @param {string} text - Texto que será lido.
     * @param {HTMLElement|null} [focusEle=null] - Elemento opcional a ser focado após a leitura.
     * @param {boolean} [textChaining=false] - Se true, concatena o novo texto ao já existente no elemento.
     */
    readText(text, focusEle = null, textChaining = false) {
        if (this.lastText === text) text += `.`;
        this.textToReaderEl.textContent = textChaining
            ? `${this.textToReaderEl.textContent} ${text}`
            : text;

        if (focusEle) focusEle.focus();
        this.lastText = text;
    }

    /**
     * Utiliza um mecanismo de leitura alternativo definido no objeto `gameData`
     * para realizar a leitura de acessibilidade.
     *
     * @param {string} text - Texto a ser lido pelo mecanismo externo de acessibilidade.
     */
    readWithAccessibility(text) {
        gameData.intro.gameAcessibleDisplay.readWithAccessibility(text);
    }
}

export { AccessibilityManager };