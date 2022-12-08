import { Html } from "@react-three/drei"

export default function Loader() {
    return (
        <Html center>
            <div className="flex-center">
                <img
                    className="loading-rim" 
                    height={50} width={50} 
                    src="images/LoadingRim.png" 
                    alt="loading"
                />
            </div>
        </Html>
    )
}