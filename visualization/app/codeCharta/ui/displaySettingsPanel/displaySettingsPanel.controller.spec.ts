import {DisplaySettingsPanelController} from "./displaySettingsPanel.component";

describe("displaySettingsPanelController", ()=>{

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
                deltas: false,
                deltaColorFlipped: false
            }
        };

        controller = new DisplaySettingsPanelController(settingsService);

    });

    it("should subscribe", ()=>{
        expect(settingsService.subscribe).toHaveBeenCalledWith(controller);
    });

    it("apply should not update read only settings in settingsservice", ()=>{
        controller.viewModel.deltas = true;
        controller.apply();
        expect(settingsService.settings.deltas).toBe(false);
    });

    it("apply should update settings in settingsservice and call its apply method", ()=>{
        controller.viewModel.deltaColorFlipped = true;
        controller.apply();
        expect(settingsService.onSettingsChanged).toHaveBeenCalled();
        expect(settingsService.settings.deltaColorFlipped).toBe(true);
    });

    it("should update viewModel when settings are updated", ()=>{
        settingsService.settings.deltas = true;
        settingsService.settings.deltaColorFlipped = true;
        settingsService.settings.neutralColorRange.flipped = true;
        controller.onSettingsChanged(settingsService.settings);
        expect(controller.viewModel.deltas).toBe(true);
        expect(controller.viewModel.flipped).toBe(true);
        expect(controller.viewModel.deltaColorFlipped).toBe(true);
    });

});
