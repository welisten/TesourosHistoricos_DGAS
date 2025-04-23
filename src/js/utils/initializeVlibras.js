import vLibras from '../librasBeauty.js'
// import vLibras from 'vlibras'

document.addEventListener('DOMContentLoaded', () => {
    const origin = window.location.origin
    try{
        const vlibras = new vLibras.Widget(`${origin}/app`)
        console.log("vlibras widget initialized", vlibras)

    } catch(error) {
        console.error("vlibras widget not initialized: ", error)
        return
    }
})
