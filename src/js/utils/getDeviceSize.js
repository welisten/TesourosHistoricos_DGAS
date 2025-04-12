const getDeviceSize = () => {
    let height = window.innerHeight
    let width = window.innerWidth
    switch(true){
        case (width < 600 && height < 800):
            break;
            
        case (width >= 600 && width <= 1020 && height < 1080):
            width = Math.floor(width * 0.6)
            height = Math.floor(height * 0.70)
            
            return [width, height] 

        case (width >= 600 && width <= 1440 && height < 1080):
            
            width = Math.floor(width * 0.33)
            height = Math.floor(height * 0.70)

            return [width, height] 

        case (width > 1440 && height >= 900):
            width = Math.floor(width * 0.26)
            height = Math.floor(height * 0.68)
            
            return [width, height]

        default:
            console.log(`screen size unknown : width = ${width} - height = ${height}`)                      
    }
}

export{
    getDeviceSize
}