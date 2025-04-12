/**
 * @class User
 * @classdesc Representa um jogador na aplicação.
 * 
 * Essa classe gerencia os dados do jogador, incluindo nome, tesouros e nível.
 * Também fornece métodos para atualizar o progresso do jogador e penalizá-lo
 * caso ele reinicie o jogo. Pode ser estendida no futuro para incluir atributos privados
 * e lógica adicional conforme o jogo evoluir.
 */

class User {
    constructor(nome){
        this.name = nome
        this.treasures = 0
        this.level = 0
    }

    // os getter e setter foram construidos para o meomento onde atributos serão privados
    getName(){
        return this.name
    }

    getTreasures(){
        return this.treasures
    }

    getLevel(){
        return this.level
    }

    setName(name){
        this.name = name
    }

    setLevel(level){
        if(typeof level === 'number' && level >= 0){
            this.level = level
        } else {
            throw new Error("Nível inválido!")
        }
    }
    
    updateTreasures(){
        this.treasures++
    }

    updateUser(){
        this.level++
    }

    replayUserGame(){
        this.treasures = Math.max(0, this.treasures - 8)
        if(this.level > 1) this.level--
    }
}

export {
    User
}