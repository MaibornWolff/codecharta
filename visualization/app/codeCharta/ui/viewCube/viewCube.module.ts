import angular from "angular";
import "../codeMap/threeViewer/threeViewer";
import { viewCubeComponent } from "./viewCube.component";
import { ViewCubeMouseEventsService } from "./viewCube.mouseEvents.service";

// Dependency
angular
    .module("app.codeCharta.ui.viewCube", [])
    .component(viewCubeComponent.selector, viewCubeComponent)
    .service("viewCubeMouseEventsService", ViewCubeMouseEventsService);
