/* O Jogo 3 pode ser iniciado tanto a partir do seu servidor raiz quanto do servidor do monorepositório.  
   Dependendo da inicialização, a pasta "public" pode não ser rastreada.  
   Para solucionar esse problema, utilizei variáveis de ambiente para ajustar o caminho relativo dos assets.  
   Essas variáveis são obtidas do backend por meio deste fetch. */

let environmentVariables
let defaultPath =  ' '

async function loadEnviromentVariables(){
    try{
        const response = await fetch('/env')
        environmentVariables = await response.json()
        if(environmentVariables){
            const assetsPath = environmentVariables.ASSETS_PATH    
            updateAssetsPath(assetsPath)
        } else {
            alert(`Caminho dos assets vazio`)
            updateAssetsPath(defaultPath)
        }
    } catch(error){
        console.error('Os caminhos dos Assets não foram carregados corretamente, os assets podem não estar corretos')
        updateAssetsPath(defaultPath)
    }
}
function updateAssetsPath(assetsPath){
    cardsImagesDataArr.forEach(obj => {
        obj.src = `${assetsPath}${obj.src}`
    })
    audioDataArr.forEach(obj => {
        obj.src = `${assetsPath}${obj.src}`
    })
}

const cardsImagesDataArr = [
    {
        name: 'Parque Nacional da Serra dos Órgãos',
        description: 'Um dos principais parques nacionais do Brasil, conhecido por suas formações rochosas, trilhas e biodiversidade',
        src: 'Assets/imgs/parqueNacionalSerraOrgaos1536x864.jpg',
        class: 'Card'
    },
    {
        name: 'Concordia',
        description: 'Um dos lugares mais bonitos da cidade foi “descoberto” recentemente, quando foi criada a primeira agência de turismo do município, em junho de 2015',
        src: 'Assets/imgs/concordia.jpg',
        class: 'Card'
    },
    {
        name: 'Capela de Nossa Senhora da Ajuda',
        description: 'Uma Capela histórica localizada no centro de Guapimirim, importante para a comunidade local',
        src: 'Assets/imgs/capela_nossa_senhora_dajuda_guapimirim.jpg',
        class: 'Card'
    },
    {
        name: 'Pico Dedo de Deus',
        description: 'Uma formação rochosa icônica e cartão postal da região, muito procurada por alpinistas e amantes da natureza.',
        src: 'Assets/imgs/dedo-de-deus.jpg',
        class: 'Card'
    },
    {
        name: 'Capoeira',
        description: 'A prática da capoeira, que é uma expressão cultural importante na região, integrando música, dança e artes marciais.',
        src: 'Assets/imgs/capoeira.jpg',
        class: 'Card'
    },
    {
        name: 'Capela de Nossa Senhora da Conceição',
        description: 'A Capela de Nossa Senhora da Conceição, em Guapimirim-RJ, foi construída em 1713, numa pequena ilha fluvial entre dois braços do Rio Soberbo, no Parque da Serra dos Órgãos.',
        src: 'Assets/imgs/capela_nossa_senhora_conceicao.jpg',
        class: 'Card'
    },
    {
        name: 'Ferrovia',
        description: ' Inaugurada em 1898, essa linha ferroviária conecta o município de Guapimirim ao Rio de Janeiro, facilitando o transporte de pessoas e mercadorias.',
        src: 'Assets/imgs/Trem_na_estação_Guapimirim.jpg',
        class: 'Card'
    },
    {
        name: 'APA',
        description: 'A Área de Proteção Ambiental (APA) de Guapimirim, criada em 1984, é uma importante unidade de conservação localizada no estado do Rio de Janeiro. Abrangendo manguezais, rios, e áreas de restinga, a APA protege uma rica biodiversidade e diversos ecossistemas costeiros e marinhos.',
        src: 'Assets/imgs/apa.jpeg',
        class: 'Card'
    }
]

const generalImagesDataArr = [
    {
        name: 'clock',
        description: 'relógio',
        src: "https://res.cloudinary.com/dqzwqdc0a/image/upload/v1743228481/DGAS-Plataforma/game3/general/uw7rl7jpyqyalf0mscd2.png",
        class: 'LevelScore'
    },
    {
        name: 'golden star',
        description: 'estrela dourada para Pontuação',
        src: "https://res.cloudinary.com/dqzwqdc0a/image/upload/v1743227459/DGAS-Plataforma/game3/general/vpjy7ufstws20rc8hc3i.png",
        class: 'LevelScore'
    },
    {
        name: 'level',
        description: 'level',
        src: "https://res.cloudinary.com/dqzwqdc0a/image/upload/v1743228482/DGAS-Plataforma/game3/general/hznqilgjeyrofjvz4cbm.png",
        class: 'LevelScore'
    },
    {
        name: 'steel star',
        description: 'estrela de prata para Pontuação',
        src: "https://res.cloudinary.com/dqzwqdc0a/image/upload/v1743227459/DGAS-Plataforma/game3/general/r9vm15espvkxgschdba5.png",
        class: 'LevelScore'
    },
    {
        name: 'treasure',
        description: 'tesouro',
        src: "https://res.cloudinary.com/dqzwqdc0a/image/upload/v1743020777/DGAS-Plataforma/game3/general/roy5gguau9x7utyszcyb.png",
        class: 'LevelScore'
    },
    {
        name: 'trophy',
        description: 'trofeu',
        src: "https://res.cloudinary.com/dqzwqdc0a/image/upload/v1743229131/DGAS-Plataforma/game3/general/jzhmffkqwazjkytspsxo.png",
        class: 'LevelScore'
    },
]

const audioDataArr = [
    {
        name: 'ucarine',
        src: 'Assets/songs/ucarine.wav',
        scene: 'Form'
    },
    {
        name: 'transition',
        src: 'Assets/songs/intro.wav',
        scene: 'Form LevelScore'
    },
    {
        name: 'main',
        src: 'Assets/songs/main.wav',
        scene: 'Game'
    },
    {
        name: 'select',
        src: 'Assets/songs/select.wav',
        scene: 'Game'
    },
    {
        name: 'success',
        src: 'Assets/songs/success.mp3',
        scene: 'Game'
    },
    {
        name: 'fail',
        src: 'Assets/songs/fail.mp3',
        scene: 'Game'
    },
    {
        name: 'victory',
        src: 'Assets/songs/victory.wav',
        scene: 'LevelScore'
    },
    {
        name: 'aplause',
        src: 'Assets/songs/aplause.wav',
        scene: 'LevelScore' 
    },
    {
        name: 'incorrect',
        src: 'Assets/songs/incorrect.wav',
        scene: 'IntroForm' 
    },
    {
        name: 'click',
        src: 'Assets/songs/click.mp3',
        scene: 'IntroForm Game LevelScore' 
    }
]



export{
    loadEnviromentVariables,
    updateAssetsPath,
    cardsImagesDataArr,
    generalImagesDataArr,
    audioDataArr
}