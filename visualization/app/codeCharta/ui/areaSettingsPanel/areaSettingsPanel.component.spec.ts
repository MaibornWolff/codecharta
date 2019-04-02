import { AreaSettingsPanelController } from "./areaSettingsPanel.component";
import {SettingsService} from "../../state/settings.service";
import {TEST_FILE_DATA} from "../../util/dataMocks";
import {FileStateService} from "../../state/fileState.service";

describe("AreaSettingsPanelController", () => {

    let areaSettingsPanelController: AreaSettingsPanelController;
    let settingsService: SettingsService
    let fileStateService: FileStateService

    beforeEach(function() {
        areaSettingsPanelController = new AreaSettingsPanelController();
    });

    function setMockValues(areaMetric: string, dynamicMargin: boolean) {
        settingsService.updateSettings({
            dynamicSettings: {
                areaMetric: areaMetric
            },
            appSettings: {
                dynamicMargin: dynamicMargin
            }
        })

        fileStateService.addFile(TEST_FILE_DATA)
    }

    describe("computeMargin", () => {

        it("compute margin should compute correct margins for this map", () => {
            setMockValues("rloc", true);
            expect(areaSettingsPanelController.computeMargin()).toBe(32);

            setMockValues("mcc", true);
            expect(areaSettingsPanelController.computeMargin()).toBe(24);

            setMockValues("functions", true);
            expect(areaSettingsPanelController.computeMargin()).toBe(76);
        });

        it("compute margin should compute correct margins for this map if dynamicMargin is off", () => {
            settingsService.updateSettings({dynamicSettings: {margin: 2}})
            setMockValues("rloc", false);
            expect(areaSettingsPanelController.computeMargin()).toBe(2);

            setMockValues("mcc", false);
            expect(areaSettingsPanelController.computeMargin()).toBe(2);

            setMockValues("functions", false);
            expect(areaSettingsPanelController.computeMargin()).toBe(2);
        });

        it("compute margin should return default margin if metric does not exist", () => {
            setMockValues("nonExistant", true);
            expect(areaSettingsPanelController.computeMargin()).toBe(SettingsService.MIN_MARGIN);
        });

        it("compute margin should return 100 as margin if computed margin bigger als 100 is", () => {
            setMockValues("extremeMetric", true);
            expect(areaSettingsPanelController.computeMargin()).toBe(100);
        });
    });

});