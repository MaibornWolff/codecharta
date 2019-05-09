import angular from "angular";
import "angular-animate";
import "angular-aria";
import "angular-material";
import {DialogService} from "./dialog.service";

angular.module("app.codeCharta.ui.dialog",["ngMaterial"])
    .service(DialogService.SELECTOR, DialogService);
