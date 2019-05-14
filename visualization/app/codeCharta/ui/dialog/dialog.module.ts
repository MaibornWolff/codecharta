import angular from "angular"
import "angular-animate"
import "angular-aria"
import "angular-material"
import { DialogService } from "./dialog.service"
import _ from "lodash"

angular.module("app.codeCharta.ui.dialog", ["ngMaterial"])

angular.module("app.codeCharta.ui.dialog").service(_.camelCase(DialogService.name), DialogService)
