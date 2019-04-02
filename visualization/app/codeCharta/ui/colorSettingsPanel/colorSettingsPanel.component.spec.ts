import {ColorSettingsPanelController} from "./colorSettingsPanel.component";
import {IRootScopeService} from "angular";
import {SettingsService} from "../../state/settings.service";
import {FileStateService} from "../../state/fileState.service";
import {MetricService} from "../../state/metric.service";
import {getService, instantiateModule} from "../../../../mocks/ng.mockhelper";
import {TEST_FILE_DATA} from "../../util/dataMocks";

describe("ColorSettingsPanelController", () => {

    let colorSettingsPanelController: ColorSettingsPanelController
    let $rootScope: IRootScopeService
    let settingsService: SettingsService
    let fileStateService: FileStateService
    let metricService: MetricService

    beforeEach(() => {
        restartSystem()
        rebuildController()
    })

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.colorSettingsPanel")

        $rootScope = getService<IRootScopeService>("$rootScope")
        settingsService = getService<SettingsService>("settingsService")
        fileStateService = getService<FileStateService>("fileStateService")
        metricService = getService<MetricService>("metricService")
    }

    function rebuildController() {
        colorSettingsPanelController = new ColorSettingsPanelController(
            $rootScope,
            settingsService,
            fileStateService,
            metricService
        );
    }

    it("set adapted ColorRange in thirds for given metricValues", () => {
        settingsService.updateSettings({dynamicSettings: { colorMetric: "rloc"}})
        fileStateService.addFile(TEST_FILE_DATA)
        fileStateService.setSingle(TEST_FILE_DATA)
        colorSettingsPanelController.adaptColorRange(settingsService.getSettings())

        expect(settingsService.updateSettings).toHaveBeenCalledWith({flipped: false, from: 33.33, to: 66.66})
    });

});