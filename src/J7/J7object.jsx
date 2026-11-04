import React from "react";
import { CarModel } from "../CarModel";
import { TINTED_GLASS } from "../colorways";

// Add rim / rim_logo / tire to a colorway to recolor the wheels; leave them out to keep the model's colors
const COLORWAYS = {
    j7og: {
        paint_base: 0x999999,
        paint_base_2: 0x666666,
        paint_base_3: 0x666666,
        paint_accent_1: 0xB9256B,
        paint_accent_2: 0x680BE7,
        paint_under: 0x111111,
        rim: 0x999999,
        rim_logo: 0x999999,
    },
    j7french: {
        paint_base: 0xdddddd,
        paint_base_2: 0xdddddd,
        paint_base_3: 0xdddddd,
        paint_accent_1: 0x2D82BD,
        paint_accent_2: 0x175179,
        paint_under: 0xdddddd,
        rim: 0xffffff,
        rim_logo: 0xffffff,
    },
    j7white: {
        paint_base: 0x999999,
        paint_base_2: 0x666666,
        paint_base_3: 0x999999,
        paint_accent_1: 0x999999,
        paint_accent_2: 0x666666,
        paint_under: 0x333333,
        rim: 0x999999,
        rim_logo: 0x999999,
    },
    j7tan: {
        paint_base: 0xa57530,
        paint_base_2: 0xa57530,
        paint_base_3: 0x333333,
        paint_accent_1: 0x4c2d63,
        paint_accent_2: 0xa57530,
        paint_under: 0x333333,
        rim: 0x333333,
        rim_logo: 0xa57530,
    },
}

// Glass: see-through 70% tint. Adjust the tint with { ...TINTED_GLASS, color: 0x... }
const GLASS = TINTED_GLASS

export function J7({ vehicleData }) {
  return <CarModel car="J7" colorways={COLORWAYS} color={vehicleData.color} motion={vehicleData.motion} glass={GLASS} />;
}
