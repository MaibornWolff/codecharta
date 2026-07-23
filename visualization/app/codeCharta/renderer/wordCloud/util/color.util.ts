import { Color } from "three"
import { ColorConverter } from "../../../util/color/colorConverter"

export type WordCloudColorPair = [string, string]

const DEFAULT_START_COLOR = "#e6007e"
const DEFAULT_END_COLOR = "#0030ff"
const START_COLOR_VARIABLE = "--wordCloudColorStart"
const END_COLOR_VARIABLE = "--wordCloudColorEnd"

const FULL_HEX_COLOR = /^#[0-9A-Fa-f]{6}$/

export function getWordCloudColors(): WordCloudColorPair {
    if (typeof document === "undefined" || typeof getComputedStyle === "undefined") {
        return [DEFAULT_START_COLOR, DEFAULT_END_COLOR]
    }
    const style = getComputedStyle(document.documentElement)
    return [
        readHexOverride(style, START_COLOR_VARIABLE, DEFAULT_START_COLOR),
        readHexOverride(style, END_COLOR_VARIABLE, DEFAULT_END_COLOR)
    ]
}

function readHexOverride(style: CSSStyleDeclaration, variable: string, fallback: string): string {
    const value = style.getPropertyValue(variable).trim()
    return toFullHexOrFallback(value, fallback)
}

function toFullHexOrFallback(value: string, fallback: string): string {
    return FULL_HEX_COLOR.test(value) ? value : fallback
}

export function interpolateColor(startColor: string, endColor: string, factor: number): string {
    const clampedFactor = Math.min(1, Math.max(0, factor))
    const start = ColorConverter.convertHexToColorObject(toFullHexOrFallback(startColor, DEFAULT_START_COLOR))
    const end = ColorConverter.convertHexToColorObject(toFullHexOrFallback(endColor, DEFAULT_END_COLOR))
    return ColorConverter.convertColorToHex(new Color().lerpColors(start, end, clampedFactor))
}
