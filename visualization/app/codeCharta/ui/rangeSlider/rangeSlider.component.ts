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
            onChange: this.onSliderChange.bind(this),
            pushRange: true,
            onToChange: this.onToSliderChange.bind(this),
            onFromChange: this.onFromSliderChange.bind(this)
        };
    }

    private onToSliderChange() {
        this.settingsService.settings.neutralColorRange.to = Math.max(1,
            this.settingsService.settings.neutralColorRange.to );
        this.settingsService.settings.neutralColorRange.to = Math.min (
            this.treeMapService.getMaxMetricInAllRevisions(this.settingsService.settings.colorMetric),
            this.settingsService.settings.neutralColorRange.to );
        this.settingsService.settings.neutralColorRange.from = Math.min(
            this.settingsService.settings.neutralColorRange.to-1, this.settingsService.settings.neutralColorRange.from);
        this.onSliderChange();
    }

    private onFromSliderChange() {
        this.settingsService.settings.neutralColorRange.from = Math.min(
            this.treeMapService.getMaxMetricInAllRevisions(this.settingsService.settings.colorMetric)-1,
            this.settingsService.settings.neutralColorRange.from );
        this.settingsService.settings.neutralColorRange.to = Math.max(
            this.settingsService.settings.neutralColorRange.to, this.settingsService.settings.neutralColorRange.from+1);
        this.onSliderChange();
    }

    private onSliderChange() {
        this.settingsService.applySettings();
    }

}

export const rangeSliderComponent = {
    selector: "rangeSliderComponent",
    template: require("./rangeSlider.component.html"),
    controller: RangeSliderController
};




