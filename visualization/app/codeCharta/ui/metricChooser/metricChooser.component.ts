import {DataServiceSubscriber, DataService, DataModel} from "../../core/data/data.service";
import {SettingsService} from "../../core/settings/settings.service";
import {IAngularEvent} from "angular";
import "./metricChooser.component.scss";

export class MetricChooserController implements DataServiceSubscriber{

    public metrics: string[];

    /* @ngInject */
    constructor(
        private dataService: DataService,
        private settingsService: SettingsService
    ) {
        this.metrics = dataService.data.metrics.sort();
        this.dataService.subscribe(this);
    }

    onDataChanged(data: DataModel, event: IAngularEvent) {
        this.metrics = data.metrics.sort();
    }

    public notify() {
        this.settingsService.applySettings();
    }

}

export const metricChooserComponent = {
    selector: "metricChooserComponent",
    template: require("./metricChooser.component.html"),
    controller: MetricChooserController
};




