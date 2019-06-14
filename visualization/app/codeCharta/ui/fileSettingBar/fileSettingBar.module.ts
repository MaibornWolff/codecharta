import angular from "angular"
import "../../state/state.module"
import { fileSettingBarComponent } from "./fileSettingBar.component"

angular.module("app.codeCharta.ui.fileSettingBar", ["app.codeCharta.state"])

angular.module("app.codeCharta.ui.fileSettingBar").component(fileSettingBarComponent.selector, fileSettingBarComponent)
