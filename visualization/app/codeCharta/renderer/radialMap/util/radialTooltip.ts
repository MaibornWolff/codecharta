import { escapeHtml } from "../../../util/escapeHtml"
import { numberFormatter, RadialDatum } from "./radialDatum"
import { RadialMetrics } from "./radialTree"

type RadialTooltipDatum = Pick<RadialDatum, "name" | "value" | "colorValue" | "folderValueText" | "isCentre">

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
        if (data.folderValueText) {
            rows.push(escapeHtml(data.folderValueText))
        }
        if (data.isCentre && !isMapRoot) {
            rows.push("<i>Click to go up one folder</i>")
        }
        return rows.join("<br/>")
    }
}
