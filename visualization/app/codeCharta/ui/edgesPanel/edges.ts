import angular from "angular";
import "../../core/core.module";

import "./edges.scss";

import {edgesComponent} from "./edgesComponent";

angular.module("app.codeCharta.ui.edges", ["app.codeCharta.core"])
    .component(
        edgesComponent.selector, edgesComponent
    );