import {ResetSettingsButtonController} from "./resetSettingsButton.component";
import {KindOfMap, SettingsService} from "../../core/settings/settings.service";

describe("colorSettingsPanelController", ()=>{

    let settingsService;
    let scenarioService;
    let controller;

    beforeEach(()=>{

        settingsService = {
            applySettings: jest.fn(),
            settings: {
                neutralColorRange: {
                    flipped: false,
                    from:0,
                    to:0
                },
                kindOfMap: KindOfMap.Single,
                deltaColorFlipped: false
            }
        };

        scenarioService = {
            getDefaultScenario: jest.fn()
        };

        controller = new ResetSettingsButtonController(settingsService, scenarioService);

    });

    it("onClick should call updateSettings", ()=>{
        controller.updateSettings = jest.fn();
        controller.settingsNames = "HELLO";
        controller.onClick();
        expect(controller.updateSettings).toHaveBeenCalledWith("HELLO");
    });

    it("updateSettings should call its applySettings", ()=>{
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {}
        });
        controller.updateSettings();
        expect(settingsService.applySettings).toHaveBeenCalled();
    });

    it(",,?", ()=>{
        settingsService.settings.kindOfMap = KindOfMap.Single;
        controller.settingsNames = ",,";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                kindOfMap: KindOfMap.Delta
            }
        });
        controller.updateSettings();
        expect(settingsService.settings.kindOfMap).toBe(KindOfMap.Single);
    });

    it(" ?", ()=>{
        settingsService.settings.kindOfMap = KindOfMap.Single;
        controller.settingsNames = " ";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                kindOfMap: KindOfMap.Delta
            }
        });
        controller.updateSettings();
        expect(settingsService.settings.kindOfMap).toBe(KindOfMap.Single);
    });

    it("settingname not in settingsservice?", ()=>{
        settingsService.settings.kindOfMap = {};
        controller.settingsNames = "deltas.something.bla";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                kindOfMap: KindOfMap.Delta
            }
        });
        controller.updateSettings();
        expect(settingsService.settings.kindOfMap).toEqual({});
    });

    it("settingname not directly in settingsservice?", ()=>{
        settingsService.settings.kindOfMap = {
            hello: {
                notBla: 12
            }
        };
        controller.settingsNames = "deltas.hello.bla";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                kindOfMap: {
                    hello: {}
                }
            }
        });
        controller.updateSettings();
        expect(settingsService.settings.kindOfMap).toEqual({ hello: {
            notBla: 12
        } });
    });

    it("updateSettings should update setting in service", ()=>{
        settingsService.settings.kindOfMap = KindOfMap.Single;
        controller.settingsNames = "kindOfMap";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                kindOfMap: KindOfMap.Delta
            }
        });
        controller.updateSettings();
        expect(settingsService.settings.kindOfMap).toBe(KindOfMap.Delta);
    });

    it("updateSettings should update settings in service", ()=>{
        settingsService.settings.kindOfMap = KindOfMap.Single;
        settingsService.settings.something = 13;
        controller.settingsNames = "kindOfMap,something";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                kindOfMap: KindOfMap.Delta,
                something: 32
            }
        });
        controller.updateSettings();
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
        controller.settingsNames = "neutralColorRange.from, neutralColorRange.to, neutralColorRange.flipped";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                neutralColorRange: {
                    from: 11,
                    to: 12,
                    flipped: false
                }
            }
        });
        controller.updateSettings();
        expect(settingsService.settings.neutralColorRange.from).toBe(11);
        expect(settingsService.settings.neutralColorRange.to).toBe(12);
        expect(settingsService.settings.neutralColorRange.flipped).toBe(false);
    });

    it("updateSettings should allow blankspace", ()=>{
        settingsService.settings.kindOfMap = KindOfMap.Single;
        settingsService.settings.something = 13;
        controller.settingsNames = "kindOfMap, something";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                kindOfMap: KindOfMap.Delta,
                something: 32
            }
        });
        controller.updateSettings();
        expect(settingsService.settings.something).toBe(32);
    });

    it("updateSettings should allow nl", ()=>{
        settingsService.settings.kindOfMap = KindOfMap.Single;
        settingsService.settings.something = 13;
        controller.settingsNames = "kindOfMap,\nsomething";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                kindOfMap: KindOfMap.Delta,
                something: 32
            }
        });
        controller.updateSettings();
        expect(settingsService.settings.something).toBe(32);
    });

});
