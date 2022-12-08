import React, {Suspense} from 'react';
import { Canvas } from "@react-three/fiber"

import Vehicle from '../getVehicle';
import Loader from "../Loader/Loader"
import { Shox } from './ShoxObject';

function ShoxPage() {
  return (
    <Canvas shadows>
      <Suspense fallback={<Loader />}>
        <Vehicle>
          <Shox />
        </Vehicle>
      </Suspense>
    </Canvas>
  );
}

export default ShoxPage;
