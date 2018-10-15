import {TreeMapService, TreeMapSettings} from "./treemap.service";
import {CodeMapNode} from "../data/model/CodeMap";
import {node} from "../../ui/codeMap/rendering/node";
import {DataService} from "../data/data.service";

describe("treemap service", ()=> {

    let treeMapService: TreeMapService;
    let dataServiceMock: DataService;

    beforeEach(()=>{
        dataServiceMock = {
            getMaxMetricInAllRevisions: jest.fn()
        };
        dataServiceMock.getMaxMetricInAllRevisions.mockReturnValue(1000);
        treeMapService = new TreeMapService(dataServiceMock);
    });

    function buildSampeTreemapSettings(): TreeMapSettings {
        return {
            size: 200,
            areaKey: "mcc",
            heightKey: "fun",
            margin: 0,
            invertHeight: false,
            visibleEdges: [],
            blacklist:[]
        };
    }

    function buildSampleAttributes() {
        return {
            "mcc": 1,
            "fun": 10,
            "lin": 100,
        };
    }

    function buildSimpleHierarchy() {
        let root: CodeMapNode = {
            name: "root",
            path: "/root",
            attributes: {},
            type: "Folder"
        };
        let firstChild: CodeMapNode = {
            name: "firstChild",
            path: root.path + "/firstChild",
            attributes: {},
            type: "File"
        };
        let secondChild: CodeMapNode = {
            name: "secondChild",
            path: root.path + "/secondChild",
            attributes: {},
            type: "File"
        };
        root.children = [firstChild, secondChild];
        return { root, firstChild, secondChild };
    }

    function buildComplexHierarchy() {
        let { root, firstChild, secondChild } = buildSimpleHierarchy();
        firstChild.type = "Folder"
        let firstGrandChild = { 
            name: "firstGrandChild", 
            path: firstChild.path+"/firstGrandChild", 
            attributes: root.attributes,
            type: "File"
        };

        let secondGrandChild = { 
            name: "secondGrandChild", 
            path: firstChild.path+"/secondGrandChild", 
            attributes: root.attributes,
            type: "File" 
        };

        firstChild.children = [firstGrandChild, secondGrandChild];
        return { root, firstChild, secondChild , firstGrandChild, secondGrandChild};
    }

    it("only root node", ()=> {
        let { root } = buildSimpleHierarchy();
        root.attributes = buildSampleAttributes();
        root.children = [];
        let node: node = treeMapService.createTreemapNodes(root, buildSampeTreemapSettings(), null);
        expect(node).toMatchSnapshot();
    });

    it("root node with two direct children", ()=> {
        let { root, firstChild, secondChild } = buildSimpleHierarchy();
        root.attributes = firstChild.attributes = secondChild.attributes = buildSampleAttributes();
        let node: node = treeMapService.createTreemapNodes(root, buildSampeTreemapSettings(), null);
        expect(node).toMatchSnapshot();
    });

    it("root node with two direct children and some grand children", ()=> {
        let { root, firstChild, secondChild, firstGrandChild, secondGrandChild } = buildComplexHierarchy();
        root.attributes = firstChild.attributes = secondChild.attributes = firstGrandChild.attributes = secondGrandChild.attributes = buildSampleAttributes();
        let node: node = treeMapService.createTreemapNodes(root, buildSampeTreemapSettings(), null);
        expect(node).toMatchSnapshot();
    });

    describe("CodeMap value calculation", ()=> {

        it("attribute exists, no children", ()=> {
            let { root } = buildSimpleHierarchy();
            root.children = [];
            root.attributes = {a:100};
            let node: node = treeMapService.createTreemapNodes(root, buildSampeTreemapSettings(), null);
            expect(node.attributes["a"]).toBe(100);
        });

        it("attribute do not exists, no children", ()=> {
            let { root } = buildSimpleHierarchy();
            root.children = [];
            let node: node = treeMapService.createTreemapNodes(root, buildSampeTreemapSettings(), null);
            expect(node.attributes["b"]).toBe(undefined);
        });

        it("attribute do not exists, multiple children with non existant attributes", ()=> {
            let { root  } = buildSimpleHierarchy();
            let treemapSettings = buildSampeTreemapSettings();
            treemapSettings.heightKey = "b";
            treemapSettings.areaKey = "b";
            let node: node = treeMapService.createTreemapNodes(root, treemapSettings, null);
            expect(node.attributes["b"]).toBe(undefined);
        });

        it("attribute do not exists, multiple children with existant attributes. should be undefined since it is not the job of the treemap service to add non existant attributes", ()=> {
            let { root } = buildSimpleHierarchy();
            expect(root.attributes["a"]).toBe(undefined);
        });

    });


});

