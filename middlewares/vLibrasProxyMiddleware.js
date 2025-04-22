/**
 * Middleware de proxy para o VLibras
 *
 * Este middleware utiliza "http-proxy-middleware" para encaminhar requisições 
 * do servidor local para a URL do repositório do VLibras hospedado no JSDelivr.
 * Ele permite o acesso aos recursos do VLibras contornando restrições de CORS.
 *
 * - `changeOrigin: true`: Modifica o cabeçalho "Origin" da requisição para 
 *   corresponder ao destino, evitando bloqueios de CORS.
 * - `pathRewrite`: Reescreve o caminho das requisições para garantir a correta 
 *   correspondência entre o servidor local e a URL do VLibras no CDN.
 * - Modifica os cabeçalhos das requisições para garantir compatibilidade.
 */

require('dotenv').config()
const { createProxyMiddleware } = require('http-proxy-middleware')

const PORT = process.env.PORT || 9999



const vLibrasproxyMiddleware = createProxyMiddleware({
    target: 'https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/vlibras-portal@dev', // URL do servidor externo
    changeOrigin: true,
    pathRewrite: {
      '.*(/app/target)$' : 'https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/vlibras-portal@dev/app/target', // Remove o prefixo /api da URL e ajusta o caminho
    },
    on:{
        proxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('sec-fetch-mode', 'cors')       
        },
    }
})

module.exports = vLibrasproxyMiddleware