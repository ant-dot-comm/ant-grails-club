import React from "react";
import { CarModel } from "../CarModel";
import { TINTED_GLASS } from "../colorways";

// Leave rim / rim_logo / tire out of a colorway to keep the model's wheel colors
const COLORWAYS = {
    j9og: {
        paint_base: 0xffffff,
        paint_trim_mid: 0x111111,
        paint_trim_humps: 0x111111,
        paint_trim_top: 0x111111,
        paint_trim_top_front: 0x111111,
        paint_trim_top_back: 0x111111,
        paint_sole: 0xffffff,
        paint_tire_well: 0xffffff,
    },
    j9flint: {
        paint_base: 0x686868,
        paint_trim_mid: 0x686868,
        paint_trim_humps: 0x686868,
        paint_trim_top: 0x868686,
        paint_trim_top_front: 0x868686,
        paint_trim_top_back: 0x868686,
        paint_sole: 0xffffff,
        paint_tire_well: 0xffffff,
    },
    j9olive: {
        paint_base: 0x222222,
        paint_trim_mid: 0x222222,
        paint_trim_humps: 0x222222,
        paint_trim_top: 0x5D5D00,
        paint_trim_top_front: 0x5D5D00,
        paint_trim_top_back: 0x5D5D00,
        paint_sole: 0x222222,
        paint_tire_well: 0x222222,
    },
    j9dreamIt: {
        paint_base: 0x222222,
        paint_trim_mid: 0x222222,
        paint_trim_humps: 0x222222,
        paint_trim_top: 0x63477A,
        paint_trim_top_front: 0x249A8A,
        paint_trim_top_back: 0xE7AF1D,
        paint_sole: 0xffffff,
        paint_tire_well: 0xffffff,
    },
    j9doIt: {
        paint_base: 0x222222,
        paint_trim_mid: 0x222222,
        paint_trim_humps: 0x222222,
        paint_trim_top: 0x970009,
        paint_trim_top_front: 0x249A8A,
        paint_trim_top_back: 0x63477A,
        paint_sole: 0xffffff,
        paint_tire_well: 0xffffff,
    },
    j9grayblack: {
        paint_base: 0xffffff,
        paint_trim_mid: 0x222222,
        paint_trim_humps: 0x222222,
        paint_trim_top: 0x999999,
        paint_trim_top_front: 0x999999,
        paint_trim_top_back: 0x999999,
        paint_sole: 0xffffff,
        paint_tire_well: 0xffffff,
    },
    j9blackgrey: {
        paint_base: 0x333333,
        paint_trim_mid: 0x222222,
        paint_trim_humps: 0x222222,
        paint_trim_top: 0x999999,
        paint_trim_top_front: 0x999999,
        paint_trim_top_back: 0x999999,
        paint_sole: 0x333333,
        paint_tire_well: 0x333333,
    },
    j9carolina: {
        paint_base: 0xe3e3e3,
        paint_trim_mid: 0x0081d1,
        paint_trim_humps: 0x0081d1,
        paint_trim_top: 0xe3e3e3,
        paint_trim_top_front: 0xe3e3e3,
        paint_trim_top_back: 0xe3e3e3,
        paint_sole: 0xe3e3e3,
        paint_tire_well: 0xe3e3e3,
    },
}

// Glass: see-through 70% tint. Adjust the tint with { ...TINTED_GLASS, color: 0x... }
const GLASS = TINTED_GLASS

export function J9({ vehicleData }) {
  return <CarModel car="J9" colorways={COLORWAYS} color={vehicleData.color} motion={vehicleData.motion} glass={GLASS} />;
}
