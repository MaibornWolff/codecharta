"use strict";

import angular from "angular";

import "./codeCharta/codeCharta.js";

import "materialize-css/dist/css/materialize.css";
import "angularjs-slider/dist/rzslider.css";
import "font-awesome/css/font-awesome.css";

angular.module("app", ["app.codeCharta"]);

angular.module("app").config(["$locationProvider", function($locationProvider) {
    $locationProvider.hashPrefix("");
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);