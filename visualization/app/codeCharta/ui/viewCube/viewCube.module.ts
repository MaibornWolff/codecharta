import angular from "angular";
import "../codeMap/threeViewer/threeViewer";
import { viewCubeComponent } from "./viewCube.component";
import { ViewCubeMouseEventsService } from "./viewCube.mouseEvents.service";

angular
    .module("app.codeCharta.ui.viewCube", [
        "app.codeCharta.ui.codeMap.threeViewer"
    ])
    .component(viewCubeComponent.selector, viewCubeComponent)
    .service("viewCubeMouseEventsService", ViewCubeMouseEventsService);
