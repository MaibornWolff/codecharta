import angular from "angular";
import {testVilleComponent} from "./testVille.component";
import "../codeCharta/core/core.module";
import "../codeCharta/ui/ui";

angular.module(
    "app.testVille",
    ["app.codeCharta.core", "app.codeCharta.ui"]
).component(
    testVilleComponent.selector,
    testVilleComponent
);

