import {ColorSettingsPanelController} from "./colorSettingsPanel.component";
import {KindOfMap} from "../../core/settings/settings.service";

describe("colorSettingsPanelController", ()=>{

    let settingsService;
    let controller;

    beforeEach(()=>{

        settingsService = {
            subscribe: jest.fn(),
            applySettings: jest.fn(),
            onSettingsChanged: jest.fn(),
            settings: {
                neutralColorRange: {
                    flipped: false
                },
                mode: KindOfMap.Single,
                deltaColorFlipped: false
            }
        };

        controller = new ColorSettingsPanelController(settingsService);

    });

    it("should subscribe", ()=>{
        expect(settingsService.subscribe).toHaveBeenCalledWith(controller);
    });

    it("apply should not update read only settings in settingsservice", ()=>{
        controller.viewModel.deltas = true;
        controller.apply();
        expect(settingsService.settings.mode).toBe(KindOfMap.Single);
    });

    it("should update viewModel when settings are updated", ()=>{
        settingsService.settings.mode  = KindOfMap.Delta;
        settingsService.settings.deltaColorFlipped = true;
        settingsService.settings.neutralColorRange.flipped = true;
        controller.onSettingsChanged(settingsService.settings);
        expect(controller.viewModel.deltas).toBe(true);
        expect(controller.viewModel.flipped).toBe(true);
    });

});
