import {ScenarioButtonsController} from "./scenarioButtonsComponent";
import {ScenarioService} from "../../core/scenario/scenario.service";
import {ToolTipService} from "../../core/tooltip/tooltip.service";
import {IScope} from "angular";

describe("ScenarioButtonsController", () => {

    let scenarioServiceMock: ScenarioService;
    let tooltipServiceMock: ToolTipService;
    let scopeMock: IScope;
    let scenarioButtonsController: ScenarioButtonsController;

    function rebuildSUT() {
        scenarioButtonsController = new ScenarioButtonsController(scenarioServiceMock, tooltipServiceMock, scopeMock);
    }

    function mockEverything() {

        const ScenarioServiceMock = jest.fn<ScenarioService>(() => ({
            getScenarios: jest.fn(),
            applyScenario: jest.fn()
        }));

        scenarioServiceMock = new ScenarioServiceMock();

        const TooltipServiceMock = jest.fn<ToolTipService>(() => ({
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

    it("should subscribe to tooltipService on construction", () => {
        expect(tooltipServiceMock.subscribe).toHaveBeenCalledWith(scenarioButtonsController);
    });

    it("should be invisible on construction", () => {
        expect(!scenarioButtonsController.visible);
    });

    it("should get scenarios from scenario service on startup", () => {
        const scenarios = ["a", "nice", "scenario"];
        scenarioServiceMock.getScenarios.mockReturnValue(scenarios);
        rebuildSUT();
        expect(scenarioButtonsController.scenarios).toBe(scenarios);
    });

    it("toggle() should toggle visible property", () => {
        expect(!scenarioButtonsController.visible);
        scenarioButtonsController.toggle();
        expect(scenarioButtonsController.visible);
        scenarioButtonsController.toggle();
        expect(!scenarioButtonsController.visible);
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
            } else return "";
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