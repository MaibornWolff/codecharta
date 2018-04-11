import {metricChooserComponent, MetricChooserController} from "./metricChooser.component";
import {DataService} from "../../core/data/data.service";
import {SettingsService} from "../../core/settings/settings.service";

describe("MetricChooserController", () => {

    let dataServiceMock: DataService;
    let settingsServiceMock: SettingsService;
    let metricChooserController: MetricChooserController;

    function rebuildSUT() {
        metricChooserController = new MetricChooserController(dataServiceMock, settingsServiceMock);
    }

    function mockEverything() {

        const DataServiceMock = jest.fn<DataService>(() => ({
            setComparisonMap: jest.fn(),
            setReferenceMap: jest.fn(),
            subscribe: jest.fn(),
            getComparisonMap: jest.fn(),
            getReferenceMap: jest.fn(),
            $rootScope: {
                $on: jest.fn()
            },
            data: {
                revisions: [],
                metrics: []
            },
            notify: ()=>{
                metricChooserController.onDataChanged(dataServiceMock.data);
            }
        }));

        dataServiceMock = new DataServiceMock();

        const SettingsServiceMock = jest.fn<SettingsService>(() => ({

        }));

        settingsServiceMock = new SettingsServiceMock();

        rebuildSUT();

    }

    beforeEach(()=>{
        mockEverything();
    });

    it("should subscribe to dataService on construction", () => {
        expect(dataServiceMock.subscribe).toHaveBeenCalledWith(metricChooserController);
    });

    it("should get metrics from data service on startup", () => {
        dataServiceMock.data.metrics = ["Some Metric"];
        rebuildSUT();
        expect(metricChooserController.metrics).toBe(dataServiceMock.data.metrics);
    });

    it("onDataChanged should refresh metrics", () => {
        const metrics = ["some", "revisions"];
        metricChooserController.onDataChanged({metrics: metrics});
        expect(metricChooserController.metrics).toBe(metrics);
    });

    it("onDataChanged should be called when dataService.notify is called", () => {
        metricChooserController.onDataChanged = jest.fn();
        dataServiceMock.notify();
        expect(metricChooserController.onDataChanged).toHaveBeenCalled();
    });

});