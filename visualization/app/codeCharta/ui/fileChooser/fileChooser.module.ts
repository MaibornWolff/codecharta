"use strict";
import angular from "angular";
import "../../state/state.module";
import "../../ui/dialog/dialog";
import {FileChooserDirective} from "./fileChooser.directive";
import {fileChooserComponent} from "./fileChooser.component";

angular.module("app.codeCharta.ui.fileChooser",["app.codeCharta.state", "app.codeCharta.ui.dialog"]);

angular.module("app.codeCharta.ui.fileChooser")
    .component(fileChooserComponent.selector, fileChooserComponent);

angular.module("app.codeCharta.ui.fileChooser")
    .directive("fileChooserDirective", () => new FileChooserDirective());
