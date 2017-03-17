"use strict";

import {ThreeViewerService} from "./threeViewerService.js";
import {ThreeSceneService} from "./threeSceneService.js";
import {ThreeCameraService} from "./threeCameraService.js";
import {ThreeOrbitControlsService} from "./threeOrbitControlsService.js";
import {ThreeRendererService} from "./threeRendererService.js";
import {ThreeUpdateCycleService} from "./threeUpdateCycleService.js";

let id = "app.codeCharta.codeMap.threeViewer";

angular.module(id, []);

angular.module(id).service(
    "threeViewerService",
    ThreeViewerService
);

angular.module(id).service(
    "threeUpdateCycleService",
    ThreeUpdateCycleService
);

angular.module(id).service(
    "threeSceneService",
    ThreeSceneService
);

angular.module(id).service(
    "threeRendererService",
    ThreeRendererService
);

angular.module(id).service(
    "threeOrbitControlsService",
    ThreeOrbitControlsService
);

angular.module(id).service(
    "threeCameraService",
    ThreeCameraService
);


