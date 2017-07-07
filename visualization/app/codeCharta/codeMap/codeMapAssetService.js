"use strict";

import * as THREE from "three";

/**
 * This service inits all materials and geo's defined in @link{codeMap.js}.
 * This way we have control over material/geo creation and caching.
 */
class CodeMapAssetService {

    /* @ngInject */

    /**
     * @external {MeshLambertMaterial} https://threejs.org/docs/api/materials/MeshLambertMaterial.html
     * @external {BoxGeometry} https://threejs.org/docs/?q=box#Reference/Geometries/BoxGeometry
     * @constructor
     * @param {object} codeMapMaterialFactory
     */
    constructor(codeMapMaterialFactory) {

        /**
         * @typedef {object} CodeMapMaterialPack
         * @property {MeshLambertMaterial} positive
         * @property {MeshLambertMaterial} neutral
         * @property {MeshLambertMaterial} negative
         * @property {MeshLambertMaterial} odd
         * @property {MeshLambertMaterial} even
         * @property {MeshLambertMaterial} selected
         * @property {MeshLambertMaterial} hovered
         * @property {MeshLambertMaterial} default
         * @property {MeshLambertMaterial} positiveDelta
         * @property {MeshLambertMaterial} negativeDelta
         * @property {MeshLambertMaterial} base
         */

        /**
         * @type {CodeMapMaterialPack}
         */
        this.materials = {
            positive: codeMapMaterialFactory.positive(),
            neutral: codeMapMaterialFactory.neutral(),
            negative: codeMapMaterialFactory.negative(),
            odd: codeMapMaterialFactory.odd(),
            even: codeMapMaterialFactory.even(),
            selected: codeMapMaterialFactory.selected(),
            hovered: codeMapMaterialFactory.hovered(),
            default: codeMapMaterialFactory.default(),
            positiveDelta: codeMapMaterialFactory.positiveDelta(),
            negativeDelta: codeMapMaterialFactory.negativeDelta(),
            base: codeMapMaterialFactory.base()
        };

        /**
         * @type {BoxGeometry}
         */
        this.cubeGeo = new THREE.BoxGeometry(1,1,1);

    }

    /**
     * @return {BoxGeometry}
     */
    getCubeGeo() {
        return this.cubeGeo;
    }

    /**
     * @return {MeshLambertMaterial}
     */
    positive() { return this.materials.positive; }

    /**
     * @return {MeshLambertMaterial}
     */
    neutral() { return this.materials.neutral; }

    /**
     * @return {MeshLambertMaterial}
     */
    negative() { return this.materials.negative; }

    /**
     * @return {MeshLambertMaterial}
     */
    odd() { return this.materials.odd; }

    /**
     * @return {MeshLambertMaterial}
     */
    even() { return this.materials.even; }

    /**
     * @return {MeshLambertMaterial}
     */
    selected() { return this.materials.selected; }

    /**
     * @return {MeshLambertMaterial}
     */
    hovered() { return this.materials.hovered; }

    /**
     * @return {MeshLambertMaterial}
     */
    default() { return this.materials.default; }

    /**
     * @return {MeshLambertMaterial}
     */
    positiveDelta() { return this.materials.positiveDelta; }

    /**
     * @return {MeshLambertMaterial}
     */
    negativeDelta() { return this.materials.negativeDelta; }

    /**
     * @return {MeshLambertMaterial}
     */
    base() { return this.materials.base; }

}

export {CodeMapAssetService};



