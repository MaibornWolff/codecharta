import { CodeMapNode } from "../../../../../codeCharta.model"
import percentRound from "percent-round"
import { getAssociatedMetricThresholds } from "./getMetricThresholds"

export interface RiskProfile {
    lowRisk: number
    moderateRisk: number
    highRisk: number
    veryHighRisk: number
}

export const HEIGHT_METRICS = ["complexity", "sonar_complexity", "mcc"]
export const AREA_METRIC = "rloc"
export const EXCLUDED_FILE_EXTENSION = new Set(["html", "sass", "css", "scss", "txt", "md", "json", undefined])

export function aggregateRiskProfile(node: CodeMapNode, rlocRisk: RiskProfile, fileExtension: string) {
    const riskMetric = HEIGHT_METRICS.find(metric => node.attributes[metric] !== undefined)
    const languageSpecificThresholds = getAssociatedMetricThresholds(fileExtension)
    const thresholds = languageSpecificThresholds[riskMetric]
    const nodeMetricValue = node.attributes[riskMetric]
    const nodeRlocValue = node.attributes[AREA_METRIC]

    if (nodeMetricValue <= thresholds.percentile70) {
        rlocRisk.lowRisk += nodeRlocValue
    } else if (nodeMetricValue <= thresholds.percentile80) {
        rlocRisk.moderateRisk += nodeRlocValue
    } else if (nodeMetricValue <= thresholds.percentile90) {
        rlocRisk.highRisk += nodeRlocValue
    } else {
        rlocRisk.veryHighRisk += nodeRlocValue
    }
}

export function getPercentagesOfRiskProfile(rlocRisk: RiskProfile): RiskProfile {
    const [lowRisk, moderateRisk, highRisk, veryHighRisk] = percentRound([
        rlocRisk.lowRisk,
        rlocRisk.moderateRisk,
        rlocRisk.highRisk,
        rlocRisk.veryHighRisk
    ])

    return { lowRisk, moderateRisk, highRisk, veryHighRisk }
}
