import { Action } from "redux"
import { BlacklistItem, EdgeMetricData } from "../../../../codeCharta.model"
import { FileState } from "../../../../model/files/files"

export enum EdgeMetricDataActions {
	SET_EDGE_METRIC_DATA = "SET_EDGE_METRIC_DATA",
	CALCULATE_NEW_EDGE_METRIC_DATA = "CALCULATE_NEW_EDGE_METRIC_DATA"
}

export interface SetEdgeMetricDataAction extends Action {
	type: EdgeMetricDataActions.SET_EDGE_METRIC_DATA
	payload: EdgeMetricData[]
}

export interface CalculateNewEdgeMetricDataAction extends Action {
	type: EdgeMetricDataActions.CALCULATE_NEW_EDGE_METRIC_DATA
	payload: { fileStates: FileState[]; blacklist: BlacklistItem[] }
}

export type EdgeMetricDataAction = SetEdgeMetricDataAction | CalculateNewEdgeMetricDataAction

export function setEdgeMetricData(edgeMetricData: EdgeMetricData[] = defaultEdgeMetricData): SetEdgeMetricDataAction {
	return {
		type: EdgeMetricDataActions.SET_EDGE_METRIC_DATA,
		payload: edgeMetricData
	}
}

export function calculateNewEdgeMetricData(fileStates: FileState[], blacklist: BlacklistItem[]): CalculateNewEdgeMetricDataAction {
	return {
		type: EdgeMetricDataActions.CALCULATE_NEW_EDGE_METRIC_DATA,
		payload: { fileStates, blacklist }
	}
}

export const defaultEdgeMetricData: EdgeMetricData[] = []
