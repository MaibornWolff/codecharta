import "../../state/state.module"
import angular from "angular"
import { matchingFilesCounterComponent } from "./matchingFilesCounter.component"
import "../../codeCharta.module"

angular
	.module("app.codeCharta.ui.matchingFilesCounter", ["app.codeCharta.state", "app.codeCharta"])
	.component(matchingFilesCounterComponent.selector, matchingFilesCounterComponent)
