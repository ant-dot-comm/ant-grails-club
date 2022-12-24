import { useEffect, useState } from "react"
import { Html } from "@react-three/drei"

export default function Loader() {
    const [messageIndex, setMessageIndex] = useState(0)

    useEffect(() => {
        const number = 0 + (Math.random() * (4))
        const interval = setInterval(() =>  setMessageIndex(0 + (Math.round(number))), 2000);
        return () => clearInterval(interval);
    }, [messageIndex]);

    const message = [
        "Loading the hotness",
        "Adjusting the dilithium crystal converter assembly",
        "How about this weather, eh?",
        "Optimizing the optimizer...",
        "Initializing the initializer...",
        "TODO: Insert witty loading message",
    ]

    return (
        <Html center style={{color: "#ffffff", width: "100%"}}>
            <div className="loader">
                <img
                    className="loader-rim" 
                    height={50} width={50} 
                    src={`${process.env.PUBLIC_URL + "/images/LoadingRim.png"}`} 
                    alt="loading"
                />
                <div className="loader-message">{message[messageIndex]}</div>
            </div>
        </Html>
    )
}