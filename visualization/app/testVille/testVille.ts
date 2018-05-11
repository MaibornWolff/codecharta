import angular from "angular";
import {testVilleComponent} from "./testVille.component";

angular.module(
    "app.testVille",
    []
);

angular.module("app.testVille").component(
    testVilleComponent.selector,
    testVilleComponent
);

