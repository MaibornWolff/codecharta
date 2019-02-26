import {RangeSliderController} from "./rangeSlider.component";
import {SettingsService} from "../../core/settings/settings.service";
import { DataService } from "../../core/data/data.service";
import {MapColors} from "../codeMap/rendering/renderSettings";

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
                colorMetric: "something",
                neutralColorRange: {
                    from: 30,
                }
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

    describe("Coloring the slider", () => {

        let fromPercentage;

        beforeEach(()=>{
            rangeSliderController.applyCssSettings = jest.fn();
            rangeSliderController.maxMetricValue = 200;
            fromPercentage = 100 / rangeSliderController.maxMetricValue * settingsServiceMock.settings.neutralColorRange.from;

        });

        it("sliderColor should get set correctly with positiveGreen color", () => {
            rangeSliderController.settingsService.settings.whiteColorBuildings = false;
            const rangeColors = {"left": MapColors.positive, "middle": MapColors.neutral, "right": MapColors.negative};
            rangeSliderController.updateSliderColors();
            expect(rangeSliderController.applyCssSettings).toHaveBeenCalledWith(rangeColors, fromPercentage);
        });

        it("sliderColor should get set correctly with lightGrey color", () => {
            rangeSliderController.settingsService.settings.whiteColorBuildings = true;
            const rangeColors = {"left": "#DDDDDD", "middle": MapColors.neutral, "right": MapColors.negative};
            rangeSliderController.updateSliderColors();
            expect(rangeSliderController.applyCssSettings).toHaveBeenCalledWith(rangeColors, fromPercentage);
        });

        it("sliderColor should get set correctly with deltaFlipped colors", () => {
            rangeSliderController.settingsService.settings.whiteColorBuildings = false;
            rangeSliderController.settingsService.settings.neutralColorRange.flipped = true;
            const rangeColors = {"left": MapColors.negative, "middle": MapColors.neutral, "right": MapColors.positive};
            rangeSliderController.updateSliderColors();
            expect(rangeSliderController.applyCssSettings).toHaveBeenCalledWith(rangeColors, fromPercentage);
        });
    });
});