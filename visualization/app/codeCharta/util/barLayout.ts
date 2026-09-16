export const BAR_GAP_PX = 12

export const DEFAULT_BOTTOM_BAR_HEIGHT_PX = 32
export const DEFAULT_FILE_EXTENSION_BAR_HEIGHT_PX = 17

export const BOTTOM_BAR_HEIGHT_CSS_VARIABLE = "--cc-bottom-bar-height"
export const FILE_EXTENSION_BAR_HEIGHT_CSS_VARIABLE = "--cc-file-extension-bar-height"
export const METRICS_BAR_HEIGHT_CSS_VARIABLE = "--cc-metrics-bar-height"

/**
 * How much of the viewport's bottom edge the floating bars cover, in CSS pixels. The bars publish
 * their measured heights as CSS variables, so this is read from an element inside the view they
 * belong to rather than from a layout the caller would have to duplicate.
 */
export function bottomBarsInsetInPixels(elementInsideView: HTMLElement): number {
    const style = getComputedStyle(elementInsideView)
    const readVariable = (cssVariable: string, fallback: number) => {
        const value = Number.parseFloat(style.getPropertyValue(cssVariable))
        return Number.isNaN(value) ? fallback : value
    }

    const barsAlwaysPresent =
        readVariable(BOTTOM_BAR_HEIGHT_CSS_VARIABLE, DEFAULT_BOTTOM_BAR_HEIGHT_PX) +
        readVariable(FILE_EXTENSION_BAR_HEIGHT_CSS_VARIABLE, DEFAULT_FILE_EXTENSION_BAR_HEIGHT_PX)
    const metricsBarHeight = readVariable(METRICS_BAR_HEIGHT_CSS_VARIABLE, 0)

    return metricsBarHeight > 0 ? barsAlwaysPresent + BAR_GAP_PX + metricsBarHeight : barsAlwaysPresent
}
