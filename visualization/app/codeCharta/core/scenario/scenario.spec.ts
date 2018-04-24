import {NGMock} from "../../../../mocks/ng.mockhelper";

import "./scenario.module";
import {Scenario, ScenarioService} from "./scenario.service";
import {SettingsService} from "../settings/settings.service";
import {createDefaultScenario} from "./scenario.data";
import {DataService} from "../data/data.service";

/**
 * @test {ScenatioService}
 */
describe("app.codeCharta.core.scenarioService", function () {

    let scenarioService: ScenarioService,
        $scope,
        scenario: Scenario,
        defaultScenario: Scenario,
        dataService: DataService,
        settingsService: SettingsService;

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NGMock.mock.module("app.codeCharta.core.scenario"));

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(NGMock.mock.inject((_scenarioService_, _settingsService_, _$rootScope_, _dataService_) => {
        scenarioService = _scenarioService_;
        settingsService = _settingsService_;
        dataService = _dataService_;
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

    it("scenarios should be scenarios from json file when all metrics are set", () => {
        dataService.data.metrics = ["rloc", "mcc", "unary", "Average Complexity*", "line_coverage", "abs_code_churn", "weeks_with_commits"];
        expect(scenarioService.getScenarios()).toEqual(require("./scenarios.json"));
    });

    it("scenarios should be filtered when not all metrics are set", () => {
        dataService.data.metrics = ["unary", "Average Complexity*"];
        expect(scenarioService.getScenarios()).toEqual([{"name": "Average Complexity*", "settings": {"amountOfTopLabels": 1, "areaMetric": "unary", "camera": {"x": 0, "y": 300, "z": 1000}, "colorMetric": "Average Complexity*", "deltaColorFlipped": false, "deltas": false, "heightMetric": "Average Complexity*", "margin": 1, "neutralColorRange": {"flipped": false, "from": 20, "to": 40}, "scaling": {"x": 1, "y": 1, "z": 1}, "showDependencies": false}}]
        );
    });

    describe("isScenarioPossible", ()=>{

        it("should be possible", () => {
            let metrics = ["unary", "stuff"];
            let scenario = {
                settings: {
                    areaMetric: "unary",
                    heightMetric: "stuff",
                    colorMetric: "unary"
                }
            };
            expect(scenarioService.isScenarioPossible(scenario, metrics)).toBe(true);
        });

        it("should be impossible", () => {
            let metrics = ["unary", "stuff"];
            let scenario = {
                settings: {
                    areaMetric: "unary",
                    heightMetric: "stuff",
                    colorMetric: "mcc"
                }
            };
            expect(scenarioService.isScenarioPossible(scenario, metrics)).toBe(false);
        });

    });

});