import angular from "angular";
import "angular-animate";
import "angular-aria";
import "angular-material";
import "./codeCharta/codeCharta";
import "./assets/icon.ico";
import "./app.scss";
import "@uirouter/angularjs";

angular.module("app", ["app.codeCharta", "ngMaterial", "ui.router"]);

angular.module("app")
    .config(["$locationProvider", function ($locationProvider) {
        $locationProvider.hashPrefix("");
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }])
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme("default")
            .primaryPalette("teal")
            .warnPalette("teal")
            .accentPalette("teal");
    }).config(function($stateProvider) {

        $stateProvider.state({
            name: "codecharta",
            url: "/",
            template: "<code-charta-component>Loading CodeCharta...</code-charta-component>"
        });

        $stateProvider.state({
            name: "about",
            template: "<h3>Its the UI-Router hello world app!</h3>"
        });

    });