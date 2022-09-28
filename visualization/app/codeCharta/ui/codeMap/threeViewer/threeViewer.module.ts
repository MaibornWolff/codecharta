import { ThreeViewerService } from "./threeViewerService"
import { ThreeSceneService } from "./threeSceneService"
import { ThreeCameraService } from "./threeCamera.service"
import { ThreeOrbitControlsService } from "./threeOrbitControlsService"
import { ThreeStatsService } from "./threeStats.service"
import "../../../state/state.module"
import camelCase from "lodash.camelcase"

import angular from "angular"
import { downgradeInjectable } from "@angular/upgrade/static"
import { IdToBuildingService } from "../../../services/idToBuilding/idToBuilding.service"
import { ThreeRendererService } from "./threeRenderer.service"

angular
	.module("app.codeCharta.ui.codeMap.threeViewer", ["app.codeCharta.state"])
	.service(camelCase(ThreeViewerService.name), ThreeViewerService)
	.service(camelCase(ThreeSceneService.name), ThreeSceneService)
	.service(camelCase(ThreeOrbitControlsService.name), ThreeOrbitControlsService)
	.service(camelCase(ThreeCameraService.name), ThreeCameraService)
	.factory("threeStatsService", downgradeInjectable(ThreeStatsService))
	.factory("idToBuilding", downgradeInjectable(IdToBuildingService))
	.factory("threeRendererService", downgradeInjectable(ThreeRendererService))
