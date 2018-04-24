import "../../core/core.module";

import angular from "angular";

import {resetSettingsButtonComponent} from "./resetSettingsButton.component";

angular.module("app.codeCharta.ui.resetSettingsButton", ["app.codeCharta.core"])
    .component(resetSettingsButtonComponent.selector, resetSettingsButtonComponent);


