import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { hoveredNodeIdSelector } from "../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { experimentalFeaturesEnabledSelector } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.selector"

@Component({
	selector: "cc-tool-bar",
	templateUrl: "./toolBar.component.html",
	styleUrls: ["./toolBar.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class ToolBarComponent {
	hoveredNodeId$ = this.store.select(hoveredNodeIdSelector)
	experimentalFeaturesEnabled$ = this.store.select(experimentalFeaturesEnabledSelector)

	constructor(private store: Store) {}
}
