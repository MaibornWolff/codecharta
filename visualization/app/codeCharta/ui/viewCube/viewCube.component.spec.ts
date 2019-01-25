import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper";
import { IRootScopeService } from "angular";
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService";
import { ViewCubeMouseEventsService } from "./viewCube.mouseEvents.service";
import { ViewCubeController } from "./viewCube.component";
import { ViewCubemeshGenerator } from "./viewCube.meshGenerator";

describe("ViewCubeController", () => {
    let rootScopeServiceMock: IRootScopeService;
    let threeOrbitControlsServiceMock: ThreeOrbitControlsService;
    let viewCubeMouseEventsServiceMock: ViewCubeMouseEventsService;
    let viewCubeController: ViewCubeController;
    let $element;

    afterEach(() => {
        jest.resetAllMocks();
    });

    beforeEach(() => {
        mockDependencies();
        buildController();
    });

    function mockDependencies() {
        rootScopeServiceMock = getService<IRootScopeService>(
            "rootScopeService"
        );
        threeOrbitControlsServiceMock = getService<ThreeOrbitControlsService>(
            "threeOrbitControlsService"
        );
        viewCubeMouseEventsServiceMock = getService<ViewCubeMouseEventsService>(
            "viewCubeMouseEventsService"
        );
        // Vermutlich falscher Weg $element zu mocken
        $element = [];
    }

    function buildController() {
        viewCubeController = new ViewCubeController(
            $element,
            rootScopeServiceMock,
            threeOrbitControlsServiceMock,
            viewCubeMouseEventsServiceMock
        );
    }

    it("initCube should add a cubeGroup to the scene", () => {
        ViewCubemeshGenerator.buildCube = jest.fn(() => {
            return {
                group: "group",
                front: "front",
                middle: "middle",
                back: "back"
            };
        });

        viewCubeController["initCube"]();

        expect(ViewCubemeshGenerator.buildCube).toBeCalled();
    });
});
