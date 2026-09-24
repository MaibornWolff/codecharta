import { escapeHtml } from "../../../util/escapeHtml"
import { describeRadialFolderValue } from "../../../util/radialFolderValues"
import { RadialFolderColoring } from "./radialColor"
import { RadialMetrics, RadialNode } from "./radialTree"

const numberFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 2 })

interface RadialTooltipDatum {
    name: string
    value: number
    colorValue: number | undefined
    folderValueText?: string
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
        if (data.folderValueText) {
            rows.push(escapeHtml(data.folderValueText))
        }
        if (data.isCentre && !isMapRoot) {
            rows.push("<i>Click to go up one folder</i>")
        }
        return rows.join("<br/>")
    }
}

export function folderValueText({ path, isFile }: Pick<RadialNode, "path" | "isFile">, folders: RadialFolderColoring): string | undefined {
    const folderValue = isFile ? undefined : folders.values.get(path)
    if (folderValue === undefined) {
        return undefined
    }
    return `${describeRadialFolderValue(folders.value).label} ${numberFormatter.format(folderValue)}`
}
