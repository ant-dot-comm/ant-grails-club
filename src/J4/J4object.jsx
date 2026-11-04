import React from "react";
import { CarModel } from "../CarModel";
import { DARK_GLASS } from "../colorways";

// Leave rim / rim_logo / tire out of a colorway to keep the model's wheel colors
const COLORWAYS = {
    j4og: {
        paint_base: 0x56A7E7,
        paint_accent_1: 0x333333,
        paint_accent_2: 0xDC0500,
        paint_accent_3: 0x333333,
        paint_trim_top: 0x56A7E7,
        paint_trim_top_left: 0xffffff,
        paint_trim_mid: 0xffffff,
        paint_trim_sole: 0x333333,
        paint_trim_sole_back: 0x333333,
        paint_tire_well: 0x333333,
        rim: 0xdddddd,
        rim_logo: 0x56A7E7,
    },
    j4black: {
        paint_base: 0x333333,
        paint_accent_1: 0x666666,
        paint_accent_2: 0x666666,
        paint_accent_3: 0x333333,
        paint_trim_top: 0x333333,
        paint_trim_top_left: 0x333333,
        paint_trim_mid: 0xffffff,
        paint_trim_sole: 0x666666,
        paint_trim_sole_back: 0xDC0500,
        paint_tire_well: 0x333333,
        rim: 0xDC0500,
        rim_logo: 0x333333,
    },
    j4white: {
        paint_base: 0xdddddd,
        paint_accent_1: 0x333333,
        paint_accent_2: 0xffffff,
        paint_accent_3: 0xaaaaaa,
        paint_trim_top: 0xaaaaaa,
        paint_trim_top_left: 0xaaaaaa,
        paint_trim_mid: 0xffffff,
        paint_trim_sole: 0x333333,
        paint_trim_sole_back: 0xaaaaaa,
        paint_tire_well: 0xffffff,
        rim: 0xdddddd,
        rim_logo: 0xdddddd,
    },
    j4red: {
        paint_base: 0xDC0500,
        paint_accent_1: 0x666666,
        paint_accent_2: 0x666666,
        paint_accent_3: 0x333333,
        paint_trim_top: 0x333333,
        paint_trim_top_left: 0x333333,
        paint_trim_mid: 0xffffff,
        paint_trim_sole: 0xffffff,
        paint_trim_sole_back: 0x777777,
        paint_tire_well: 0xDC0500,
        rim: 0xdddddd,
        rim_logo: 0xDC0500,
    },
    j4eastside: {
        paint_base: 0xffffff,
        paint_accent_1: 0xd4af37,
        paint_accent_2: 0xdddddd,
        paint_accent_3: 0x999999,
        paint_trim_top: 0x999999,
        paint_trim_top_left: 0x999999,
        paint_trim_mid: 0xdddddd,
        paint_trim_sole: 0x1D2354,
        paint_trim_sole_back: 0xF2D577,
        paint_tire_well: 0xffffff,
        rim: 0xdddddd,
        rim_logo: 0xd4af37,
    },
}

// Glass: empty cabin: dark glass. Adjust the tint with { ...DARK_GLASS, color: 0x... }
const GLASS = DARK_GLASS

export function J4({ vehicleData }) {
  return <CarModel car="J4" colorways={COLORWAYS} color={vehicleData.color} motion={vehicleData.motion} glass={GLASS} />;
}
