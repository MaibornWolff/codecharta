import "../../state/state.module"
import angular from "angular"
import { matchingFilesCounterComponent } from "./matchingFilesCounter.component"

angular.module("app.codeCharta.ui.matchingFilesCounter", ["app.codeCharta.state"])
    .component(matchingFilesCounterComponent.selector, matchingFilesCounterComponent)


