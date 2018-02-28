import {DataServiceSubscriber, DataService, DataModel} from "../../core/data/data.service";
import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import {IAngularEvent} from "angular";
import "./rangeSlider.component.scss";
import {TreeMapService} from "../../core/treemap/treemap.service";

export class RangeSliderController implements SettingsServiceSubscriber {

    public sliderOptions: any;

    /* @ngInject */
    constructor(private settingsService: SettingsService,
                private treeMapService: TreeMapService,) {
        this.settingsService.subscribe(this);
        this.initSliderOptions();
    }

    onSettingsChanged(settings: Settings) {
        this.initSliderOptions(settings);
    }

    initSliderOptions(settings: Settings = this.settingsService.settings) {
        this.sliderOptions = {
            ceil: this.treeMapService.getMaxMetricInAllRevisions(settings.colorMetric),
            pushRange: true,
            onChange: this.onSliderChange.bind(this)
        };
    }

    private onSliderChange() {
        this.settingsService.applySettings(this.settingsService.settings);
    }

}

export const rangeSliderComponent = {
    selector: "rangeSliderComponent",
    template: require("./rangeSlider.component.html"),
    controller: RangeSliderController
};




