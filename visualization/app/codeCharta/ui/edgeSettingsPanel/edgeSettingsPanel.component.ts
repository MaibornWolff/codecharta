import "./edgeSettingsPanel.component.scss"

export class EdgeSettingsPanelController {
	private _viewModel: {
		amountOfEdgePreviews: number
		totalAmountOfEdges: number
	} = {
		amountOfEdgePreviews: 0,
		totalAmountOfEdges: 0
	}

	/* @ngInject */
	constructor() {}
}

export const edgeSettingsPanelComponent = {
	selector: "edgeSettingsPanelComponent",
	template: require("./edgeSettingsPanel.component.html"),
	controller: EdgeSettingsPanelController
}
