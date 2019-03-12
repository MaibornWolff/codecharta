import angular from "angular";
import {ribbonBarComponent} from "./ribbonBar.component";
import "../../state/state.module";
import "../../ui/colorSettingsPanel/colorSettingsPanel";

angular.module(
    "app.codeCharta.ui.ribbonBar",
    ["app.codeCharta.state"]
);

angular.module("app.codeCharta.ui.ribbonBar").component(
    ribbonBarComponent.selector, ribbonBarComponent
);

