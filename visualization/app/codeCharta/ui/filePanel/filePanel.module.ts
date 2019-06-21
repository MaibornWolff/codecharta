import angular from "angular"
import "../../state/state.module"
import "../dialog/dialog.module"
import { filePanelComponent } from "./filePanel.component"

angular.module("app.codeCharta.ui.filePanel", ["app.codeCharta.state"]).component(filePanelComponent.selector, filePanelComponent)
