import { useEffect, useState } from "react"
import { useProgress } from "@react-three/drei"

const message = [
    "Loading the hotness",
    "Adjusting the dilithium crystal converter assembly",
    "How about this weather, eh?",
    "Optimizing the optimizer...",
    "Initializing the initializer...",
    "TODO: Insert witty loading message",
]

// Rendered outside the Canvas; useProgress tracks every three.js loader
export default function Loader() {
    const { active } = useProgress()
    const [messageIndex, setMessageIndex] = useState(0)

    useEffect(() => {
        // Pick a different message every tick so the text never gets stuck
        const interval = setInterval(() => setMessageIndex(prev => {
            const next = Math.floor(Math.random() * (message.length - 1))
            return next >= prev ? next + 1 : next
        }), 3000);
        return () => clearInterval(interval);
    }, []);

    if (!active) return null

    return (
        <div className="loader-overlay">
            <div className="loader">
                <img
                    className="loader-rim"
                    height={50} width={50}
                    src={`${import.meta.env.BASE_URL + "images/LoadingRim.png"}`}
                    alt="loading"
                />
                <div className="loader-message">{message[messageIndex]}</div>
            </div>
        </div>
    )
}
