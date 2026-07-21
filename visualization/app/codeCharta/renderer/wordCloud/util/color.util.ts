/**
 * Word-cloud colors. Each word is painted a gradient stop between the two domain-language brand colors,
 * so the cloud reads as one coherent palette without encoding a metric in hue.
 */

import { Color } from "three"
import { ColorConverter } from "../../../util/color/colorConverter"

/** A hex color pair [start, end] the per-word gradient interpolates between. */
export type WordCloudColorPair = [string, string]

// The domain-language brand endpoints, mirrored from the `--wordCloudColorStart` / `--wordCloudColorEnd`
// custom properties in app/tailwind.css. They are duplicated here only so non-DOM contexts (unit tests,
// SSR) still get brand colors; the document values win whenever there is a document to read.
const DEFAULT_START_COLOR = "#e6007e"
const DEFAULT_END_COLOR = "#0030ff"
const START_COLOR_VARIABLE = "--wordCloudColorStart"
const END_COLOR_VARIABLE = "--wordCloudColorEnd"

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/

/** The word-cloud gradient endpoints, read from the CSS custom properties when a document exists. */
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
    return HEX_COLOR.test(value) ? value : fallback
}

/**
 * Linearly interpolates between two hex colors in RGB space. `factor` is clamped to [0, 1]; 0 yields
 * `startColor`, 1 yields `endColor`.
 */
export function interpolateColor(startColor: string, endColor: string, factor: number): string {
    const clampedFactor = Math.min(1, Math.max(0, factor))
    // The guard keeps the deliberate fallback for anything that is not a full #rrggbb value — an unset
    // or shorthand CSS custom property must not reach the converter, which does not handle those.
    const start = ColorConverter.convertHexToColorObject(HEX_COLOR.test(startColor) ? startColor : DEFAULT_START_COLOR)
    const end = ColorConverter.convertHexToColorObject(HEX_COLOR.test(endColor) ? endColor : DEFAULT_END_COLOR)
    return ColorConverter.convertColorToHex(new Color().lerpColors(start, end, clampedFactor))
}
