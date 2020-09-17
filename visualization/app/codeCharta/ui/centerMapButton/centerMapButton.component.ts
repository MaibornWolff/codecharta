import "./centerMapButton.component.scss"
import { CameraChangeSubscriber, ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { PerspectiveCamera } from "three"
import { IRootScopeService } from "angular"

export class CenterMapButtonController implements CameraChangeSubscriber {
	private _viewModel: {
		isMapCentered: boolean
	} = {
		isMapCentered: true
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private threeOrbitControlsService: ThreeOrbitControlsService) {
		ThreeOrbitControlsService.subscribe(this.$rootScope, this)
	}

	onCameraChanged(camera: PerspectiveCamera) {
		this._viewModel.isMapCentered = this.isMapCentered(camera)
	}

	fitMapToView() {
		this.threeOrbitControlsService.autoFitTo()
	}

	private isMapCentered(camera: PerspectiveCamera) {
		return camera.position.clone().floor().equals(this.threeOrbitControlsService.defaultCameraPosition.clone().floor())
	}
}

export const centerMapButtonComponent = {
	selector: "centerMapButtonComponent",
	template: require("./centerMapButton.component.html"),
	controller: CenterMapButtonController
}
