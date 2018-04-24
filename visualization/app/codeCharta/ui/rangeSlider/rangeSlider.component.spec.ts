import {rangeSliderComponent, RangeSliderController} from "./rangeSlider.component";
import {SettingsService} from "../../core/settings/settings.service";
import {TreeMapService} from "../../core/treemap/treemap.service";

describe("RangeSliderController", () => {

    let treeMapServiceMock: TreeMapService;
    let settingsServiceMock: SettingsService;
    let rangeSliderController: RangeSliderController;

    function rebuildSUT() {
        rangeSliderController = new RangeSliderController(settingsServiceMock, treeMapServiceMock);
    }

    function mockEverything() {

        const SettingsServiceMock = jest.fn<SettingsService>(() => ({
            subscribe: jest.fn(),
            applySettings: jest.fn(),
            settings: {
                colorMetric: "something"
            }
        }));

        settingsServiceMock = new SettingsServiceMock();

        const TreeMapServiceMock = jest.fn<TreeMapService>(() => ({
            getMaxMetricInAllRevisions: jest.fn()
        }));

        treeMapServiceMock = new TreeMapServiceMock();

        rebuildSUT();

    }

    beforeEach(()=>{
        mockEverything();
    });

    it("should subscribe to settingsService on construction", () => {
        expect(settingsServiceMock.subscribe).toHaveBeenCalledWith(rangeSliderController);
    });

    it("initSliderOptions should use treemapService for ceil calculation", () => {
        treeMapServiceMock.getMaxMetricInAllRevisions.mockReturnValueOnce(42);
        rangeSliderController.initSliderOptions();
        expect(rangeSliderController.sliderOptions.ceil).toBe(42);
    });

    it("slider should applySettings on change", () => {
        rangeSliderController.initSliderOptions();
        rangeSliderController.sliderOptions.onChange();
        expect(settingsServiceMock.applySettings).toHaveBeenCalled();
    });

});