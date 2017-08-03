"use strict";

import "./codeCharta/codeCharta.js";

angular.module("app", ["app.codeCharta"]);

angular.module("app").config(["$locationProvider", function($locationProvider) {
    $locationProvider.hashPrefix("");
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);