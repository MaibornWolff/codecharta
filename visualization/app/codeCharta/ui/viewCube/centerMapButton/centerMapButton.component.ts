import "./centerMapButton.component.scss"
import { Component, Inject } from "@angular/core"
import { ThreeOrbitControlsServiceToken } from "../../../services/ajs-upgraded-providers"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControlsService"

@Component({
	selector: "cc-center-map-button",
	template: require("./centerMapButton.component.html")
})
export class CenterMapButtonComponent {
	constructor(@Inject(ThreeOrbitControlsServiceToken) private threeOrbitControlsService: ThreeOrbitControlsService) {}

	centerMap() {
		this.threeOrbitControlsService.autoFitTo()
	}
}
