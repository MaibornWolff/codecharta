import angular from "angular";
import "../../core/core.module";

import "./mapTreeView.css";

import {mapTreeViewComponent, MapTreeViewController} from "./mapTreeViewComponent";
import {mapTreeViewLevelComponent} from "./mapTreeViewLevelComponent";

angular.module("app.codeCharta.ui.mapTreeView", ["app.codeCharta.core"])
    .component(
        mapTreeViewComponent.selector, mapTreeViewComponent
    ).component(
        mapTreeViewLevelComponent.selector, mapTreeViewLevelComponent
    );