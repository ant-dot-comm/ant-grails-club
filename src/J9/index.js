import React, {Suspense, useContext, useState, useEffect} from 'react';
import { Canvas } from "@react-three/fiber"

import Vehicle from '../getVehicle';
import VehicleContext from "../vehicleContext"
import Loader from '../Loader/Loader';
import { J9 } from './J9object';

function J9page() {
  const vehicleContextData = useContext(VehicleContext)
  const [vehicleData, setVehicleData] = useState(vehicleContextData)

  useEffect(() => {
    setVehicleData(vehicleContextData)
  }, [vehicleContextData]);

  return (
    <Canvas shadows>
      <Suspense fallback={<Loader />}>
          <Vehicle motion={vehicleData.motion}>
            <J9 vehicleData={vehicleData} />
          </Vehicle>
      </Suspense>
    </Canvas>
  );
}

export default J9page;
