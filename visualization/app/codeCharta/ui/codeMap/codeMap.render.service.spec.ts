import {CodeMapRenderService} from "./codeMap.render.service";
import {ThreeSceneService} from "./threeViewer/threeSceneService";
import {SettingsService} from "../../core/settings/settings.service";
import {TreeMapService} from "../../core/treemap/treemap.service";
import {DataService} from "../../core/data/data.service";
import {node} from "./rendering/node";
import {CodeMapUtilService} from "./codeMap.util.service";
import {CodeMapNode} from "../../core/data/model/CodeMap";


describe("renderService", () => {

    let renderService: CodeMapRenderService;
    let node: CodeMapNode;
    let threeSceneService: ThreeSceneService;
    let treeMapService: TreeMapService;
    let dataService: DataService;
    let simpleHierarchy: CodeMapNode;
    let codeMapUtilService: CodeMapUtilService;
    let settingsServiceMock: SettingsService;
    let $rootScope;
    let settingsService;//: SettingsService;

    beforeEach(() => {
        mockEverything();
    });


    function mockEverything(){
        $rootScope = {
            $on: jest.fn()
        };

        settingsService = {
            urlService: jest.fn(),
            dataService: jest.fn(),
            $rootScope,
            threeOrbitControlsService: jest.fn(),
            subscribe: jest.fn()
        };
        const neutralColorRange =jest.fn<Range>(() => ( {
            from: 0,
            to: 1,
            flipped: true
        }));

        simpleHierarchy = {
            name: "root",
            type: "Folder",
            path: "/root",
            attributes: {},
            children: [
                {
                    name: "a",
                    type: "Folder",
                    path: "/root/a",
                    attributes: {},
                    children: [
                        {
                            name: "ab",
                            type: "Folder",
                            path: "/root/a/ab",
                            attributes: {},
                            children: [
                                {
                                    name: "aba",
                                    path: "/root/a/ab/aba",
                                    type: "File",
                                    attributes: {},
                                    children: []
                                }
                            ]
                        },
                    ]
                }
            ]
        };

        const SettingsServiceMock = jest.fn<SettingsService>(() => ({
            subscribe: jest.fn(),
            applySettings: jest.fn(),
            settings: {
                areaMetric: "areaMetric",
                heightMetric: "heightMetric",
                colorMetric: "colorMetric",
                neutralColorRange: neutralColorRange,
                invertHeight: true,
                deltaColorFlipped: true,
                map: {
                root: simpleHierarchy
                },
                scaling: {
                    x: 1,
                    y: 1,
                    z: 1
                }
            }
        }));

        settingsServiceMock = new SettingsServiceMock();



        codeMapUtilService = new CodeMapUtilService(settingsServiceMock);


        renderService = new CodeMapRenderService(threeSceneService,treeMapService,$rootScope,settingsService)
    }


    describe("Building behaviour", () => {

        it("Collect nodes", ()=>{
             node=  codeMapUtilService.getCodeMapNodeFromPath("/root", "File");

            let nodes =  renderService.collectNodesToArray(node);

            expect(nodes[0]).toBe(node);
            expect(nodes[1]).toBe(node.children[0]);
        });


        it("Update geometry", ()=>{
            renderService.updateMapGeometry = jest.fn();
            renderService.scaleMap = jest.fn();
            let x = settingsServiceMock.settings.scaling.x;
            let y = settingsServiceMock.settings.scaling.y;
            let z = settingsServiceMock.settings.scaling.z;

            renderService.applySettings(settingsServiceMock.settings);


            expect(renderService.updateMapGeometry).toHaveBeenCalledWith(settingsServiceMock.settings);
            expect(renderService.scaleMap).toHaveBeenCalledWith(x,y,z);
        });
    });

});