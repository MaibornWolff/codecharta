import {ThreeViewerService} from "./threeViewerService";
import {ThreeSceneService} from "./threeSceneService";
import {ThreeCameraService} from "./threeCameraService";
import {ThreeOrbitControlsService} from "./threeOrbitControlsService";
import {ThreeRendererService} from "./threeRendererService";
import {ThreeUpdateCycleService} from "./threeUpdateCycleService";
import "../../../state/state.module";

import angular from "angular";

angular.module("app.codeCharta.ui.codeMap.threeViewer", ["app.codeCharta.state"])
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


