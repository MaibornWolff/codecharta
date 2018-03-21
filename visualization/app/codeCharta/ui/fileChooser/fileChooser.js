"use strict";

import "../../core/core.module";
import "../../ui/dialog/dialog";
import {FileChooserDirective} from "./fileChooserDirective.js";
import {FileChooserController} from "./fileChooserController.js";

angular.module("app.codeCharta.ui.fileChooser",["app.codeCharta.core", "app.codeCharta.ui.dialog"]);

angular.module("app.codeCharta.ui.fileChooser").controller(
    "fileChooserController", FileChooserController
);

angular.module("app.codeCharta.ui.fileChooser").directive(
    "fileChooserDirective", 
    () => new FileChooserDirective()
);
