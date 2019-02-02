import {ResetSettingsButtonController} from "./resetSettingsButton.component";
import {KindOfMap, SettingsService} from "../../core/settings/settings.service";
import {DataService} from "../../core/data/data.service";

describe("resetButtonController", ()=>{

    let settingsService: SettingsService;
    let dataService: DataService;
    let resetSettingsButtonController: ResetSettingsButtonController;

    beforeEach(()=>{

        settingsService = {
            applySettings: jest.fn(),
            getDefaultSettings: jest.fn(),
            settings: {
                neutralColorRange: {
                    flipped: false,
                    from:0,
                    to:0
                },
                mode: KindOfMap.Single,
                deltaColorFlipped: false
            }
        };

        dataService = {
            data: {
                metrics: []
            }
        };

        resetSettingsButtonController = new ResetSettingsButtonController(settingsService, dataService);

    });

    it("onClick should call updateSettings", ()=>{
        resetSettingsButtonController.updateSettings = jest.fn();
        resetSettingsButtonController.settingsNames = "HELLO";
        resetSettingsButtonController.onClick();
        expect(resetSettingsButtonController.updateSettings).toHaveBeenCalledWith("HELLO");
    });

    it("updateSettings should call its applySettings", ()=>{
        settingsService.getDefaultSettings.mockReturnValue({});
        resetSettingsButtonController.updateSettings();
        expect(settingsService.applySettings).toHaveBeenCalled();
    });

    it(",,?", ()=>{
        settingsService.settings.mode = KindOfMap.Single;
        resetSettingsButtonController.settingsNames = ",,";
        settingsService.getDefaultSettings.mockReturnValue({
            mode: KindOfMap.Delta
        });
        resetSettingsButtonController.updateSettings();
        expect(settingsService.settings.mode).toBe(KindOfMap.Single);
    });

    it(" ?", ()=>{
        settingsService.settings.mode = KindOfMap.Single;
        resetSettingsButtonController.settingsNames = " ";
        settingsService.getDefaultSettings.mockReturnValue({
            mode: KindOfMap.Delta
        });
        resetSettingsButtonController.updateSettings();
        expect(settingsService.settings.mode).toBe(KindOfMap.Single);
    });

    it("settingsName not in settingsservice?", ()=>{
        settingsService.settings.mode = {};
        resetSettingsButtonController.settingsNames = "deltas.something.bla";
        settingsService.getDefaultSettings.mockReturnValue({
            mode: KindOfMap.Delta
        });
        resetSettingsButtonController.updateSettings();
        expect(settingsService.settings.mode).toEqual({});
    });

    it("settingsName not directly in settingsservice?", ()=>{
        settingsService.settings.mode = {
            hello: {
                notBla: 12
            }
        };
        resetSettingsButtonController.settingsNames = "deltas.hello.bla";
        settingsService.getDefaultSettings.mockReturnValue({
            mode: {
                hello: {}
            }
        });
        resetSettingsButtonController.updateSettings();
        expect(settingsService.settings.mode).toEqual({ hello: {
            notBla: 12
        } });
    });

    it("updateSettings should update setting in service", ()=>{
        settingsService.settings.mode = KindOfMap.Single;
        resetSettingsButtonController.settingsNames = "mode";
        settingsService.getDefaultSettings.mockReturnValue({
            mode: KindOfMap.Delta
        });
        resetSettingsButtonController.updateSettings();
        expect(resetSettingsButtonController.settingsService.settings.mode).toBe(KindOfMap.Delta);
    });

    it("updateSettings should update settings in service", ()=>{
        settingsService.settings.mode = KindOfMap.Single;
        settingsService.settings.something = 13;
        resetSettingsButtonController.settingsNames = "mode,something";
        settingsService.getDefaultSettings.mockReturnValue({
            mode: KindOfMap.Delta,
            something: 32
        });
        resetSettingsButtonController.updateSettings();
        expect(settingsService.settings.something).toBe(32);
    });

    it("updateSettings should update nested settings in service", ()=>{
        settingsService.settings.something = {
            neutralColorRange: {
                from: 1,
                to: 1,
                flipped: false
            }
        };
        resetSettingsButtonController.settingsNames = "neutralColorRange.from, neutralColorRange.to, neutralColorRange.flipped";
        settingsService.getDefaultSettings.mockReturnValue({
            neutralColorRange: {
                from: 11,
                to: 12,
                flipped: false
            }
        });
        resetSettingsButtonController.updateSettings();
        expect(settingsService.settings.neutralColorRange.from).toBe(11);
        expect(settingsService.settings.neutralColorRange.to).toBe(12);
        expect(settingsService.settings.neutralColorRange.flipped).toBe(false);
    });

    it("updateSettings should allow blankspace", ()=>{
        settingsService.settings.mode = KindOfMap.Single;
        settingsService.settings.something = 13;
        resetSettingsButtonController.settingsNames = "mode, something";
        settingsService.getDefaultSettings.mockReturnValue({
            mode: KindOfMap.Delta,
            something: 32
        });
        resetSettingsButtonController.updateSettings();
        expect(settingsService.settings.something).toBe(32);
    });

    it("updateSettings should allow nl", ()=>{
        settingsService.settings.mode = KindOfMap.Single;
        settingsService.settings.something = 13;
        resetSettingsButtonController.settingsNames = "mode,\nsomething";
        settingsService.getDefaultSettings.mockReturnValue({
            mode: KindOfMap.Delta,
            something: 32
        });
        resetSettingsButtonController.updateSettings();
        expect(settingsService.settings.something).toBe(32);
    });

});
