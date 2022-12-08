import React, {Suspense, useContext, useState, useEffect} from 'react';
import { Canvas } from "@react-three/fiber"

import Vehicle from '../getVehicle';
import VehicleContext from "../vehicleContext"
import Loader from "../Loader/Loader"
import { J7 } from './J7object';

function J7page() {
  const vehicleColor = useContext(VehicleContext)
  const [color, setColor] = useState("j7og")

  useEffect(() => {
    setColor(vehicleColor)
  }, [vehicleColor]);

  return (
    <Canvas shadows>
      <Suspense fallback={<Loader />}>
          <Vehicle>
            <J7 color={color} />
          </Vehicle>
      </Suspense>
    </Canvas>
  );
}

export default J7page;
