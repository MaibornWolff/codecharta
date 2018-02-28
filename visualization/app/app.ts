import angular from "angular";
import "angular-animate";
import "angular-aria";
import "angular-material";
import "script-loader!jquery";
import 'script-loader!materialize-css/dist/js/materialize.min.js'
import "./codeCharta/codeCharta";
import "./assets/icon.ico";
import "./app.scss";

angular.module("app", ["app.codeCharta", "ngMaterial"]);

angular.module("app").config(["$locationProvider", function($locationProvider) {
    $locationProvider.hashPrefix("");
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);