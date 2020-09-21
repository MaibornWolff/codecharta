import { Action } from "redux"
import { BlacklistItem, NodeMetricData } from "../../../../codeCharta.model"
import { FileState } from "../../../../model/files/files"

export enum NodeMetricDataActions {
	SET_NODE_METRIC_DATA = "SET_NODE_METRIC_DATA",
	CALCULATE_NEW_NODE_METRIC_DATA = "CALCULATE_NEW_NODE_METRIC_DATA"
}

export interface SetNodeMetricDataAction extends Action {
	type: NodeMetricDataActions.SET_NODE_METRIC_DATA
	payload: NodeMetricData[]
}

export interface CalculateNewNodeMetricDataAction extends Action {
	type: NodeMetricDataActions.CALCULATE_NEW_NODE_METRIC_DATA
	payload: { fileStates: FileState[]; blacklist: BlacklistItem[] }
}

export type NodeMetricDataAction = SetNodeMetricDataAction | CalculateNewNodeMetricDataAction

export function setNodeMetricData(nodeMetricData: NodeMetricData[] = defaultNodeMetricData): SetNodeMetricDataAction {
	return {
		type: NodeMetricDataActions.SET_NODE_METRIC_DATA,
		payload: nodeMetricData
	}
}

export function calculateNewNodeMetricData(fileStates: FileState[], blacklist: BlacklistItem[]): CalculateNewNodeMetricDataAction {
	return {
		type: NodeMetricDataActions.CALCULATE_NEW_NODE_METRIC_DATA,
		payload: { fileStates, blacklist }
	}
}

export const defaultNodeMetricData: NodeMetricData[] = []
