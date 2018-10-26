import "../../core/core.module";

import angular from "angular";

import {weblinksPanelComponent} from "./weblinksPanel.component";

angular.module("app.codeCharta.ui.weblinksPanel", ["app.codeCharta.core"])
    .component(weblinksPanelComponent.selector, weblinksPanelComponent);


