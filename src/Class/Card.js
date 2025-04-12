/**
 * Representa uma carta em um jogo de memória.
 * Cada carta possui uma posição (linha e coluna), imagem, nome, descrição e estados relacionados ao jogo.
 */
class Card {
     /**
     * Cria uma nova carta.
     * @param {string} name - Nome da carta.
     * @param {number} column - Coluna onde a carta está posicionada.
     * @param {number} row - Linha onde a carta está posicionada.
     * @param {HTMLElement} element - Elemento do DOM que representa visualmente a carta.
     * @param {string} description - Descrição textual da carta.
     * @param {string} src - Caminho da imagem associada à carta.
     */
    constructor(name, column, row, element, description, src) {
        this.name = name;
        this.description = description;
        this.src = src;
        this.imageEl = element;
        this.location = { row: row, column: column};
        this.isFlipped = false;
        this.isMatched = false;
        this.incorrectMatch= false;

        this.imageEl.classList.add('cardImage')
    }

    /**
     * Inverte o estado de "virada" da carta.
     * Se estiver virada, desvira. Se estiver desvirada, vira.
     */
    flip() {
        this.isFlipped = !this.isFlipped;
    }

    /**
     * Marca a carta como corretamente pareada.
     */
    match() {
        this.isMatched = true;
    }

    /**
     * Marca a carta como incorretamente pareada.
     */
    fail() {
        this.incorrectMatch = !this.incorrectMatch
    }

    /**
     * Restaura a carta ao seu estado inicial (não virada, não pareada, não marcada como incorreta).
     */
    restore() {
        this.isFlipped = false
        this.isMatched = false
        this.incorrectMatch = false
    }
}

export {
    Card
}