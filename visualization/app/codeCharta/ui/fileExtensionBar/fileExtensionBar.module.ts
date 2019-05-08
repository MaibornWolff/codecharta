import "../../state/state.module"
import angular from "angular"
import { fileExtensionBarComponent } from "./fileExtensionBar.component"

angular.module("app.codeCharta.ui.fileExtensionBar", ["app.codeCharta.state"])
    .component(fileExtensionBarComponent.selector, fileExtensionBarComponent)


