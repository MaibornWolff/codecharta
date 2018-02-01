import {NGMock} from "../../../ng.mockhelper";

import "./scenario.module";
import {Scenario, ScenarioService} from "./scenario.service";
import {SettingsService} from "../settings/settings.service";
import {createDefaultScenario} from "./scenario.data";

/**
 * @test {ScenatioService}
 */
describe("app.codeCharta.core.scenarioService", function () {

    let scenarioService: ScenarioService,
        $scope,
        scenario: Scenario,
        defaultScenario: Scenario,
        settingsService: SettingsService;

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NGMock.mock.module("app.codeCharta.core.scenario"));

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NGMock.mock.inject((_scenarioService_, _settingsService_, _$rootScope_) => {
        scenarioService = _scenarioService_;
        settingsService = _settingsService_;
        $scope = _$rootScope_;
        scenario = {name: "testScenario", settings: settingsService.settings};
        defaultScenario = createDefaultScenario(settingsService.settings.map);
    }));

    it("should apply the settings from a given scenario", () => {
        scenarioService.applyScenario(scenario);
        expect(settingsService.settings).toBe(scenario.settings);
    });

    it("default scenario should be rloc/mcc/mcc", () => {
        var scenario = scenarioService.getDefaultScenario();
        expect(scenario.settings.areaMetric).toBe(defaultScenario.settings.areaMetric);
        expect(scenario.settings.heightMetric).toBe(defaultScenario.settings.heightMetric);
        expect(scenario.settings.colorMetric).toBe(defaultScenario.settings.colorMetric);
    });

    it("scenarios should be scenarios from json file", () => {
        expect(scenarioService.getScenarios()).toBe(require("./scenarios.json"));
    });

});