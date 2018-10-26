import {KindOfMap, Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import {codeMapBuilding} from "../codeMap/rendering/codeMapBuilding";
import {KVObject} from "../../core/data/data.deltaCalculator.service";
import {DataService} from "../../core/data/data.service";
import "./detailPanel.scss";
import {
    CodeMapBuildingTransition,
    CodeMapMouseEventService,
    CodeMapMouseEventServiceSubscriber
} from "../codeMap/codeMap.mouseEvent.service";

interface CommonDetails {
    areaAttributeName: string | null;
    heightAttributeName: string | null;
    colorAttributeName: string | null;
}


interface SpecificDetails {
    name: string | null;
    area: number | null;
    height: number | null;
    color: number | null;
    heightDelta: number | null;
    areaDelta: number | null;
    colorDelta: number | null;
    link: string | null;
    origin: string | null;
    path: string | null;
    attributes: KVObject | null;
    deltas: KVObject | null;
}

interface Details {
    common: CommonDetails;
    hovered: SpecificDetails;
    selected: SpecificDetails;
}

export class DetailPanelController implements SettingsServiceSubscriber, CodeMapMouseEventServiceSubscriber {

    private details: Details;
    private settings: Settings;

    /* @ngInject */
    constructor(private $rootScope,
                private settingsService: SettingsService,
                private dataService: DataService,
                private $timeout) {

        this.details = {
            common: {
                areaAttributeName: null,
                heightAttributeName: null,
                colorAttributeName: null
            },
            hovered: {
                name: null,
                area: null,
                height: null,
                color: null,
                heightDelta: null,
                areaDelta: null,
                colorDelta: null,
                link: null,
                origin: null,
                path: null,
                attributes: null,
                deltas: null
            },
            selected: {
                name: null,
                area: null,
                height: null,
                color: null,
                heightDelta: null,
                areaDelta: null,
                colorDelta: null,
                link: null,
                origin: null,
                path: null,
                attributes: null,
                deltas: null
            }
        };

        this.settings = settingsService.settings;

        // we can use watches here again... we try to keep watches as shallow and small as possible
        this.onSettingsChanged(settingsService.settings);

        this.settingsService.subscribe(this);
        CodeMapMouseEventService.subscribe($rootScope, this);

    }

    onBuildingHovered(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
        this.onHover(data);
    }

    onBuildingSelected(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
        this.onSelect(data);
    }

    onBuildingRightClicked(building: codeMapBuilding, x: number, y: number, event: angular.IAngularEvent) {
    }

    /**
     * Called when settings change. Applies them to the common details.
     */
    onSettingsChanged(settings: Settings) {
        this.details.common.areaAttributeName = settings.areaMetric;
        this.details.common.heightAttributeName = settings.heightMetric;
        this.details.common.colorAttributeName = settings.colorMetric;
    }

    /**
     * called when a new/no building is selected.
     */
    onSelect(data) {
        if (data.to && data.to.node) {
            this.setSelectedDetails(data.to.node);
        } else {
            this.clearSelectedDetails();
        }
    }

    /**
     * called when a new/no building is hovered.
     */
    onHover(data) {
        if (data.to && data.to.node) {
            this.setHoveredDetails(data.to.node);
        } else {
            this.clearHoveredDetails();
        }
    }

    /**
     * Checks whether a a building is hovered
     */
    isHovered() {
        if (this.details && this.details.hovered) {
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
        if (this.details && this.details.selected) {
            return this.details.selected.name ? true : false;
        } else {
            return false;
        }
    }

    /**
     * Sets hovered details
     * @param {object} hovered hovered building
     */
    setHoveredDetails(hovered) {
        this.clearHoveredDetails();
        this.$timeout(function () {
            this.details.hovered.name = hovered.name;
            if(hovered.mode != undefined && this.settings.mode == KindOfMap.Delta){
                this.details.hovered.heightDelta = hovered.deltas ? hovered.deltas[this.details.common.heightAttributeName] : null;
                this.details.hovered.areaDelta = hovered.deltas ? hovered.deltas[this.details.common.areaAttributeName] : null;
                this.details.hovered.colorDelta = hovered.deltas ? hovered.deltas[this.details.common.colorAttributeName] : null;
                this.details.hovered.deltas = hovered.deltas;

            }
            if(hovered.attributes != undefined) {
                this.details.hovered.area = hovered.attributes ? hovered.attributes[this.details.common.areaAttributeName] : null;
                this.details.hovered.height = hovered.attributes ? hovered.attributes[this.details.common.heightAttributeName] : null;
                this.details.hovered.color = hovered.attributes ? hovered.attributes[this.details.common.colorAttributeName] : null;
                this.details.hovered.attributes = hovered.attributes;
            }
            this.details.hovered.link = hovered.link;
            this.details.hovered.origin = hovered.origin;
            this.details.hovered.path = this.getPathFromCodeMapBuilding(hovered);
        }.bind(this));
    }

    private getPathFromCodeMapBuilding(b: codeMapBuilding): string {
        let current = b;
        let result = "";
        while(current) {
            result = "/" + current.name + result;
            current = current.parent;
        }
        return result;
    }

    /**
     * Sets selected details
     * @param {object} selected selected building
     */
    setSelectedDetails(selected) {
        this.clearSelectedDetails();
        this.$timeout(function () {
            this.details.selected.name = selected.name;
            if(selected.attributes != undefined) {
                this.details.selected.area = selected.attributes ? selected.attributes[this.details.common.areaAttributeName] : null;
                this.details.selected.height = selected.attributes ? selected.attributes[this.details.common.heightAttributeName] : null;
                this.details.selected.color = selected.attributes ? selected.attributes[this.details.common.colorAttributeName] : null;
                this.details.selected.attributes = selected.attributes;
            }
            if(selected.deltas != undefined && this.settings.mode == KindOfMap.Delta) {
                this.details.selected.heightDelta = selected.deltas ? selected.deltas[this.details.common.heightAttributeName] : null;
                this.details.selected.areaDelta = selected.deltas ? selected.deltas[this.details.common.areaAttributeName] : null;
                this.details.selected.colorDelta = selected.deltas ? selected.deltas[this.details.common.colorAttributeName] : null;
                this.details.selected.deltas = selected.deltas;
            }
            this.details.selected.link = selected.link;
            this.details.selected.origin = selected.origin;
            this.details.selected.path = this.getPathFromCodeMapBuilding(selected);
        }.bind(this));
    }

    /**
     * clears hovered details
     */
    clearHoveredDetails() {
        this.$timeout(function () {
            this.details.hovered.name = null;
            this.details.hovered.area = null;
            this.details.hovered.height = null;
            this.details.hovered.color = null;
            this.details.hovered.heightDelta = null;
            this.details.hovered.areaDelta = null;
            this.details.hovered.colorDelta = null;
            this.details.hovered.link = null;
            this.details.hovered.origin = null;
            this.details.hovered.path = null;
            this.details.hovered.attributes = null;
            this.details.hovered.deltas = null;
        }.bind(this));
    }

    /**
     * clears selected details
     */
    clearSelectedDetails() {
        this.$timeout(function () {
            this.details.selected.name = null;
            this.details.selected.area = null;
            this.details.selected.height = null;
            this.details.selected.color = null;
            this.details.selected.heightDelta = null;
            this.details.selected.areaDelta = null;
            this.details.selected.colorDelta = null;
            this.details.selected.link = null;
            this.details.selected.origin = null;
            this.details.selected.path = null;
            this.details.selected.attributes = null;
            this.details.selected.deltas = null;
        }.bind(this));
    }

}

export const detailPanelComponent = {
    selector: "detailPanelComponent",
    template: require("./detailPanel.html"),
    controller: DetailPanelController
};

