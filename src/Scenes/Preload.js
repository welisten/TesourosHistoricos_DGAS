import { IntroForm } from "../Scenes/Form.js";
import { cardsImagesDataArr, audioDataArr } from "../Consts/Values.js";
import { colors } from "../Consts/Colors.js";
import { getDeviceSize } from '../js/utils/getDeviceSize.js';
import { gameData } from "../Consts/gameData.js";

class Preloader {
    constructor(){
        this.phaserGame = null
        this.assetsControls = {}
        this.setPreloader()
    }

    setPreloader(){
        const that = this
        let [containerHeight] = getDeviceSize()

        const parent = document.querySelector('#gameBoard')
        const config = {
            type: Phaser.AUTO,
            width: containerHeight,
            height: containerHeight,
            backgroundColor: gameData.isDarkMode ? colors.black : colors.blue_baby,
            parent: parent,
            scene: {
                preload:  function () {
                    that.preload(this)
                }
            }
        }

        this.phaserGame = new Phaser.Game(config)
    }
    preload(scene){
        const gameCanvas = scene.sys.game.canvas
        let [height] = getDeviceSize()
        let containerWidth = height

        this.setupCanvas(gameCanvas)
        let store = (window.gameAssets = {})
        this.loadAssets(scene)

        const logoImg =  document.querySelector(".logo")
        const progressBar = scene.add.graphics();
        const progressBox = scene.add.graphics();
        const loadingText = this.setupLoadingUI(logoImg, progressBox, containerWidth, scene)

        scene.load.on('progress', (value) => {
            this.updateProgressBar(progressBar, containerWidth, value)
        });
        scene.load.on('complete',  () => {
            this.finalizePreload({
                store,
                logoImg,
                gameCanvas,
                progressBar,
                progressBox,
                loadingText,
                scene
            });
        });
    }
    setupCanvas(gameCanvas){
        gameCanvas.id = 'tesourosHistoricos_canvas'
        gameCanvas.parentNode.style.display = 'flex'
        gameCanvas.style.border = `5px solid ${colors.blue_baby}`;
        gameCanvas.style.borderRadius = "20px"
    }
    loadAssets(scene){
        cardsImagesDataArr.forEach(dataObj => {
            scene.load.image(`${dataObj.name}_1`, dataObj.src)
            scene.load.image(`${dataObj.name}_2`, dataObj.src)
        })

        audioDataArr.forEach((dataObj) => {
            scene.load.audio(dataObj.name, dataObj.src)
        })
    }
    setupLoadingUI(logoImg, progressBox, containerWidth, scene){
        logoImg.classList.add('active')
        logoImg.style.height = `${containerWidth * 0.65}px`

        progressBox.fillStyle('0xffffff', 1);
        progressBox.fillRoundedRect(
            (containerWidth - (containerWidth * .8)) / 2 ,
            containerWidth * .85,
            containerWidth * .8,
            20,
            15
        );
        progressBox.lineStyle(5, '0xffffff', 1);
        progressBox.strokeRoundedRect(
            (containerWidth - (containerWidth * .8)) / 2,
            containerWidth * .85,
            containerWidth * .8,
            20,
            15
        );

        const loadingText = scene.make.text({
            x: containerWidth / 2,
            y: containerWidth * .8,
            text: 'Loading...',
            style: {
            font: '20px monospace',
            fill: '#ffffff'
        }
        });
        loadingText.setOrigin(0.5, 0.5);
        return loadingText
    }
    updateProgressBar(progressBar, containerWidth, value){
        progressBar.clear();
        progressBar.fillStyle(0x3498db, 1);
        progressBar.fillRoundedRect(
            (containerWidth - (containerWidth * .8)) / 2 + containerWidth * .01,
            containerWidth * .85 + 5,
            (containerWidth * .78) * value,
            10,
            5
        );
        progressBar.setDepth(2)
    }
    finalizePreload({ store, logoImg, gameCanvas, progressBar, progressBox, loadingText, scene }){
        gameData.isPreloadComplete = true
       
        const criarObjeto = (object, key, callback) => {object[key] = callback}
        const getImage = (key) => scene.textures.get(key).getSourceImage() // retorna a url
        const getAudio = (key) => scene.cache.audio.get(key)// retorna audioBuffer
        
        document.querySelector('.textToReader').textContent = 'O jogo foi carregado com sucesso.'

        audioDataArr.forEach( dataObj => {
            criarObjeto(store, dataObj.name, getAudio(dataObj.name))
        })
        cardsImagesDataArr.forEach( dataObj => {
            criarObjeto(store, `${dataObj.name}_1`, getImage(`${dataObj.name}_1`))
            criarObjeto(store, `${dataObj.name}_2`, getImage(`${dataObj.name}_2`))
        })

        setTimeout(() => {
            ['gameControls', 'gameBoard_aside', 'game_Container' ].forEach(id => {
                document.getElementById(id).style.display = 'flex'
                document.getElementById(id).style.display = 'flex'
                document.getElementById(id).style.display = 'flex'
            })

            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();

            gameCanvas.remove()

            logoImg.classList.remove('actvive')
            logoImg.remove()

            gameData.intro =  new IntroForm()
        }, 500)

    }

}


export{
    Preloader
}


