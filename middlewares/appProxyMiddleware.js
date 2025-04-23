/**
 * Middleware de proxy para a rota "/app"
 *
 * Este middleware utiliza "http-proxy-middleware" para encaminhar requisições
 * do servidor local para a URL "https://vlibras.gov.br/app". Ele permite que o 
 * navegador contorne restrições de CORS ao acessar a API do VLibras.
 *
 * - `changeOrigin: true`: Modifica o cabeçalho "Origin" da requisição para 
 *   corresponder ao destino, evitando bloqueios de CORS.
 * - Manipulação de cabeçalhos nas requisições e respostas para garantir que 
 *   o proxy funcione corretamente sem restrições de cache ou políticas de segurança.
 * - Exibe logs das requisições e respostas no console para facilitar o 
 *   monitoramento e depuração.
 */
const { createProxyMiddleware } = require('http-proxy-middleware')

const appProxyMiddleware = createProxyMiddleware({
    target: 'https://vlibras.gov.br/app',
    changeOrigin: true,
    on: {
        proxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('Access-Control-Allow-Origin', '*');
            proxyReq.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            proxyReq.setHeader('sec-fetch-mode', 'no-cors')
            proxyReq.setHeader('Origin', 'https://vlibras.gov.br')
            proxyReq.setHeader('Referer', 'https://vlibras.gov.br')
            proxyReq.removeHeader('cache-control');

            console.log(`[Proxy Request] ${req.method} ${req.originalUrl}`)
        },
        proxyRes: (proxyRes, req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.setHeader('sec-fetch-mode', 'no-cors')
            res.removeHeader('cache-control');
            
            console.log(`[Proxy Response] ${res.statusCode}`);
        }
    }
})
console.log("middleware 'appProxyMiddleware' inicializado")

module.exports = appProxyMiddleware