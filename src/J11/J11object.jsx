import React from "react";
import { CarModel } from "../CarModel";
import { DARK_GLASS } from "../colorways";

// Leave rim / rim_logo / tire_speed out of a colorway to keep the model's wheel colors
const COLORWAYS = {
  j11og: { paint_base: 0x000000, paint_trim_1: 0xffffff, paint_trim_2: 0x970009, rim: 0x970009, rim_logo: 0xffffff },
  j11gray: { paint_base: 0x666666, paint_trim_1: 0xffffff, paint_trim_2: 0x666666, rim: 0x666666, rim_logo: 0xffffff },
  j11redwhite: { paint_base: 0x970009, paint_trim_1: 0xffffff, paint_trim_2: 0x666666, rim: 0x970009, rim_logo: 0x970009 },
  j11spacejam: { paint_base: 0x000000, paint_trim_1: 0xffffff, paint_trim_2: 0x7fabc6, rim: 0x000000, rim_logo: 0xffffff },
  j11gamma: { paint_base: 0x000000, paint_trim_1: 0x000000, paint_trim_2: 0x1c3c4c, rim: 0x1c3c4c, rim_logo: 0x1c3c4c },
  j11carolina: { paint_base: 0x0081d1, paint_trim_1: 0xffffff, paint_trim_2: 0x666666, rim: 0x0081d1, rim_logo: 0xffffff },
}

// Glass: empty cabin: dark glass. Adjust the tint with { ...DARK_GLASS, color: 0x... }
const GLASS = DARK_GLASS

export function J11({ vehicleData }) {
  return <CarModel car="J11" colorways={COLORWAYS} color={vehicleData.color} motion={vehicleData.motion} glass={GLASS} />;
}
