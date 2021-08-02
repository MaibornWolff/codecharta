import { Component, Input } from "@angular/core"
import { connect } from "../../state/angular-redux/connect"
import { selectedBuildingIdSelector } from "../../state/store/lookUp/selectedBuildingId/selectedBuildingId.selector"
import { CcState } from "../../state/store/store"

const ConnectedClass = connect((state: CcState, that: { attributeKey: string }) => {
	if (that.attributeKey === undefined) return { deltaValue: undefined, color: "" }

	const selectedBuildingId = selectedBuildingIdSelector(state)
	const selectedBuildingNode = state.lookUp.idToBuilding.get(selectedBuildingId)
	const deltaValue = selectedBuildingNode?.node.deltas?.[that.attributeKey]

	const mapColors = state.appSettings.mapColors
	const color = deltaValue > 0 ? mapColors.positiveDelta : mapColors.negativeDelta

	return { deltaValue, color }
})

@Component({
	selector: "cc-metric-delta-selected",
	template: require("./metricDeltaSelected.component.html")
})
export class MetricDeltaSelectedComponent extends ConnectedClass {
	// @ts-ignore - used within connect
	@Input() private attributeKey
}
