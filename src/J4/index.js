import React, {Suspense, useContext, useState, useEffect} from 'react';
import { Canvas } from "@react-three/fiber"

import Vehicle from '../getVehicle';
import VehicleContext from "../vehicleContext"
import Loader from "../Loader/Loader"
import { J4 } from './J4object';

function J4page() {
  const vehicleContextData = useContext(VehicleContext)
  const [vehicleData, setVehicleData] = useState(vehicleContextData)

  useEffect(() => {
    setVehicleData(vehicleContextData)
  }, [vehicleContextData]);

  return (
    <div className="vehicle-wrapper">
      <Canvas shadows>
        <Suspense fallback={<Loader />}>
            <Vehicle motion={vehicleData.motion}>
              <J4 vehicleData={vehicleData} />
            </Vehicle>
        </Suspense>
      </Canvas>
    </div>
  );
}

export default J4page;
