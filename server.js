/**
 * ==============================================
 *  Servidor Express para Aplicação Tesouros Históricos
 * ==============================================
 * 
 * - Este servidor é responsável por fornecer os serviços da aplicação, incluindo:
 *   - Servir arquivos estáticos (public, src)
 *   - Configurar middlewares globais (CORS, Helmet, Compression)
 *   - Implementar proxies para VLibras e a aplicação
 *   - Expor variáveis de ambiente ao front-end
 * 
 * - Tecnologias utilizadas:
 *   - Express.js: Framework principal para a API
 *   - Helmet: Segurança reforçada contra ataques comuns
 *   - Compression: Melhor performance através de compactação de respostas
 *   - CORS: Controle de acesso para diferentes origens
 * 
 * @author  [Wesley Welisten Rocha Santos Vieira]
 * @version 0.9.0
 * @date    [04/04/2025]
 */

require('dotenv').config()
const { urlencoded }            = require("body-parser");
const express                   = require("express");
const mainRoute                 = require('./routes/mainRoute')
const cors                      = require('cors')
const vLibrasproxyMiddleware    = require('./middlewares/vLibrasProxyMiddleware');
const appProxyMiddleware        = require("./middlewares/appProxyMiddleware");
const helmet                    = require('helmet')
const compression               = require('compression')
const path                      = require('path')

if(!process.env.PORT || !process.env.APP_ASSETS_PATH){
    console.error("Erro: Variáveis de ambiente ausentes!")
    process.exit(1)
}

const app   = express()
const PORT  = process.env.PORT || 3333

//  Middlewares globais

app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'src')))
app.use(express.json())
app.use(urlencoded({extended: true}))
app.use(helmet({                    // melhora a segurança para ataques comuns
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "https://www.vlibras.gov.br",
                "https://code.jquery.com",
                "https://cdnjs.cloudflare.com",
                "https://cdn.jsdelivr.net",
                "'unsafe-inline'" // Se precisar de scripts inline
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdnjs.cloudflare.com",
                "https://fonts.googleapis.com"
            ],
            fontSrc: [
                "'self'",
                "https://cdnjs.cloudflare.com",
                "https://fonts.googleapis.com",
                "https://fonts.gstatic.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "blob:",
                "https://res.cloudinary.com" // Permite imagens do Cloudinary
            ],
            mediaSrc: ["'self'", "blob:"], // Para arquivos de áudio/vídeo em blob
            connectSrc: [
                "'self'",
                "https://acessos.vlibras.gov.br",
                "https://dicionario2.vlibras.gov.br"
            ],
            workerSrc: [
                "'self'",
                "blob:"
            ]
        },
    },
}))
app.use(compression())                //melhora a performance


//  Rotas
app.use('/', mainRoute)


/*  Rota para fornecer ao front-end as variáveis de ambiente necessárias para 
definir os caminhos relativos dos assets,  garantindo compatibilidade independente 
do servidor que inicialize a aplicação (monorepo ou raiz). */ 

app.get('/env', (req, resp) => {
    resp.json({
        ASSETS_PATH: process.env.APP_ASSETS_PATH,
        PORT: PORT
    })
})

/*--------------------------------------------------------------------------- */

// Proxy Middlewares
app.use(vLibrasproxyMiddleware);
app.use('/app', appProxyMiddleware)


app.listen( PORT, () => console.log(`TESOUROS HISTÓRICOS RODANDO NA PORTA ${PORT} \n`))