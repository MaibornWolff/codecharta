import { AppSettings, ColorRange, DynamicSettings, FileSettings, TreeMapSettings } from "../../codeCharta.model"

export enum SuspiciousMetricConfigMapSelectionMode {
	SINGLE = "SINGLE",
	MULTIPLE = "MULTIPLE",
	DELTA = "DELTA"
}

export interface SuspiciousMetricConfig {
	id: string
	fileChecksum: string
	mapSelectionMode: SuspiciousMetricConfigMapSelectionMode
	date: number
	metricName: string
	colorRange: ColorRange
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
	generalCustomConfigId: string
	outlierCustomConfigId?: string
}

export interface MetricValues {
	[metric: string]: number[]
}

export interface MetricAssessmentResults {
	suspiciousMetrics: Map<string, ColorRange>
	unsuspiciousMetrics: string[]
	outliersThresholds: Map<string, number>
}
