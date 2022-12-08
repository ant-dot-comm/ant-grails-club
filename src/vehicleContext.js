import { createContext, useState } from 'react'

const VehicleContext = createContext()

export function VehicleProvider({children}) {
    const [color, setColor] = useState('')
    const [motion, setMotion] = useState(false)

    const changeColor = (color) => {
        setColor(color)
    }

    const vehicleMotion = (hasMotion) => {
        setMotion(hasMotion)
    }

    return (
        <VehicleContext.Provider value={{color, changeColor, motion, vehicleMotion}}>
            {children}
        </VehicleContext.Provider>
    )
}

export default VehicleContext