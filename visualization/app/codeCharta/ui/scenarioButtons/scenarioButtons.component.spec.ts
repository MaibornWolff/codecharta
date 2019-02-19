import {ScenarioButtonsController} from "./scenarioButtons.component";
import {ScenarioService} from "../../core/scenario/scenario.service";
import {TooltipService} from "../../core/tooltip/tooltip.service";
import {IScope} from "angular";
import {SettingsService} from "../../core/settings/settings.service";
import {DataService} from "../../core/data/data.service";

describe("ScenarioButtonsController", () => {

    let scenarioServiceMock: ScenarioService;
    let settingsServiceMock: SettingsService;
    let dataServiceMock: DataService;
    let tooltipServiceMock: TooltipService;
    let scopeMock: IScope;
    let scenarioButtonsController: ScenarioButtonsController;

    function rebuildSUT() {
        scenarioButtonsController = new ScenarioButtonsController(scenarioServiceMock, tooltipServiceMock, settingsServiceMock, dataServiceMock, scopeMock);
    }

    function mockEverything() {

        const ScenarioServiceMock = jest.fn<ScenarioService>(() => ({
            getScenarios: jest.fn(),
            applyScenario: jest.fn()
        }));

        scenarioServiceMock = new ScenarioServiceMock();

        const SettingsServiceMock = jest.fn<SettingsService>(() => ({
            subscribe: jest.fn()
        }));

        settingsServiceMock = new SettingsServiceMock();

        const DataServiceMock = jest.fn<DataService>(() => ({
            subscribe: jest.fn()
        }));

        dataServiceMock = new DataServiceMock();

        const TooltipServiceMock = jest.fn<TooltipService>(() => ({
            getTooltipTextByKey: jest.fn(),
            subscribe: jest.fn()
        }));

        tooltipServiceMock = new TooltipServiceMock();

        const ScopeMock = jest.fn<IScope>(()=>({
            $apply: jest.fn()
        }));

        scopeMock = new ScopeMock();

        rebuildSUT();

    }

    beforeEach(()=>{
        mockEverything();
    });

    it("should subscribe to services on construction", () => {
        expect(tooltipServiceMock.subscribe).toHaveBeenCalledWith(scenarioButtonsController);
        expect(dataServiceMock.subscribe).toHaveBeenCalledWith(scenarioButtonsController);
        expect(settingsServiceMock.subscribe).toHaveBeenCalledWith(scenarioButtonsController);
    });

    it("should update scenarios on data or settings change", () => {
        scenarioButtonsController.updateScenarios = jest.fn();
        scenarioButtonsController.onDataChanged(null, null);
        scenarioButtonsController.onSettingsChanged(null, null);
        expect(scenarioButtonsController.updateScenarios).toHaveBeenCalledTimes(2);
    });

    it("should get scenarios from scenario service on startup", () => {
        const scenarios = ["a", "nice", "scenario"];
        scenarioServiceMock.getScenarios.mockReturnValue(scenarios);
        rebuildSUT();
        expect(scenarioButtonsController.scenarios).toBe(scenarios);
    });

    it("tooltips change should apply the scope", ()=>{
        scenarioButtonsController.onTooltipsChanged(null, null);
        expect(scopeMock.$apply).toHaveBeenCalled();
    });

    it("getScenarioTooltipTextByKey should delegate to tooltipService", ()=>{
        const tooltipValue = "a nice tooltip";
        const tooltipKey = "nice alias";
        tooltipServiceMock.getTooltipTextByKey.mockImplementation((key) => {
            if(key === tooltipKey) {
                return tooltipValue;
            } else { return ""; }
        });
        expect(scenarioButtonsController.getScenarioTooltipTextByKey(tooltipKey)).toBe(tooltipValue);
        expect(scenarioButtonsController.getScenarioTooltipTextByKey("another")).toBe("");
    });

    it("onclick with a scenario should apply scenario", ()=>{
        const scenario = "scenario";
        scenarioButtonsController.onclick(scenario);
        expect(scenarioServiceMock.applyScenario).toHaveBeenCalledWith(scenario);
    });

});