import {NGMock} from "../../../../mocks/ng.mockhelper";
import "./scenario.module";
import {Scenario, ScenarioService} from "./scenario.service";
import {Settings, SettingsService} from "../settings/settings.service";
import {DataService} from "../data/data.service";

describe("app.codeCharta.core.scenarioService", function () {

    let scenarioService: ScenarioService,
        $scope,
        scenario: Scenario,
        defaultScenario: Scenario,
        dataService: DataService,
        settingsService: SettingsService;

    beforeEach(NGMock.mock.module("app.codeCharta.core.scenario"));

    beforeEach(NGMock.mock.inject((_scenarioService_, _settingsService_, _$rootScope_, _dataService_) => {
        scenarioService = _scenarioService_;
        settingsService = _settingsService_;
        dataService = _dataService_;
        $scope = _$rootScope_;
        scenario = {name: "testScenario", settings: settingsService.settings};
        defaultScenario = _scenarioService_.getDefaultScenario();
    }));

    it("should apply the settings from a given scenario", () => {
        scenarioService.applyScenario(scenario);
        expect(settingsService.settings).toBe(scenario.settings);
    });

    it("should apply the settings from a given scenario once when applyScenarioOnce is called", () => {
        scenarioService.applyScenario = jest.fn();
        scenarioService.applyScenarioOnce(scenario);
        scenarioService.applyScenarioOnce(scenario);
        expect(scenarioService.applyScenario).toHaveBeenCalledTimes(1);
    });

    it("default scenario should be rloc/mcc/mcc", () => {
        let scenario = scenarioService.getDefaultScenario();
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
        expect(scenarioService.getScenarios()).toMatchSnapshot();
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

        it("should be impossible when params are null", () => {
            expect(scenarioService.isScenarioPossible(null, null)).toBe(false);
        });

    });

    it("should update only settings, which exist in given scenario", () => {
        const defaultSettings: Settings = scenarioService.settingsService.getDefaultSettings();
        const scenario: Scenario = {
            name: "myScenario",
            settings: {
                areaMetric: "myTestAreaMetric",
                colorMetric: "myTestColorMetric",
                heightMetric: "myTestHeightMetric",
                amountOfTopLabels: 42
            },
            autoFitCamera: true
        };

        scenarioService.applyScenario(scenario);

        const s = settingsService.settings;
        expect(s.areaMetric).toBe(scenario.settings.areaMetric);
        expect(s.colorMetric).toBe(scenario.settings.colorMetric);
        expect(s.heightMetric).toBe(scenario.settings.heightMetric);
        expect(s.amountOfTopLabels).toBe(scenario.settings.amountOfTopLabels);
        expect(s.whiteColorBuildings).toBe(defaultSettings.whiteColorBuildings);
        expect(s.isWhiteBackground).toBe(defaultSettings.isWhiteBackground);

    });

});