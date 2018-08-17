import angular from "angular";
import "../../core/core.module";
import {revisionChooserComponent, revisionChooserFileDropDownComponent} from "./revisionChooserComponent";

angular.module("app.codeCharta.ui.revisionChooser",["app.codeCharta.core"]);

angular.module("app.codeCharta.ui.revisionChooser").component(
    revisionChooserComponent.selector,
    revisionChooserComponent
);

angular.module("app.codeCharta.ui.revisionChooser").component(
    revisionChooserFileDropDownComponent.selector,
    revisionChooserFileDropDownComponent
);