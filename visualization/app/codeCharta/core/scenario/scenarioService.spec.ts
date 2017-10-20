import "./scenario.ts";
import angular from "angular";
import sinon from "sinon";
/**
 * @test {ScenatioService}
 */
describe("app.codeCharta.core.scenarioService", function() {

    var scenarioService, $scope, sandbox, settingsService, scenario;

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.module("app.codeCharta.core.scenario"));

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.inject((_scenarioService_, _settingsService_, _$rootScope_)=>{
        scenarioService = _scenarioService_;
        settingsService = _settingsService_;
        $scope = _$rootScope_;

        let r = {
            from: 20,
            to: 40,
            flipped: false
        };

        let s = {
            x: 1, y: 1, z: 1
        };

        let c = {
            x: 0, y: 300, z: 1000
        };

        scenario = {
            map: {},
            neutralColorRange: r,
            areaMetric: "rloc",
            heightMetric: "mcc",
            colorMetric: "mcc",
            deltas: false,
            amountOfTopLabels: 1,
            scaling: s,
            camera: c,
            margin: 1
        };

    }));

    beforeEach(()=>{
        sandbox = sinon.sandbox.create();
    });

    afterEach(()=>{
        sandbox.restore();
    });

    /**
     * @test {ScenarioService#applyScenario}
     */
    it("should apply the settings from a given scenario", ()=>{
        settingsService.applySettings = sinon.spy();
        scenarioService.applyScenario(scenario);
        sinon.assert.calledWith(settingsService.applySettings, sinon.match.same(scenario.settings));
    });

    /**
     * @test {ScenarioService#getDefaultScenario}
     */
    it("default scenario should be rloc/mcc/mcc", ()=>{
        var scenario = scenarioService.getDefaultScenario();
        expect(scenario.settings.areaMetric).toBe("rloc");
        expect(scenario.settings.heightMetric).toBe("mcc");
        expect(scenario.settings.colorMetric).toBe("mcc");
    });

});