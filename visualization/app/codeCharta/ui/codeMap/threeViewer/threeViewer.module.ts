import { ThreeViewerService } from "./threeViewerService"
import { ThreeSceneService } from "./threeSceneService"
import { ThreeCameraService } from "./threeCameraService"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { ThreeRendererService } from "./threeRendererService"
import { ThreeUpdateCycleService } from "./threeUpdateCycleService"
import "../../../state/state.module"
import _ from "lodash"

import angular from "angular"

angular
	.module("app.codeCharta.ui.codeMap.threeViewer", ["app.codeCharta.state"])
	.service(_.camelCase(ThreeViewerService.name), ThreeViewerService)
	.service(_.camelCase(ThreeUpdateCycleService.name), ThreeUpdateCycleService)
	.service(_.camelCase(ThreeSceneService.name), ThreeSceneService)
	.service(_.camelCase(ThreeRendererService.name), ThreeRendererService)
	.service(_.camelCase(ThreeOrbitControlsService.name), ThreeOrbitControlsService)
	.service(_.camelCase(ThreeCameraService.name), ThreeCameraService)
