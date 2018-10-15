import {SquarifiedValuedCodeMapNode, TreeMapService, TreeMapSettings, ValuedCodeMapNode} from "./treemap.service";
import {CodeMapNode} from "../data/model/CodeMap";
import {node} from "../../ui/codeMap/rendering/node";
import {DataService} from "../data/data.service";

describe("treemap service", ()=> {

    let treeMapService: TreeMapService;
    let root: CodeMapNode;
    let dataServiceMock: DataService;
    let treemapSettings: TreeMapSettings;

    beforeEach(()=>{

        dataServiceMock = {
            getMaxMetricInAllRevisions: jest.fn()
        };

        dataServiceMock.getMaxMetricInAllRevisions.mockReturnValue(1000);

        treeMapService = new TreeMapService(dataServiceMock);

        root = { name: "root" };
        root.attributes = {
            "mcc": 1,
            "fun": 10,
            "lin": 100,
        };
        root.path = "/";

        treemapSettings = {
            size: 200,
            areaKey: "mcc",
            heightKey: "fun",
            margin: 0,
            invertHeight: false,
            visibleEdges: []
        };

    });

    it("only root node", ()=> {
        let node: node = treeMapService.createTreemapNodes(root, treemapSettings, null);
        expect(node).toMatchSnapshot();
    });

    it("root node with two direct children", ()=> {

        let firstChild = { name: "firstChild" };
        firstChild.attributes = root.attributes;

        let secondChild = { name: "secondChild" };
        secondChild.attributes = root.attributes;

        root.children = [firstChild, secondChild];

        let node: node = treeMapService.createTreemapNodes(root, treemapSettings, null);

        expect(node).toMatchSnapshot();

    });

    it("root node with two direct children and some grand children", ()=> {

        let firstChild = { name: "firstChild" };
        firstChild.attributes = root.attributes;

        let firstGrandChild = { name: "firstGrandChild" };
        firstGrandChild.attributes = root.attributes;

        let secondGrandChild = { name: "secondGrandChild" };
        secondGrandChild.attributes = root.attributes;

        firstChild.children = [firstGrandChild, secondGrandChild];

        let secondChild = { name: "secondChild" };
        secondChild.attributes = root.attributes;

        root.children = [firstChild, secondChild];

        let node: node = treeMapService.createTreemapNodes(root, treemapSettings, null);

        expect(node).toMatchSnapshot();

    });

    describe("CodeMap value calculation", ()=> {

        it("attribute exists, no children", ()=> {
            let root = {name: "root"};
            root.attributes = {a:100};
            let node: node = treeMapService.createTreemapNodes(root, treemapSettings, null);
            expect(node.attributes["a"]).toBe(100);
        });

        it("attribute do not exists, no children", ()=> {
            let root = {name: "root"};
            root.attributes = {};
            let node: node = treeMapService.createTreemapNodes(root, treemapSettings, null);
            expect(node.attributes["b"]).toBe(undefined);
        });

        it("attribute do not exists, multiple children with non existant attributes", ()=> {
            let root = {name: "root"};
            root.attributes = {};
            let firstChild = {name: "firstChild"};
            firstChild.attributes = {};
            let secondChild = {name: "secondChild"};
            secondChild.attributes = {};
            root.children = [firstChild, secondChild];
            treemapSettings.heightKey = "b";
            treemapSettings.areaKey = "b";
            let node: node = treeMapService.createTreemapNodes(root, treemapSettings, null);
            expect(node.attributes["b"]).toBe(undefined);
        });

        it("attribute do not exists, multiple children with existant attributes. should be undefined since it is not the job of the treemap service to add non existant attributes", ()=> {
            let root = {name: "root"};
            root.attributes = {};
            let firstChild = {name: "firstChild"};
            firstChild.attributes = {a:100};
            let secondChild = {name: "secondChild"};
            secondChild.attributes = {a:200};
            root.children = [firstChild, secondChild];
            expect(root.attributes["a"]).toBe(undefined);
        });

    });


});

