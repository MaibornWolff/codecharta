import "../../state/state.module"
import angular from "angular"
import { edgeChooserComponent } from "./edgeChooser.component"

angular.module("app.codeCharta.ui.edgeChooser", ["app.codeCharta.state"]).component(edgeChooserComponent.selector, edgeChooserComponent)
