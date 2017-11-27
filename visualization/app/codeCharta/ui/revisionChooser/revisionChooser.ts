import angular from "angular";
import "../../core/core.module.ts";
import {revisionChooserComponent} from "./revisionChooserComponent.ts";

angular.module("app.codeCharta.ui.revisionChooser",["app.codeCharta.core"]);

angular.module("app.codeCharta.ui.revisionChooser").component(
    revisionChooserComponent.selector,
    revisionChooserComponent
);

