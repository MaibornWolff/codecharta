/*jshint esversion: 6 */
"use strict";
var jsdom = require('jsdom').jsdom;

global.document = jsdom('<html><head><script></script></head><body></body></html>');
global.window = global.document.defaultView;
global.navigator = window.navigator = {};
global.Node = window.Node;

global.window.mocha = {};
global.window.beforeEach = beforeEach;
global.window.afterEach = afterEach;
global.window.before = before;
global.window.after = after;

require('angular/angular');
require('angular-mocks');
require("d3");
require("sinon");
require("jquery");
require("three");

var FileAPI = require('file-api');
global.File = FileAPI.File;
global.FileList = FileAPI.FileList;
global.FileReader = FileAPI.FileReader;

global.angular = window.angular;
global.d3 = require("d3");
global.sinon = require("sinon");
global.chai = require("chai");
global.jquery = global.jQuery = global.$ = require("jquery");
global.THREE = require("three");

global.inject = global.angular.mock.inject;
global.module = global.angular.mock.module;
global.expect = global.chai.expect;

global.loadModuleWithoutSce = function (modName) {
    //This is needed to disable SCE Resource Blacklisting
    angular.module("sceDelegateProviderConfig", []).config(function(_$sceDelegateProvider_) {
        let $sceDelegateProvider = _$sceDelegateProvider_;
        $sceDelegateProvider.resourceUrlWhitelist(["**"]);
    });
    angular.mock.module("sceDelegateProviderConfig");
    angular.mock.module(modName);
    inject();
};


