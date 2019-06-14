import angular from "angular"
import "../../state/state.module"
import { revisionChooserFileDropDownComponent } from "./revisionChooser.component"

angular.module("app.codeCharta.ui.revisionChooser", ["app.codeCharta.state"])

angular
	.module("app.codeCharta.ui.revisionChooser")
	.component(revisionChooserFileDropDownComponent.selector, revisionChooserFileDropDownComponent)
