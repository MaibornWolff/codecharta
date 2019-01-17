import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper";
import { IRootScopeService } from "angular";
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService";
import { ViewCubeMouseEventsService } from "./viewCube.mouseEvents.service";
import { ViewCubeController } from "./viewCube.component";

describe("ViewCubeController", () => {
    let rootScopeServiceMock: IRootScopeService;
    let threeOrbitControlsServiceMock: ThreeOrbitControlsService;
    let viewCubeMouseEventsServiceMock: ViewCubeMouseEventsService;

    afterEach(() => {
        jest.resetAllMocks();
    });

    beforeEach(() => {
        restartSystem();
    });

    function restartSystem() {
        instantiateModule("app.codeCharta.ui.viewCube");

        rootScopeServiceMock = getService("rootScopeService");
        threeOrbitControlsServiceMock = getService("threeOrbitControlsService");
        viewCubeMouseEventsServiceMock = getService(
            "viewCubeMouseEventsService"
        );
    }

    function rebuildController() {
        viewCubeController = new ViewCubeController(
            $element,
            rootScopeServiceMock,
            threeOrbitControlsServiceMock,
            viewCubeMouseEventsServiceMock
        );
    }
});
