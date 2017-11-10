"use strict";

class DetailPanelController{

    /* @ngInject */

    /**
     * @external {Timeout} https://docs.angularjs.org/api/ngMock/service/$timeout
     * @constructor
     * @param {Scope} $rootScope
     * @param {Scope} $scope
     * @param {SettingsService} settingsService
     * @param {Timeout} $timeout
     * @param {object} codeMapMaterialFactory
     */
    constructor($rootScope, $scope, settingsService, $timeout, codeMapMaterialFactory){

        /**
         *
         * @type {Object}
         */
        this.mats = codeMapMaterialFactory;

        /**
         * @typedef {object} CommonDetails
         * @property {string} areaAttributeName
         * @property {string} heightAttributeName
         * @property {string} colorAttributeName
         **/

        /**
         *
         * @type {CommonDetails}
         */
        let commonDetails = {
            areaAttributeName: null,
            heightAttributeName: null,
            colorAttributeName: null
        };

        /**
         * @typedef {object} SpecificDetails
         * @property {string} name
         * @property {number} area
         * @property {number} height
         * @property {number} color
         * @property {number} heightDelta
         * @property {number} areaDelta
         * @property {number} colorDelta
         * @property {string} link
         **/

        /**
         *
         * @type {SpecificDetails}
         */
        let hoveredDetails = {
            name: null,
            area: null,
            height: null,
            color: null,
            heightDelta:null,
            areaDelta : null,
            colorDelta : null,
            link:null
        };

        /**
         *
         * @type {SpecificDetails}
         */
        let selectedDetails = {
            name: null,
            area: null,
            height: null,
            color: null,
            heightDelta:null,
            areaDelta : null,
            colorDelta : null,
            link:null
        };

        /**
         * @typedef {object} Details
         * @property {CommonDetails} common
         * @property {SpecificDetails} hovered
         * @property {SpecificDetails} selected
         */

        /**
         *
         * @type {Details}
         */
        this.details = {
            common: commonDetails,
            hovered:hoveredDetails,
            selected:selectedDetails
        };

        /**
         *
         * @type {Scope}
         */
        this.$rootScope = $rootScope;

        /**
         *
         * @type {Scope}
         */
        this.$scope = $scope;

        /**
         *
         * @type {Settings}
         */
        this.settings = settingsService.settings;

        /**
         *
         * @type {Timeout}
         */
        this.$timeout = $timeout;

        let ctx = this;

        // Controller to Controller communication ! -> Events
        // Watching a variable on mouse move would be too expensive
        // {to: Object3d with node data, from: Object3d with node data}
        ctx.onHover({from:null, to:null});
        this.$rootScope.$on("building-hovered", (e, data) => {
            ctx.onHover(data);
        });

        // {to: Object3d with node data, from: Object3d with node data}
        ctx.onSelect({from:null, to:null});
        this.$rootScope.$on("building-selected", (e, data) => {
            ctx.onSelect(data);
        });

        // we can use watches here again... we try to keep watches as shallow and small as possible
        this.onSettingsChanged(settingsService.settings);
        $scope.$on("settings-changed", (e, s)=>{ctx.onSettingsChanged(s);});

    }

    /**
     * Called when settings change. Applies them to the common details.
     * @listens {settings-changed}
     * @param {Settings} settings
     */
    onSettingsChanged(settings){
        this.details.common.areaAttributeName = settings.areaMetric;
        this.details.common.heightAttributeName = settings.heightMetric;
        this.details.common.colorAttributeName = settings.colorMetric;
    }

    /**
     * called when a new/no building is selected.
     * @listens {building-selected}
     * @param {object} data
     */
    onSelect(data){
        if (data.to && data.to.node) {
            this.setSelectedDetails(data.to.node);
        } else {
            this.clearSelectedDetails();
        }
    }

    /**
     * called when a new/no building is hovered.
     * @listens {building-hovered}
     * @param {object} data
     */
    onHover(data){
        if (data.to && data.to.node) {
            this.setHoveredDetails(data.to.node);
        } else {
            this.clearHoveredDetails();
        }
    }

    /**
     * Checks whether a a building is hovered
     * @return {boolean}
     */
    isHovered() {
        if(this.details && this.details.hovered) {
            return this.details.hovered.name ? true : false;
        } else {
            return false;
        }
    }

    /**
     * Checks whether a a building is selected
     * @return {boolean}
     */
    isSelected() {
        if(this.details && this.details.selected) {
            return this.details.selected.name ? true : false;
        } else {
            return false;
        }
    }

    /**
     * Sets hovered details
     * @param {object} hovered hovered building
     */
    setHoveredDetails(hovered){
        this.$timeout(function() {
            this.details.hovered.name = hovered.name;
            this.details.hovered.area = hovered.attributes ? hovered.attributes[this.details.common.areaAttributeName] : null;
            this.details.hovered.height = hovered.attributes ? hovered.attributes[this.details.common.heightAttributeName] : null;
            this.details.hovered.color = hovered.attributes ? hovered.attributes[this.details.common.colorAttributeName] : null;
            this.details.hovered.heightDelta = hovered.deltas && hovered.deltas.length ? hovered.deltas[this.details.common.heightAttributeName] : null;
            this.details.hovered.areaDelta = hovered.deltas ? hovered.deltas[this.details.common.areaAttributeName] : null;
            this.details.hovered.colorDelta = hovered.deltas ? hovered.deltas[this.details.common.colorAttributeName] : null;
            this.details.hovered.link = hovered.link;
        }.bind(this));
    }

    /**
     * Sets selected details
     * @param {object} selected selected building
     */
    setSelectedDetails(selected){
        this.$timeout(function() {
            this.details.selected.name = selected.name;
            this.details.selected.area = selected.attributes ? selected.attributes[this.details.common.areaAttributeName] : null;
            this.details.selected.height = selected.attributes ? selected.attributes[this.details.common.heightAttributeName] : null;
            this.details.selected.color = selected.attributes ? selected.attributes[this.details.common.colorAttributeName] : null;
            this.details.selected.heightDelta = selected.deltas ? selected.deltas[this.details.common.heightAttributeName] : null;
            this.details.selected.areaDelta  = selected.deltas ? selected.deltas[this.details.common.areaAttributeName] : null;
            this.details.selected.colorDelta  = selected.deltas ? selected.deltas[this.details.common.colorAttributeName] : null;
            this.details.selected.link = selected.link;
        }.bind(this));
    }

    /**
     * clears hovered details
     */
    clearHoveredDetails(){
        this.$timeout(function() {
            this.details.hovered.name = null;
            this.details.hovered.area = null;
            this.details.hovered.height = null;
            this.details.hovered.color = null;
            this.details.hovered.heightDelta = null;
            this.details.hovered.areaDelta  = null;
            this.details.hovered.colorDelta  = null;
            this.details.hovered.link = null;
        }.bind(this));
    }

    /**
     * clears selected details
     */
    clearSelectedDetails(){
        this.$timeout(function() {
            this.details.selected.name = null;
            this.details.selected.area = null;
            this.details.selected.height = null;
            this.details.selected.color = null;
            this.details.selected.heightDelta = null;
            this.details.selected.areaDelta  = null;
            this.details.selected.colorDelta  = null;
            this.details.selected.link = null;
        }.bind(this));
    }

}

export {DetailPanelController};


