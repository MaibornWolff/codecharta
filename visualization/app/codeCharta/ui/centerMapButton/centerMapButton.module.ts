import "../../state/state.module"
import angular from "angular"
import { centerMapButtonComponent } from "./centerMapButton.component"

angular.module("app.codeCharta.ui.centerMapButton", ["app.codeCharta.state"])
    .component(centerMapButtonComponent.selector, centerMapButtonComponent)


