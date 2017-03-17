"use strict";

import "../../core/core.js";
import {FileChooserDirective} from "./fileChooserDirective.js";
import {FileChooserController} from "./fileChooserController.js";
import {FileChooserPanelDirective} from "./fileChooserPanelDirective.js";

angular.module("app.codeCharta.ui.fileChooser",["app.codeCharta.core.data"]);

angular.module("app.codeCharta.ui.fileChooser").controller(
    "fileChooserController", FileChooserController
);

angular.module("app.codeCharta.ui.fileChooser").directive(
    "fileChooserPanelDirective", 
    () => new FileChooserPanelDirective()
);

angular.module("app.codeCharta.ui.fileChooser").directive(
    "fileChooserDirective", 
    () => new FileChooserDirective()
);
