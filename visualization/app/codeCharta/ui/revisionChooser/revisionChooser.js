"use strict";

import "../../core/core.js";
import {RevisionChooserDirective} from "./revisionChooserDirective.js";
import {RevisionChooserController} from "./revisionChooserController.js";

angular.module("app.codeCharta.ui.revisionChooser",["app.codeCharta.core.data"]);

angular.module("app.codeCharta.ui.revisionChooser").controller(
    "revisionChooserController",
    RevisionChooserController
);

angular.module("app.codeCharta.ui.revisionChooser").directive(
    "revisionChooserDirective", 
    () => new RevisionChooserDirective()
);

