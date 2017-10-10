import {ThreeViewerService} from "./threeViewerService.ts";
import {ThreeSceneService} from "./threeSceneService.ts";
import {ThreeCameraService} from "./threeCameraService.ts";
import {ThreeOrbitControlsService} from "./threeOrbitControlsService.ts";
import {ThreeRendererService} from "./threeRendererService.ts";
import {ThreeUpdateCycleService} from "./threeUpdateCycleService.ts";
import "../../core/settings/settings.ts";

import angular from "angular";

angular.module("app.codeCharta.codeMap.threeViewer", ["app.codeCharta.core.settings"])
    .service(
        ThreeViewerService.SELECTOR,
        ThreeViewerService
    )
    .service(
        ThreeUpdateCycleService.SELECTOR,
        ThreeUpdateCycleService
    )
    .service(
        ThreeSceneService.SELECTOR,
        ThreeSceneService
    )
    .service(
        ThreeRendererService.SELECTOR,
        ThreeRendererService
    )
    .service(
        ThreeOrbitControlsService.SELECTOR,
        ThreeOrbitControlsService
    )
    .service(
        ThreeCameraService.SELECTOR,
        ThreeCameraService
    );


