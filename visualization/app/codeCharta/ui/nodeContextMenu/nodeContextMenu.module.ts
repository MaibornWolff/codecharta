import "../../state/state.module";
import "../../ui/ui";

import angular from "angular";

import {nodeContextMenuComponent} from "./nodeContextMenu.component";

angular.module("app.codeCharta.ui.nodeContextMenu", ["app.codeCharta.state", "app.codeCharta.ui"])
    .component(nodeContextMenuComponent.selector, nodeContextMenuComponent);


