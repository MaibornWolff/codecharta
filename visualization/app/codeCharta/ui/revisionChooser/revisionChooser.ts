import angular from "angular";
import "../../core/core.module";
import {revisionChooserComponent} from "./revisionChooserComponent";

angular.module("app.codeCharta.ui.revisionChooser",["app.codeCharta.core"]);

angular.module("app.codeCharta.ui.revisionChooser").component(
    revisionChooserComponent.selector,
    revisionChooserComponent
);

