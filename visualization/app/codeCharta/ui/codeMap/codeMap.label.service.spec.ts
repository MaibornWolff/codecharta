import {CodeMapLabelService} from "./codeMap.label.service";
import {node} from "./rendering/node";
import {renderSettings} from "./rendering/renderSettings";
import {Vector3} from "three";
import {ThreeOrbitControlsService} from "./threeViewer/threeOrbitControlsService";
import {ThreeCameraService} from "./threeViewer/threeCameraService";
import {ThreeSceneService} from "./threeViewer/threeSceneService";
import {IRootScopeService} from "angular";
import {getService} from "../../../../mocks/ng.mockhelper";

describe("CodeMapLabelService", () => {

    let services, codeMapLabelService: CodeMapLabelService;
    let createElementOrigin;
    let sampleRenderSettings: renderSettings;
    let sampleLeaf: node;
    let canvasCtxMock;

    beforeEach(() => {
        setServices();
        withMockedEventMethods();
        withMockedThreeCameraService();
        withMockedThreeSceneService();
        rebuild();
        setCanvasRenderSettings();
    });

    function setServices() {
        services = {
            $rootScope: getService<IRootScopeService>("$rootScope"),
            threeCameraService: new ThreeCameraService(),
            threeSceneService: new ThreeSceneService(),
            threeOrbitControlsService: ThreeOrbitControlsService,
        };

        services.threeOrbitControlsService = new ThreeOrbitControlsService(services.threeCameraService, services.threeSceneService, services.$rootScope);
    }

    function rebuild() {
        codeMapLabelService = new CodeMapLabelService(
            services.threeOrbitControlsService,
            services.threeCameraService,
            services.threeSceneService
        );
    }

    function withMockedEventMethods() {
        services.$rootScope.$on = jest.fn();
        services.$rootScope.$broadcast = jest.fn();
    }

    function withMockedThreeCameraService() {
        services.threeCameraService = jest.fn<ThreeCameraService>(()=>{
            return {
                camera: {
                    position: {
                        distanceTo: jest.fn()
                    }
                }
            }
        })();
    }

    function withMockedThreeSceneService() {
        services.threeSceneService = jest.fn<ThreeSceneService>(()=>{
            return {
                mapGeometry: jest.fn(),
                labels: {
                    add: jest.fn(),
                    children: jest.fn()
                }
            }
        })();
    }

    function setCanvasRenderSettings() {

        sampleRenderSettings = {
            heightKey: "a",
            colorKey: "b",
            renderDeltas: false,
            colorRange: {
                from: 1,
                to: 2,
                flipped: false
            },
            mapSize: 500,
            deltaColorFlipped: false
        };

        sampleLeaf = {
            name: "sample",
            width: 1,
            height: 2,
            length: 3,
            depth: 4,
            x0: 5,
            z0: 6,
            y0: 7,
            isLeaf: true,
            deltas: {"a":1, "b":2},
            attributes: {"a":20, "b":15},
            children: [],
            isDelta: false
        };

        canvasCtxMock = {
            font: "",
            measureText: jest.fn(),
            fillRect: jest.fn(),
            fillText: jest.fn(),
            strokeRect: jest.fn()
        };

        createElementOrigin = document.createElement;

        document.createElement = ()=>{
            return {
                getContext: ()=>{
                    return canvasCtxMock;
                }
            };
        };

        canvasCtxMock.measureText.mockReturnValue({width: 10});

    }

    afterEach(()=>{
        document.createElement = createElementOrigin;
    });

    it("should have no labels stored after construction", ()=>{
        expect(codeMapLabelService.labels.length).toBe(0);
    });

    it("addLabel should add label if node has a height attribute mentioned in renderSettings", ()=>{
        codeMapLabelService.addLabel(sampleLeaf, sampleRenderSettings);
        expect(codeMapLabelService.labels.length).toBe(1);
    });

    it("addLabel should not add label if node has not a height attribute mentioned in renderSettings", ()=>{
        sampleLeaf.attributes = {"notsome": 0};
        sampleRenderSettings.heightKey = "some";
        codeMapLabelService.addLabel(sampleLeaf, sampleRenderSettings);
        expect(codeMapLabelService.labels.length).toBe(0);
    });

    it("addLabel should calculate correct height without delta", ()=>{
        codeMapLabelService.addLabel(sampleLeaf, sampleRenderSettings);
        let positionWithoutDelta: Vector3 = codeMapLabelService.labels[0].sprite.position;
        expect(positionWithoutDelta.y).toBe(93);
    });

    it("clearLabel should clear parent in scene and internal labels", ()=>{
        codeMapLabelService.clearLabels();
        expect(codeMapLabelService.threeSceneService.labels.children.length).toBe(0);
        expect(codeMapLabelService.labels.length).toBe(0);
    });

    it("scaling existing labels should scale their position correctly", ()=>{

        const SX = 1;
        const SY = 2;
        const SZ = 3;

        codeMapLabelService.addLabel(sampleLeaf, sampleRenderSettings);
        codeMapLabelService.addLabel(sampleLeaf, sampleRenderSettings);

        const scaleBeforeA: Vector3 = new Vector3(
            codeMapLabelService.labels[0].sprite.position.x,
            codeMapLabelService.labels[0].sprite.position.y,
            codeMapLabelService.labels[0].sprite.position.z
        );

        const scaleBeforeB: Vector3 = new Vector3(
            codeMapLabelService.labels[1].sprite.position.x,
            codeMapLabelService.labels[1].sprite.position.y,
            codeMapLabelService.labels[1].sprite.position.z
        );

        codeMapLabelService.scale(SX,SY,SZ);

        const scaleAfterA: Vector3 = codeMapLabelService.labels[0].sprite.position;
        const scaleAfterB: Vector3 = codeMapLabelService.labels[1].sprite.position;

        expect(scaleAfterA.x).toBe(scaleBeforeA.x * SX);
        expect(scaleAfterA.y).toBe(scaleBeforeA.y * SY);
        expect(scaleAfterA.z).toBe(scaleBeforeA.z * SZ);

        expect(scaleAfterB.x).toBe(scaleBeforeB.x * SX);
        expect(scaleAfterB.y).toBe(scaleBeforeB.y * SY);
        expect(scaleAfterB.z).toBe(scaleBeforeB.z * SZ);

    });

});