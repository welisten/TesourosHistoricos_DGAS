/**
 * Classe responsável por gerenciar o sistema de áudio do jogo.
 * Utiliza a Web Audio API para controlar reprodução, volume e loop de sons e músicas.
 *
 * A instância pode tocar sons com ou sem loop, ajustar volume com base na configuração
 * global do jogo e interromper o áudio atual, mantendo o ponto de parada para continuar depois.
 *
 * @class AudioManager
 */

import { gameData } from "../../Consts/gameData.js"

class AudioManager {
  /**
   * Cria uma instância do gerenciador de áudio.
   *
   * @param {AudioContext} audioContext - Contexto de áudio da Web Audio API.
   * @param {GainNode} gainNode - Nó de ganho para controle de volume.
   */
  constructor(audioContext, gainNode) {
      this.audioContext = audioContext;
      this.gainNode = gainNode;
      this.currentAudio = { config: { startTime: 0 }, audio: [] };
  }

  /**
   * Reproduz um áudio a partir de um AudioBuffer.
   *
   * @param {AudioBuffer} audioBuffer - O buffer de áudio a ser reproduzido.
   * @param {number} [volume=1.0] - Volume da reprodução (entre 0 e 1). Ignorado se o som estiver mudo.
   * @param {boolean} [loop=false] - Define se o áudio deve ser reproduzido em loop.
   */
  playAudio(audioBuffer, volume = 1.0, loop = false) {
      const src = this.audioContext.createBufferSource();
      src.buffer = audioBuffer;
      src.loop = loop;

      volume = gameData.isMute ? 0 : volume;
      this.gainNode.gain.value = volume;
      
      src.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
      
      if(!loop) {
          src.start();
      } else {
          src.start(0, this.currentAudio.config.startTime);
          this.currentAudio.audio.push(src);
      }
  }
  
  /**
   * Para a reprodução do áudio atual, se houver algum tocando.
   * Salva o tempo de parada para possível retomada no futuro.
   */
  stopCurrentAudio() {
      if (this.currentAudio.audio) {
        this.currentAudio.audio.forEach(audio => {
            this.currentAudio.config.startTime = this.audioContext.currentTime;
            audio.stop();
            this.currentAudio.audio = [];
        })
      }
  }

  resetManager(){
        this.stopCurrentAudio()
        this.audioContext = null
        this.gainNode = null
  }

  reloadManager(){
    this.currentAudio = { config: { startTime: 0 }, audio: [] };

  }
}

export { AudioManager };
