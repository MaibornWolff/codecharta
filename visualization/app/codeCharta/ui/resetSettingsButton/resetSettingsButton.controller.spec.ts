import {ResetSettingsButtonController} from "./resetSettingsButton.component";
import {SettingsService} from "../../core/settings/settings.service";

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
                deltas: false,
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
        settingsService.settings.deltas = false;
        controller.settingsNames = ",,";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                deltas: true
            }
        });
        controller.updateSettings();
        expect(settingsService.settings.deltas).toBe(false);
    });

    it(" ?", ()=>{
        settingsService.settings.deltas = false;
        controller.settingsNames = " ";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                deltas: true
            }
        });
        controller.updateSettings();
        expect(settingsService.settings.deltas).toBe(false);
    });

    it("settingname not in settingsservice?", ()=>{
        settingsService.settings.deltas = {};
        controller.settingsNames = "deltas.something.bla";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                deltas: true
            }
        });
        controller.updateSettings();
        expect(settingsService.settings.deltas).toEqual({});
    });

    it("settingname not directly in settingsservice?", ()=>{
        settingsService.settings.deltas = {
            hello: {
                notBla: 12
            }
        };
        controller.settingsNames = "deltas.hello.bla";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                deltas: {
                    hello: {}
                }
            }
        });
        controller.updateSettings();
        expect(settingsService.settings.deltas).toEqual({ hello: {
            notBla: 12
        } });
    });

    it("updateSettings should update setting in service", ()=>{
        settingsService.settings.deltas = false;
        controller.settingsNames = "deltas";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                deltas: true
            }
        });
        controller.updateSettings();
        expect(settingsService.settings.deltas).toBeTruthy();
    });

    it("updateSettings should update settings in service", ()=>{
        settingsService.settings.deltas = false;
        settingsService.settings.something = 13;
        controller.settingsNames = "deltas,something";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                deltas: true,
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
        settingsService.settings.deltas = false;
        settingsService.settings.something = 13;
        controller.settingsNames = "deltas, something";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                deltas: true,
                something: 32
            }
        });
        controller.updateSettings();
        expect(settingsService.settings.something).toBe(32);
    });

    it("updateSettings should allow nl", ()=>{
        settingsService.settings.deltas = false;
        settingsService.settings.something = 13;
        controller.settingsNames = "deltas,\nsomething";
        scenarioService.getDefaultScenario.mockReturnValue({
            settings: {
                deltas: true,
                something: 32
            }
        });
        controller.updateSettings();
        expect(settingsService.settings.something).toBe(32);
    });

});
