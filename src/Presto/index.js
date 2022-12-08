import React, {Suspense} from 'react';
import { Canvas } from "@react-three/fiber"

import Vehicle from '../getVehicle';
import Loader from "../Loader/Loader"
import { Presto } from './PrestoObject';

function PrestoPage() {
  return (
    <Canvas shadows>
      <Suspense fallback={<Loader />}>
        <Vehicle>
          <Presto />
        </Vehicle>
      </Suspense>
    </Canvas>
  );
}

export default PrestoPage;
