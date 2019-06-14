import angular from "angular"
import "../../state/state.module"
import "../../ui/dialog/dialog.module"
import { fileSettingBarComponent } from "./fileSettingBar.component"

angular.module("app.codeCharta.ui.fileSettingBar", ["app.codeCharta.state", "app.codeCharta.ui.dialog"])

angular.module("app.codeCharta.ui.fileSettingBar").component(fileSettingBarComponent.selector, fileSettingBarComponent)
