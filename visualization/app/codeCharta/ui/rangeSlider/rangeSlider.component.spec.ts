import {rangeSliderComponent, RangeSliderController} from "./rangeSlider.component";
import {SettingsService} from "../../core/settings/settings.service";
import { DataService } from "../../core/data/data.service";

describe("RangeSliderController", () => {

    let dataServiceMock: DataService;
    let settingsServiceMock: SettingsService;
    let rangeSliderController: RangeSliderController;
    let $timeout;
    let $scope;


    function rebuildSUT() {
        rangeSliderController = new RangeSliderController(settingsServiceMock, dataServiceMock, $timeout, $scope);
    }

    function mockEverything() {

        $timeout = jest.fn();

        $scope = {
            $broadcast: jest.fn()
        };

        const SettingsServiceMock = jest.fn<SettingsService>(() => ({
            subscribe: jest.fn(),
            applySettings: jest.fn(),
            settings: {
                colorMetric: "something"
            }
        }));

        settingsServiceMock = new SettingsServiceMock();

        const DataServiceMock = jest.fn<DataService>(() => ({
            getMaxMetricInAllRevisions: jest.fn()
        }));

        dataServiceMock = new DataServiceMock();

        rebuildSUT();

    }

    beforeEach(()=>{
        mockEverything();
    });

    it("should broadcast rzslider event in order to load values correctly on startup", () => {
        rebuildSUT();
        $timeout.mock.calls[0][0]();
        expect($scope.$broadcast).toHaveBeenCalledWith("rzSliderForceRender");
    });

    it("should subscribe to settingsService on construction", () => {
        expect(settingsServiceMock.subscribe).toHaveBeenCalledWith(rangeSliderController);
    });

    it("initSliderOptions should use treemapService for ceil calculation", () => {
        dataServiceMock.getMaxMetricInAllRevisions.mockReturnValueOnce(42);
        rangeSliderController.initSliderOptions();
        expect(rangeSliderController.sliderOptions.ceil).toBe(42);
    });

    it("slider should applySettings on change", () => {
        rangeSliderController.initSliderOptions();
        rangeSliderController.sliderOptions.onChange();
        expect(settingsServiceMock.applySettings).toHaveBeenCalled();
    });

});