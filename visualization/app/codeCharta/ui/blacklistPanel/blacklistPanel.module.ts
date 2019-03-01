import "../rangeSlider/rangeSlider";
import "../../core/core.module";

import angular from "angular";

import {blacklistPanelComponent} from "./blacklistPanel.component";

angular.module("app.codeCharta.ui.blacklistPanel", ["app.codeCharta.core"])
    .component("blacklistPanelComponent", blacklistPanelComponent);


