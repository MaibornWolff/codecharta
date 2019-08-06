import "./edgePanel.component.scss"
import { MetricData } from "../../codeCharta.model"

export class EdgePanelController {
	private m1 = {
		name: "foo",
		maxValue: 12,
		availableInVisibleMaps: true
	} as MetricData

	private m2 = {
		name: "null",
		maxValue: 13,
		availableInVisibleMaps: true
	} as MetricData

	private _viewModel: {
		metricData: MetricData[]
		edgeMetric: string
	} = {
		metricData: [this.m1, this.m2],
		edgeMetric: "null"
	}
}

export const edgePanelComponent = {
	selector: "edgePanelComponent",
	template: require("./edgePanel.component.html"),
	controller: EdgePanelController
}
