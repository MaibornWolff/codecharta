import angular from "angular";

import "script-loader!jquery";
import 'script-loader!materialize-css/dist/js/materialize.min.js'

import "./codeCharta/codeCharta";

import "./icon.ico";

import "./app.scss";

angular.module("app", ["app.codeCharta"]);

angular.module("app").config(["$locationProvider", function($locationProvider) {
    $locationProvider.hashPrefix("");
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);