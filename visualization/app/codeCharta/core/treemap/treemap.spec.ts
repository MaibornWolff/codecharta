import {SquarifiedValuedCodeMapNode, TreeMapService, ValuedCodeMapNode} from "./treemap.service";
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

    it("value+squarify root node with two direct children and some grand children", ()=> {

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
        let squarified: SquarifiedValuedCodeMapNode = treeMapService.squarify(valued, 6, 6);

        console.log(squarified);

    });

    describe("CodeMap value calculation", ()=> {

        it("attribute exists, no children", ()=> {
            let root = {name: "root"};
            root.attributes = {a:100};
            expect(root.calculateValue("a")).toBe(100);
        });

        it("attribute do not exists, no children", ()=> {
            let root = {name: "root"};
            root.attributes = {a:100};
            expect(root.calculateValue("b")).toBe(0);
        });

        it("attribute do not exists, multiple children with non existant attributes", ()=> {
            let root = {name: "root"};
            let firstChild = {name: "firstChild"};
            let secondChild = {name: "secondChild"};
            root.children = [firstChild, secondChild];
            expect(root.calculateValue("a")).toBe(0);
        });

        it("attribute do not exists, multiple children with existant attributes", ()=> {
            let root = {name: "root"};
            let firstChild = {name: "firstChild"};
            firstChild.attributes = {a:100};
            let secondChild = {name: "secondChild"};
            secondChild.attributes = {a:200};
            root.children = [firstChild, secondChild];
            expect(root.calculateValue("a")).toBe(300);
        });

        it("attribute do not exists, multiple children with some existant attributes", ()=> {
            let root = {name: "root"};
            let firstChild = {name: "firstChild"};
            firstChild.attributes = {a:100};
            let secondChild = {name: "secondChild"};
            root.children = [firstChild, secondChild];
            expect(root.calculateValue("a")).toBe(100);
        });

        it("attribute exists, multiple children with existant attributes", ()=> {
            let root = {name: "root"};
            root.attributes = {a:99};
            let firstChild = {name: "firstChild"};
            firstChild.attributes = {a:100};
            let secondChild = {name: "secondChild"};
            secondChild.attributes = {a:200};
            root.children = [firstChild, secondChild];
            expect(root.calculateValue("a")).toBe(300);
        });

    });


});

