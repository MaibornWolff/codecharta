import { Color } from "three"
import { MapColors, RadialFolderStyle, RadialFolderValue } from "../model/codeCharta.model"
import { ColorConverter } from "./color/colorConverter"

export const NEUTRAL_FOLDER_COLOR = "#d9dce1"
const WHITE = "#ffffff"

export interface RadialFolderValueDescriptor {
    value: RadialFolderValue
    label: string
    description: string
    legend: string
}

export const RADIAL_FOLDER_VALUES: readonly RadialFolderValueDescriptor[] = [
    {
        value: RadialFolderValue.Sum,
        label: "sum",
        description: "All files added up. Big folders turn red.",
        legend: "sum of their files"
    },
    {
        value: RadialFolderValue.Max,
        label: "max",
        description: "Its highest file. Never hides a high value.",
        legend: "their highest file"
    },
    {
        value: RadialFolderValue.Min,
        label: "min",
        description: "Its lowest file. Never hides a low value, e.g. with inverted colors.",
        legend: "their lowest file"
    },
    {
        value: RadialFolderValue.Median,
        label: "median",
        description: "Its middle file. Shows the typical file.",
        legend: "their middle file"
    },
    {
        value: RadialFolderValue.MeanPerFile,
        label: "mean / file",
        description: "Sum divided by the number of files.",
        legend: "mean per file"
    },
    {
        value: RadialFolderValue.AvgPerArea,
        label: "avg / area",
        description: "Weighted by the area metric, so bigger slices count more.",
        legend: "area-weighted avg of their files"
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
