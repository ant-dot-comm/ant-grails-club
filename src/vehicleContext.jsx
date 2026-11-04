import { createContext, useState } from 'react'

const VehicleContext = createContext()

export function VehicleProvider({children}) {
    const [color, setColor] = useState('')
    const [motion, setMotion] = useState(false)

    return (
        <VehicleContext.Provider value={{color, setColor, motion, setMotion}}>
            {children}
        </VehicleContext.Provider>
    )
}

export default VehicleContext