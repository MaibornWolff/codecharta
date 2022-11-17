import "./centerMapButton.component.scss"
import { Component, Inject } from "@angular/core"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControls.service"

@Component({
	selector: "cc-center-map-button",
	template: require("./centerMapButton.component.html")
})
export class CenterMapButtonComponent {
	constructor(@Inject(ThreeOrbitControlsService) private threeOrbitControlsService: ThreeOrbitControlsService) {}

	centerMap() {
		this.threeOrbitControlsService.autoFitTo()
	}
}
