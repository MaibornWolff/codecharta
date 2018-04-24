import angular from "angular";
import "angular-animate";
import "angular-aria";
import "angular-material";
import "./codeCharta/codeCharta";
import "./assets/icon.ico";
import "./app.scss";

angular.module("app", ["app.codeCharta", "ngMaterial"]);

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
    });