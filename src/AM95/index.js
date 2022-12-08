import React, {Suspense} from 'react';
import { Canvas } from "@react-three/fiber"

import Vehicle from '../getVehicle';
import Loader from "../Loader/Loader"
import { AM95 } from './AM95Object';

function AM95Page() {
  return (
    <Canvas shadows>
      <Suspense fallback={<Loader />}>
        <Vehicle>
          <AM95 />
        </Vehicle>
      </Suspense>
    </Canvas>
  );
}

export default AM95Page;
