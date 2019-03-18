"use strict";

import angular from "angular";

import "../../state/state.module";
import "../../ui/dialog/dialog";
import {FileChooserDirective} from "./fileChooserDirective";
import {FileChooserController} from "./fileChooserController";

angular.module("app.codeCharta.ui.fileChooser",["app.codeCharta.state", "app.codeCharta.ui.dialog"]);

angular.module("app.codeCharta.ui.fileChooser").controller(
    "fileChooserController", FileChooserController
);

angular.module("app.codeCharta.ui.fileChooser").directive(
    "fileChooserDirective", 
    () => new FileChooserDirective()
);
