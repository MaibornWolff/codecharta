import "./toolBar.component.scss"

import { Component, Inject } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { hoveredNodeIdSelector } from "../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { experimentalFeaturesEnabledSelector } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.selector"

@Component({
	selector: "cc-tool-bar",
	template: require("./toolBar.component.html")
})
export class ToolBarComponent {
	hoveredNodeId$ = this.store.select(hoveredNodeIdSelector)
	experimentalFeaturesEnabled$ = this.store.select(experimentalFeaturesEnabledSelector)

	constructor(@Inject(Store) private store: Store) {}
}
