import angular from "angular";
import "angular-animate";
import "angular-aria";
import "angular-material";
import "./codeCharta/codeCharta";
import "./assets/icon.ico";
import "./app.scss";
import "@uirouter/angularjs";
import "./testVille/testVille";

angular.module("app", ["app.codeCharta", "ngMaterial", "ui.router", "app.testVille"]);

angular.module("app")
    .config(["$locationProvider", ($locationProvider) => {
        $locationProvider.hashPrefix("");
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }])
    .config(($mdThemingProvider) => {
        $mdThemingProvider.theme("default")
            .primaryPalette("teal")
            .warnPalette("teal")
            .accentPalette("teal");
    }).config(($mdAriaProvider) => {
        $mdAriaProvider.disableWarnings();
    }).config(($stateProvider) => {

        $stateProvider.state({
            name: "CodeCharta",
            template: "<code-charta-component>Loading CodeCharta...</code-charta-component>"
        });

        $stateProvider.state({
            name: "TestVille",
            template: "<test-ville-component>Loading testVille...</test-ville-component>"
        });

    }).config(['$compileProvider', ($compileProvider) => {
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|chrome-extension):/);
    }]).run(($state) => {
        $state.go("CodeCharta");
    });