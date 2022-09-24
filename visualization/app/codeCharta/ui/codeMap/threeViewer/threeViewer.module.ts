import { ThreeViewerService } from "./threeViewerService"
import { ThreeSceneService } from "./threeSceneService"
import { ThreeCameraService } from "./threeCameraService"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { ThreeRendererService } from "./threeRendererService"
import { ThreeStatsService } from "./threeStatsService"
import "../../../state/state.module"
import camelCase from "lodash.camelcase"

import angular from "angular"
import { downgradeInjectable } from "@angular/upgrade/static"
import { IdToBuildingService } from "../../../services/idToBuilding/idToBuilding.service"

angular
	.module("app.codeCharta.ui.codeMap.threeViewer", ["app.codeCharta.state"])
	.service(camelCase(ThreeViewerService.name), ThreeViewerService)
	.service(camelCase(ThreeSceneService.name), ThreeSceneService)
	.service(camelCase(ThreeRendererService.name), ThreeRendererService)
	.service(camelCase(ThreeOrbitControlsService.name), ThreeOrbitControlsService)
	.service(camelCase(ThreeCameraService.name), ThreeCameraService)
	.service(camelCase(ThreeStatsService.name), ThreeStatsService)
	.factory("idToBuilding", downgradeInjectable(IdToBuildingService))
