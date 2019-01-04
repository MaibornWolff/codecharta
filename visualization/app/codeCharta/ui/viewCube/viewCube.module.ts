import angular from "angular";

import {viewCubeComponent} from "./viewCube.component";

angular.module("app.codeCharta.ui.viewCube", [])
    .component(viewCubeComponent.selector, viewCubeComponent);


