import { Color } from "three"
import { MapColors, RadialFolderStyle, RadialFolderValue } from "../model/codeCharta.model"
import { ColorConverter } from "./color/colorConverter"

export const SHARE_BY_SIZE_RED_AT = 3
export const SHARE_OF_RED_RED_AT = 0.5
const SHARE_OF_RED_RED_AT_PERCENT = SHARE_OF_RED_RED_AT * 100
export const NEUTRAL_FOLDER_COLOR = "#d9dce1"
const WHITE = "#ffffff"

export enum RadialFolderScale {
    FileThresholds = "fileThresholds",
    OwnScale = "ownScale"
}

export interface RadialFolderValueDescriptor {
    value: RadialFolderValue
    label: string
    description: string
    legend: string
    scale: RadialFolderScale
}

export const RADIAL_FOLDER_VALUES: readonly RadialFolderValueDescriptor[] = [
    {
        value: RadialFolderValue.Sum,
        label: "sum",
        description: "All files added up. Big folders turn red.",
        legend: "sum of their files",
        scale: RadialFolderScale.FileThresholds
    },
    {
        value: RadialFolderValue.Max,
        label: "max",
        description: "Its worst file. Never hides a hotspot.",
        legend: "their worst file",
        scale: RadialFolderScale.FileThresholds
    },
    {
        value: RadialFolderValue.Median,
        label: "median",
        description: "Its middle file. Shows the typical file.",
        legend: "their middle file",
        scale: RadialFolderScale.FileThresholds
    },
    {
        value: RadialFolderValue.MeanPerFile,
        label: "mean / file",
        description: "Sum divided by the number of files.",
        legend: "mean per file",
        scale: RadialFolderScale.FileThresholds
    },
    {
        value: RadialFolderValue.AvgPerLine,
        label: "avg / line",
        description: "Weighted by lines, so it matches the area.",
        legend: "avg / line of their files",
        scale: RadialFolderScale.FileThresholds
    },
    {
        value: RadialFolderValue.ShareBySize,
        label: "share ÷ size",
        description: `Share of the metric ÷ share of the lines. ${SHARE_BY_SIZE_RED_AT}× and up is red.`,
        legend: `share ÷ size (1× – ${SHARE_BY_SIZE_RED_AT}×)`,
        scale: RadialFolderScale.OwnScale
    },
    {
        value: RadialFolderValue.ShareOfRed,
        label: "share of red",
        description: `Lines in red files. ${SHARE_OF_RED_RED_AT_PERCENT} % and up is red.`,
        legend: `share of lines in red files (0 – ${SHARE_OF_RED_RED_AT_PERCENT} %)`,
        scale: RadialFolderScale.OwnScale
    }
]

export function describeRadialFolderValue(value: RadialFolderValue): RadialFolderValueDescriptor {
    return RADIAL_FOLDER_VALUES.find(descriptor => descriptor.value === value) ?? RADIAL_FOLDER_VALUES[0]
}

export function tintColor(color: string, tint: number): string {
    return mixColors(color, WHITE, 1 - tint)
}

export function mixColors(fromHex: string, toHex: string, fraction: number): string {
    const from = ColorConverter.convertHexToColorObject(fromHex)
    const to = ColorConverter.convertHexToColorObject(toHex)
    return ColorConverter.convertColorToHex(new Color().lerpColors(from, to, fraction))
}

/** A CSS background showing how folders look: the tinted traffic light, or the one neutral grey. */
export function folderSwatchBackground(mapColors: MapColors, style: RadialFolderStyle, tint: number): string {
    if (style === RadialFolderStyle.Neutral) {
        return NEUTRAL_FOLDER_COLOR
    }
    const stops = [mapColors.positive, mapColors.neutral, mapColors.negative].map(color => tintColor(color, tint))
    return `linear-gradient(90deg, ${stops.join(", ")})`
}
