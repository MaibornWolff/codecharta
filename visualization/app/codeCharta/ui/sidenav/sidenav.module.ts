"use strict";

import "../../ui/ui";
import "../../core/core.module";

import angular from "angular";
import { sidenavComponent, sidenavToggleComponent } from "./sidenav.component";

angular.module("app.codeCharta.ui.sidenav", ["app.codeCharta.ui", "app.codeCharta.core"])
    .component(sidenavComponent.selector, sidenavComponent)
    .component(sidenavToggleComponent.selector, sidenavToggleComponent);



