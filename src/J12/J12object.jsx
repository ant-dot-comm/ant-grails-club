import React from "react";
import { CarModel } from "../CarModel";
import { DARK_GLASS } from "../colorways";

const trims = (t1, t2, t3, t4, t5) => ({ paint_trim_1: t1, paint_trim_2: t2, paint_trim_3: t3, paint_trim_4: t4, paint_trim_5: t5 })

// Leave rim / rim_logo / tire out of a colorway to keep the model's wheel colors
const COLORWAYS = {
  j12og: { paint_base: 0x000000, paint_sole: 0x000000, ...trims(0x970009, 0x970009, 0x970009, 0x970009, 0x970009), rim: 0x333333, rim_logo: 0x333333 },
  j12blue: { paint_base: 0xffffff, paint_sole: 0x000000, ...trims(0x284DC1, 0x284DC1, 0x999999, 0x284DC1, 0x284DC1), rim: 0xffffff, rim_logo: 0x284DC1 },
  j12blackwhite: { paint_base: 0xffffff, paint_sole: 0x000000, ...trims(0x333333, 0x333333, 0x333333, 0x333333, 0x333333), rim: 0x333333, rim_logo: 0x333333 },
  j12red: { paint_base: 0xffffff, paint_sole: 0x000000, ...trims(0x970009, 0x970009, 0x970009, 0x970009, 0x970009), rim: 0x333333, rim_logo: 0x970009 },
  j12nubuck: { paint_base: 0x333333, paint_sole: 0x333333, ...trims(0x333333, 0x333333, 0x0081d1, 0x333333, 0x333333), rim: 0x333333, rim_logo: 0x333333 },
  j12eastside: { paint_base: 0xF3CC8F, paint_sole: 0xD36819, ...trims(0xD36819, 0xD36819, 0xF3CC8F, 0xD36819, 0xD36819), rim: 0xF3CC8F, rim_logo: 0xD36819 },
}

// Glass: empty cabin: dark glass. Adjust the tint with { ...DARK_GLASS, color: 0x... }
const GLASS = DARK_GLASS

export function J12({ vehicleData }) {
  return <CarModel car="J12" colorways={COLORWAYS} color={vehicleData.color} motion={vehicleData.motion} glass={GLASS} />;
}
