import "../../state/state.module"
import angular from "angular"
import { maxTreeMapFilesComponent } from "./maxTreeMapFiles.component"

angular
	.module("app.codeCharta.ui.maxTreeMapFiles", ["app.codeCharta.state"])
	.component(maxTreeMapFilesComponent.selector, maxTreeMapFilesComponent)
