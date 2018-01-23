import angular from "angular";
import "../../core/core.module";
import "../../ui/ui";
import {revisionChooserComponent} from "./revisionChooserComponent";

angular.module("app.codeCharta.ui.revisionChooser",["app.codeCharta.core", "app.codeCharta.ui"]);

angular.module("app.codeCharta.ui.revisionChooser").component(
    revisionChooserComponent.selector,
    revisionChooserComponent
);

