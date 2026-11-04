import React from "react";
import { CarModel } from "../CarModel";
import { DARK_GLASS } from "../colorways";

// Glass: empty cabin: dark glass. Adjust the tint with { ...DARK_GLASS, color: 0x... }
const GLASS = DARK_GLASS

export function B1({ vehicleData }) {
  return <CarModel car="B1" motion={vehicleData.motion} glass={GLASS} />;
}
