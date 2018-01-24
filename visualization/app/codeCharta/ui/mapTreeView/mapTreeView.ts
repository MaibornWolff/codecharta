import angular from "angular";
import "../../core/core.module";

import {mapTreeViewComponent} from "./mapTreeViewComponent";

angular.module("app.codeCharta.ui.mapTreeView",["app.codeCharta.core"]);

angular.module("app.codeCharta.ui.mapTreeView").component(
    mapTreeViewComponent.selector, mapTreeViewComponent
);