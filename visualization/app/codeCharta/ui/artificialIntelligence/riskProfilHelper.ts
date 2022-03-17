import { BlacklistItem, BlacklistType, CodeMapNode } from "../../codeCharta.model"
import { metricThresholdsByLanguage, Percentiles } from "./artificialIntelligence.metricThresholds"
import { isPathBlacklisted } from "../../util/codeMapHelper"
import percentRound from "percent-round"

export interface RiskProfile {
	lowRisk: number
	moderateRisk: number
	highRisk: number
	veryHighRisk: number
}

const HEIGHT_METRIC = "mcc"
export const AREA_METRIC = "rloc"
const EXCLUDED_FILE_EXTENSION = new Set(["html", "sass", "css", "scss", "txt", "md", "json", undefined])

export function calculateRiskProfile(node: CodeMapNode, totalRloc: number, rlocRisk: RiskProfile, fileExtension: string) {
	const languageSpecificThresholds = getAssociatedMetricThresholds(fileExtension)
	const thresholds = languageSpecificThresholds[HEIGHT_METRIC]
	const nodeMetricValue = node.attributes[HEIGHT_METRIC]
	const nodeRlocValue = node.attributes[AREA_METRIC]
	totalRloc += nodeRlocValue

	// Idea: We could calculate risk profiles per directory in the future.
	calculateRlocRisk(nodeMetricValue, thresholds, nodeRlocValue, rlocRisk)

	return totalRloc
}

export function getAssociatedMetricThresholds(programmingLanguage: string) {
	return programmingLanguage === "java" ? metricThresholdsByLanguage.java : metricThresholdsByLanguage.miscellaneous
}

export function calculateRlocRisk(nodeMetricValue: number, thresholds: Percentiles, nodeRlocValue: number, rlocRisk: RiskProfile) {
	if (nodeMetricValue <= thresholds.percentile70) {
		return (rlocRisk.lowRisk += nodeRlocValue)
	}
	if (nodeMetricValue <= thresholds.percentile80) {
		return (rlocRisk.moderateRisk += nodeRlocValue)
	}
	if (nodeMetricValue <= thresholds.percentile90) {
		return (rlocRisk.highRisk += nodeRlocValue)
	}
	return (rlocRisk.veryHighRisk += nodeRlocValue)
}

export function isFileValid(node: CodeMapNode, fileExtension: string, blacklist: BlacklistItem[]) {
	return (
		!isPathBlacklisted(node.path, blacklist, BlacklistType.exclude) &&
		node.attributes[HEIGHT_METRIC] !== undefined &&
		node.attributes[AREA_METRIC] !== undefined &&
		!EXCLUDED_FILE_EXTENSION.has(fileExtension)
	)
}

export function setRiskProfile(rlocRisk: RiskProfile) {
	const [lowRisk, moderateRisk, highRisk, veryHighRisk] = percentRound([
		rlocRisk.lowRisk,
		rlocRisk.moderateRisk,
		rlocRisk.highRisk,
		rlocRisk.veryHighRisk
	])

	return { lowRisk, moderateRisk, highRisk, veryHighRisk }
}
