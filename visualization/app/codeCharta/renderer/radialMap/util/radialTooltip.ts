import { escapeHtml } from "../../../util/escapeHtml"
import { RadialMetrics } from "./radialTree"

const numberFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 2 })

interface RadialTooltipDatum {
    name: string
    value: number
    colorValue: number | undefined
    isCentre: boolean
}

interface RadialFormatterParams {
    data?: RadialTooltipDatum
}

export function buildTooltipFormatter(metrics: RadialMetrics, isMapRoot: boolean) {
    return ({ data }: RadialFormatterParams): string => {
        if (!data) {
            return ""
        }
        const rows = [
            `<b>${escapeHtml(data.name)}</b>`,
            `${escapeHtml(metrics.areaMetric)}: ${numberFormatter.format(data.value)}`,
            `${escapeHtml(metrics.colorMetric)}: ${data.colorValue === undefined ? "–" : numberFormatter.format(data.colorValue)}`
        ]
        if (data.isCentre && !isMapRoot) {
            rows.push("<i>Click to go up one folder</i>")
        }
        return rows.join("<br/>")
    }
}
