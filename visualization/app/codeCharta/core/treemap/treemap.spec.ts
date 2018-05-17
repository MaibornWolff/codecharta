import {TreeMapService, ValuedCodeMapNode} from "./treemap.service";
import {CodeMapNode} from "../data/model/CodeMap";
import {node} from "../../ui/codeMap/rendering/node";
import {DataService} from "../data/data.service";

describe("tdd", ()=> {

    let treeMapService: TreeMapService;
    let root: CodeMapNode;
    let dataServiceMock: DataService;

    beforeEach(()=>{
        dataServiceMock = {
            getMaxMetricInAllRevisions: jest.fn()
        };
        treeMapService = new TreeMapService(dataServiceMock);
        root = new CodeMapNode("root");
        root.attributes = {
            "mcc": 1,
            "fun": 10,
            "lin": 100,
        };
        root.path = "/";
    });

    xit("only root node", ()=> {
        dataServiceMock.getMaxMetricInAllRevisions.mockReturnValue(1000);
        let node: node = treeMapService.createTreemapNodes(root, 100, 200, 0, "fun", "mcc");
    });

    xit("root node with two direct children", ()=> {

        dataServiceMock.getMaxMetricInAllRevisions.mockReturnValue(1000);

        let firstChild = new CodeMapNode("firstChild");
        firstChild.attributes = root.attributes;

        let secondChild = new CodeMapNode("secondChild");
        secondChild.attributes = root.attributes;

        root.children = [firstChild, secondChild];

        let node: node = treeMapService.createTreemapNodes(root, 100, 200, 0, "fun", "mcc")

        console.log(node);

    });

    it("value root node with two direct children and some grand children", ()=> {

        dataServiceMock.getMaxMetricInAllRevisions.mockReturnValue(1000);

        let firstChild = new CodeMapNode("firstChild");
        firstChild.attributes = root.attributes;

        let firstGrandChild = new CodeMapNode("firstGrandChild");
        firstGrandChild.attributes = root.attributes;

        let secondGrandChild = new CodeMapNode("secondGrandChild");
        secondGrandChild.attributes = root.attributes;

        firstChild.children = [firstGrandChild, secondGrandChild];

        let secondChild = new CodeMapNode("secondChild");
        secondChild.attributes = root.attributes;

        root.children = [firstChild, secondChild];

        let valued: ValuedCodeMapNode = treeMapService.valueCodeMapNodes(root, "fun");

        console.log(valued);

    });


});

