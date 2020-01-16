import "../../state/state.module"
import angular from "angular"
import { nodeOnlyComponent } from "./nodeOnly.component"

angular.module("app.codeCharta.ui.nodeOnly", ["app.codeCharta.state"]).component(nodeOnlyComponent.selector, nodeOnlyComponent)
