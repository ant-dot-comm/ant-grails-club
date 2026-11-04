import React from "react";
import { CarModel } from "../CarModel";
import { TINTED_GLASS } from "../colorways";

// Glass: see-through 70% tint. Adjust the tint with { ...TINTED_GLASS, color: 0x... }
const GLASS = TINTED_GLASS

// Hovercraft: no wheels to spin
export function Shox() {
  return <CarModel car="Shox" glass={GLASS} />;
}
