import { LegendPanelController } from "./legendPanel.component";
import {SettingsService} from "../../core/settings/settings.service";
import {DataService} from "../../core/data/data.service";

describe("LegendPanelController", () => {

    let legendPanelController: LegendPanelController;
    let $timeout;
    let settingsServiceMock: SettingsService;
    let dataServiceMock: DataService;

    function rebuildSUT() {
        legendPanelController = new LegendPanelController($timeout, settingsServiceMock, dataServiceMock, null);
    }

    function mockEverything() {

        $timeout = jest.fn();

        const SettingsServiceMock = jest.fn<SettingsService>(() => ({
            subscribe: jest.fn(),
            applySettings: jest.fn(),
            settings: {
                colorMetric: "something"
            }
        }));

        settingsServiceMock = new SettingsServiceMock();

        const DataServiceMock = jest.fn<DataService>(() => ({
            subscribe: jest.fn(),
            getMaxMetricInAllRevisions: jest.fn()
        }));

        dataServiceMock = new DataServiceMock();

        rebuildSUT();

    }

    beforeEach(function() {
        mockEverything();
    });


    describe("Color to pixel image", () => {
        it("generate pixel in base64", () => {
            expect(legendPanelController.generatePixel("some color value")).toBe("data:image/gif;base64,R0lGODlhAQABAPAAsome color value/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==");
        });

        it("html -> base64", () => {
            expect(legendPanelController.getImageDataUri("000000")).toBe("data:image/gif;base64,R0lGODlhAQABAPAAAAAAAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==");
        });

        it("encode hex to rgb", () => {
            expect(legendPanelController.encodeHex("#000000")).toBe("AAAAAP//");
            expect(legendPanelController.encodeHex("#ff0000")).toBe("AP8AAP//");
            expect(legendPanelController.encodeHex("#0000ff")).toBe("AAAA////");
        });

        it("encode rgb to base64 color value", () => {
            expect(legendPanelController.encodeRGB(0, 0, 0)).toBe("AAAAAP//");
            expect(legendPanelController.encodeRGB(255, 255, 255)).toBe("AP//////");
            expect(legendPanelController.encodeRGB(123, 3, 111)).toBe("AHsDb///");
        });

        it("encode triplet to base64 color value", () => {
            expect(legendPanelController.encodeTriplet(0, 0, 0)).toBe("AAAA");
            expect(legendPanelController.encodeTriplet(255, 255, 255)).toBe("////");
            expect(legendPanelController.encodeTriplet(123, 3, 111)).toBe("ewNv");
        });
    });
    
    
});