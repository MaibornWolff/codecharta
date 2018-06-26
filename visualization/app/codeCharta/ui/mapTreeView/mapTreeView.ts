import angular from "angular";
import "../../core/core.module";
import "../codeMap/threeViewer/threeViewer";

import "./mapTreeView.css";

import {mapTreeViewComponent, MapTreeViewController} from "./mapTreeViewComponent";
import {mapTreeViewLevelComponent} from "./mapTreeViewLevelComponent";

angular.module("app.codeCharta.ui.mapTreeView", ["app.codeCharta.core", "app.codeCharta.ui.codeMap.threeViewer"])
    .component(
        mapTreeViewComponent.selector, mapTreeViewComponent
    ).component(
        mapTreeViewLevelComponent.selector, mapTreeViewLevelComponent
    );