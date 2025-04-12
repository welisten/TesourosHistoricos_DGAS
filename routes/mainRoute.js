/**
 * Main Route Configuration
 * 
 * Este arquivo define a rota principal da API.
 * Ele inclui:
 * - Middleware de cache para melhorar a performance.
 * - Logs de requisição no ambiente de desenvolvimento.
 * - Tratamento de erros para evitar falhas inesperadas.
 * 
 * 🔹 Rota disponível:
 *   GET /  → Retorna uma mensagem indicando que a API está funcionando.
 * 
 * @module routes/mainRoute
 */


require('dotenv').config()

const express   =  require("express")
const route     = express.Router()

const apicache = require("apicache")
const cacheTime = process.env.NODE_ENV === "production" ? "5 minutes" : "10 seconds"
const cache = apicache.middleware(cacheTime)

route.get('/', cache ,(req, res) => {
    try{
        if(process.env.NODE_ENV !== 'production'){
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip}`)
        }
        
        res.status(200).json({ message: '✅ - Main rote is working' })
    }catch(error){
        console.log("❌ - Erro na rota '/':", error)
        res.status(500).json({error})
    }
})

module.exports = route