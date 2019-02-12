import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper";
import { IRootScopeService } from "angular";
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService";
import { ViewCubeMouseEventsService } from "./viewCube.mouseEvents.service";
import { ViewCubeController } from "./viewCube.component";
import * as THREE from "three";

describe("ViewCubeController", () => {
    let rootScopeService: IRootScopeService;
    let threeOrbitControlsService: ThreeOrbitControlsService;
    let viewCubeMouseEventsService: ViewCubeMouseEventsService;
    let viewCubeController: ViewCubeController;
    let $element;

    beforeEach(() => {
        getDependencies();
        buildController();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    function getDependencies() {
        rootScopeService = getService<IRootScopeService>("rootScopeService");
        threeOrbitControlsService = getService<ThreeOrbitControlsService>(
            "threeOrbitControlsService"
        );
        viewCubeMouseEventsService = getService<ViewCubeMouseEventsService>(
            "viewCubeMouseEventsService"
        );
    }

    function buildController() {
        viewCubeController = new ViewCubeController(
            $element,
            rootScopeService,
            threeOrbitControlsService,
            viewCubeMouseEventsService
        );
    }

    it("onCameraChanged should be triggered", () => {
        const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
        camera.position.set(10, 20, 30);
        const expected = new THREE.Vector3(1, 2, 3);

        viewCubeController.onCameraChanged(camera);

        expect(viewCubeController["camera"].position).toBe(expected);
    });
});
