import { escapeHtml } from "../../../util/escapeHtml"
import { numberFormatter, RadialDatum } from "./radialDatum"
import { RadialMetrics } from "./radialTree"

type RadialTooltipDatum = Pick<RadialDatum, "name" | "value" | "colorValue" | "folderValueText" | "isCentre">

interface RadialFormatterParams {
    data?: RadialTooltipDatum
}

const GO_UP_HINT = "Click to go up one folder"
const UNFOCUS_AND_GO_UP_HINT = "Click to unfocus and go up one folder"

interface CentrePosition {
    isMapRoot: boolean
    isFocused: boolean
}

export function buildTooltipFormatter(metrics: RadialMetrics, centrePosition: CentrePosition) {
    const centreClickHint = getCentreClickHint(centrePosition)
    return ({ data }: RadialFormatterParams): string => {
        if (!data) {
            return ""
        }
        const rows = [
            `<b>${escapeHtml(data.name)}</b>`,
            `${escapeHtml(metrics.areaMetric)}: ${numberFormatter.format(data.value)}`,
            `${escapeHtml(metrics.colorMetric)}: ${data.colorValue === undefined ? "–" : numberFormatter.format(data.colorValue)}`
        ]
        if (data.folderValueText) {
            rows.push(escapeHtml(data.folderValueText))
        }
        if (data.isCentre && centreClickHint) {
            rows.push(`<i>${centreClickHint}</i>`)
        }
        return rows.join("<br/>")
    }
}

function getCentreClickHint({ isMapRoot, isFocused }: CentrePosition): string | null {
    if (!isMapRoot) {
        return GO_UP_HINT
    }
    return isFocused ? UNFOCUS_AND_GO_UP_HINT : null
}
