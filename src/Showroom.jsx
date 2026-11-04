import React, { useContext } from 'react';
import { Navigate, useParams } from "react-router";

import VehicleCanvas from './getVehicle';
import VehicleContext from "./vehicleContext"
import { AM95 } from './AM95/AM95Object';
import { B1 } from './B1/B1object';
import { J4 } from './J4/J4object';
import { J7 } from './J7/J7object';
import { J9 } from './J9/J9object';
import { J11 } from './J11/J11object';
import { J12 } from './J12/J12object';
import { Presto } from './Presto/PrestoObject';
import { Shox } from './Shox/ShoxObject';

// Every car, by its URL segment. Hovercraft float in instead of dropping onto their wheels.
const CARS = {
  J4: { render: (vehicleData) => <J4 vehicleData={vehicleData} /> },
  J7: { render: (vehicleData) => <J7 vehicleData={vehicleData} /> },
  J9: { render: (vehicleData) => <J9 vehicleData={vehicleData} /> },
  J11: { render: (vehicleData) => <J11 vehicleData={vehicleData} /> },
  J12: { render: (vehicleData) => <J12 vehicleData={vehicleData} /> },
  B1: { render: (vehicleData) => <B1 vehicleData={vehicleData} /> },
  Shox: { render: () => <Shox />, hover: true },
  Presto: { render: () => <Presto />, hover: true },
  AM95: { render: () => <AM95 />, hover: true },
}

// One studio for every car: this stays mounted while you switch cars (all car URLs use the
// same route), so the camera, zoom and turntable angle carry over and only the model swaps.
export default function Showroom() {
  const { car } = useParams()
  const vehicleData = useContext(VehicleContext)
  if (!CARS[car]) return <Navigate to="/" replace />

  return (
    <div className="vehicle-wrapper">
      <VehicleCanvas motion={vehicleData.motion} color={vehicleData.color} carKey={car} hover={CARS[car].hover}>
        {CARS[car].render(vehicleData)}
      </VehicleCanvas>
    </div>
  );
}
