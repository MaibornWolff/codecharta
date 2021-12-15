import { FileSelectionState } from "../../model/files/files"
import { AppSettings, ColorRange, DynamicSettings, FileSettings, TreeMapSettings } from "../../codeCharta.model"

export interface SuspiciousMetricConfig {
	id: string
	fileChecksum: string
	mapSelectionMode: FileSelectionState
	date: number
	analyzedProgrammingLanguage: string
	suspiciousMetricSuggestionLinks: MetricSuggestionParameters[]
	unsuspiciousMetrics: string[]
	riskProfile: {
		lowRisk: number
		moderateRisk: number
		highRisk: number
		veryHighRisk: number
	}
	stateSettings: {
		appSettings: AppSettings
		dynamicSettings: DynamicSettings
		fileSettings: FileSettings
		treeMap: TreeMapSettings
	}
	isHighRiskFilesModeEnabled: boolean
}

export interface MetricSuggestionParameters {
	metric: string
	from: number
	to: number
	generalSuspiciousMetricConfigId: string
	outlierSuspiciousMetricConfigId?: string
}

export interface MetricValues {
	[metric: string]: number[]
}

export interface MetricAssessmentResults {
	suspiciousMetrics: Map<string, ColorRange>
	unsuspiciousMetrics: string[]
	outliersThresholds: Map<string, number>
}
