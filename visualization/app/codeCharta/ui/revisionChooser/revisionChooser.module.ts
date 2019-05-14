import angular from "angular"
import "../../state/state.module"
import { revisionChooserComponent, revisionChooserFileDropDownComponent } from "./revisionChooser.component"

angular.module("app.codeCharta.ui.revisionChooser", ["app.codeCharta.state"])

angular
	.module("app.codeCharta.ui.revisionChooser")
	.component(revisionChooserComponent.selector, revisionChooserComponent)
	.component(revisionChooserFileDropDownComponent.selector, revisionChooserFileDropDownComponent)
