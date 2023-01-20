import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core"
import { Store } from "../../state/angular-redux/store"
import { experimentalFeaturesEnabledSelector } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.selector"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { edgeMetricDataSelector } from "../../state/selectors/accumulatedData/metricData/edgeMetricData.selector"
import { map } from "rxjs"

type PanelSelection = "NONE" | "AREA_PANEL_OPEN" | "HEIGHT_PANEL_OPEN" | "COLOR_PANEL_OPEN" | "EDGE_PANEL_OPEN"

@Component({
	selector: "cc-ribbon-bar",
	templateUrl: "./ribbonBar.component.html",
	styleUrls: ["./ribbonBar.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class RibbonBarComponent implements OnInit, OnDestroy {
	panelSelection: PanelSelection = "NONE"
	experimentalFeaturesEnabled$ = this.store.select(experimentalFeaturesEnabledSelector)
	isDeltaState$ = this.store.select(isDeltaStateSelector)
	hasEdgeMetric$ = this.store.select(edgeMetricDataSelector).pipe(map(edgeMetricData => edgeMetricData.length > 0))
	constructor(@Inject(Store) private store: Store) {}

	ngOnInit(): void {
		document.addEventListener("mousedown", this.closePanelSelectionOnOutsideClick)
	}

	ngOnDestroy(): void {
		document.removeEventListener("mousedown", this.closePanelSelectionOnOutsideClick)
	}

	updatePanelSelection(panelSelection: PanelSelection) {
		this.panelSelection = this.panelSelection === panelSelection ? "NONE" : panelSelection
	}

	private closePanelSelectionOnOutsideClick = (event: MouseEvent) => {
		if (this.panelSelection !== "NONE" && this.isOutside(event)) {
			this.panelSelection = "NONE"
		}
	}

	private panelSelectionComponents = [
		"CC-AREA-SETTINGS-PANEL",
		"CC-HEIGHT-SETTINGS-PANEL",
		"CC-COLOR-SETTINGS-PANEL",
		"CC-EDGE-SETTINGS-PANEL",
		"COLOR-CHROME"
	]
	private panelSectionTogglerTitles = [
		"Show area metric settings",
		"Show height metric settings",
		"Show color metric settings",
		"Show edge metric settings"
	]
	private isOutside(event: MouseEvent) {
		return event
			.composedPath()
			.every(
				element =>
					!this.panelSelectionComponents.includes(element["nodeName"]) &&
					!this.panelSectionTogglerTitles.includes(element["title"]) &&
					element["id"] !== "codemap-context-menu"
			)
	}
}
