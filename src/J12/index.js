import React, {Suspense, useContext, useState, useEffect} from 'react';
import { Canvas } from "@react-three/fiber"

import Vehicle from '../getVehicle';
import VehicleContext from "../vehicleContext"
import Loader from "../Loader/Loader"
import { J12 } from './J12object';

function J12page() {
  const vehicleContextData = useContext(VehicleContext)
  const [vehicleData, setVehicleData] = useState(vehicleContextData)

  useEffect(() => {
    setVehicleData(vehicleContextData)
  }, [vehicleContextData]);

  return (
    <Canvas shadows>
      <Suspense fallback={<Loader />}>
        <Vehicle motion={vehicleData.motion}>
          <J12 vehicleData={vehicleData}/>
        </Vehicle>
      </Suspense>
    </Canvas>
  );
}

export default J12page;
