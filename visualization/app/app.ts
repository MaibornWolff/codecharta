import angular from "angular";

import "script-loader!jquery";
import 'script-loader!materialize-css/dist/js/materialize.min.js'

import 'materialize-css/dist/css/materialize.min.css'

import "angularjs-slider/dist/rzslider.css";

import "font-awesome/css/font-awesome.css";

import "./codeCharta/codeCharta.ts";

angular.module("app", ["app.codeCharta"]);

angular.module("app").config(["$locationProvider", function($locationProvider) {
    $locationProvider.hashPrefix("");
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);