import { ThreeViewerService } from "./threeViewerService"
import { ThreeSceneService } from "./threeSceneService"
import { ThreeCameraService } from "./threeCameraService"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { ThreeRendererService } from "./threeRendererService"
import { ThreeUpdateCycleService } from "./threeUpdateCycleService"
import "../../../state/state.module"
import camelCase from "lodash.camelcase"

import angular from "angular"

angular
	.module("app.codeCharta.ui.codeMap.threeViewer", ["app.codeCharta.state"])
	.service(camelCase(ThreeViewerService.name), ThreeViewerService)
	.service(camelCase(ThreeUpdateCycleService.name), ThreeUpdateCycleService)
	.service(camelCase(ThreeSceneService.name), ThreeSceneService)
	.service(camelCase(ThreeRendererService.name), ThreeRendererService)
	.service(camelCase(ThreeOrbitControlsService.name), ThreeOrbitControlsService)
	.service(camelCase(ThreeCameraService.name), ThreeCameraService)
