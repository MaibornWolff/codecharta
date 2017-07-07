"use strict";

import * as THREE from "three";

import "./threeViewer/threeViewer.js";
import "../core/core.js";

import {CodeMapDirective} from "./codeMapDirective.js";
import {CodeMapService} from "./codeMapService.js";
import {CodeMapAssetService} from "./codeMapAssetService.js";
import {CodeMapController} from "./codeMapController";

angular.module("app.codeCharta.codeMap",["app.codeCharta.codeMap.threeViewer", "app.codeCharta.core"]);

angular.module("app.codeCharta.codeMap").directive(
    "codeMapDirective",
    ["threeViewerService", "codeMapService", (a, b) => new CodeMapDirective(a, b)]
);

angular.module("app.codeCharta.codeMap").service(
    "codeMapService",
    CodeMapService
);

angular.module("app.codeCharta.codeMap").service(
    "codeMapAssetService",
    CodeMapAssetService
);

angular.module("app.codeCharta.codeMap").controller(
    "codeMapController",
    CodeMapController
);

angular.module("app.codeCharta.codeMap").factory(
    "codeMapMaterialFactory",
    () => {return {
                    positive: () => {return new THREE.MeshLambertMaterial({color: 0x69AE40});},
                    neutral: () => {return new THREE.MeshLambertMaterial({color: 0xddcc00});},
                    negative: () => {return new THREE.MeshLambertMaterial({color: 0x820E0E});},
                    odd: () => {return new THREE.MeshLambertMaterial({color: 0x501A1C});},
                    even: () => {return new THREE.MeshLambertMaterial({color: 0xD1A9A9});},
                    selected: () => {return new THREE.MeshLambertMaterial({color: 0xEB8319});},
                    hovered: () => {return new THREE.MeshLambertMaterial({ color: 0xEB8319, emissive: 0x111111});},
                    default: () => {return new THREE.MeshLambertMaterial({color: 0x89ACB4});},
                    positiveDelta: () => {return new THREE.MeshLambertMaterial({color: 0x69ff40});}, //building grew -> positive delta, the change may be negative for specific metrics
                    negativeDelta: () => {return new THREE.MeshLambertMaterial({color: 0xff0E0E});},
                    base: () => {return new THREE.MeshLambertMaterial({color: 0x333333});}
            };}

);