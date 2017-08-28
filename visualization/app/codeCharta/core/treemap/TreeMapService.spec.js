require("./treemap.js");

const createData = function(){
    const data = {
        "t": "root",
        "color": "transparent",
        "children": [
            {
                "t": "big leaf",
                "stuff": 10,
                "color": "red",
            },
            {
                "t": "01",
                "color": "transparent",
                "children": [
                    {
                        "t": "small leaf",
                        "color": "blue",
                        "stuff": 5
                    },
                    {
                        "t": "other small leaf",
                        "color": "purple",
                        "stuff": 5
                    }
                ]
            }
        ]
    };
    return data;
};

/**
 * @test {TreeMapService}
 */
describe("app.codeCharta.core.treemap.treemapService", function() {

    var treeMapService, data;

    beforeEach(angular.mock.module("app.codeCharta.core.treemap"));
    beforeEach(()=>{data = createData();});
    beforeEach(angular.mock.inject(function (_treeMapService_) {treeMapService = _treeMapService_;}));

    /**
     * @test {TreeMapService#constructor}
     */
    it("should retrieve instance", ()=>{
        expect(treeMapService).to.not.equal(undefined);
    });

    /**
     * @test {TreeMapService#createTreemapNodes}
     */
    describe("#createTreemapNodes(data, w, l, p, areaKey, heightKey)", function() {

        it("TBD: filter invisible nodes", ()=> {
            //TODO
        });

        it("TBD: mark leaf notes with isLeaf = true", ()=> {
            var data = {
                name:"root",
                children: [
                    {
                        name:"leaf1",
                        children: [],
                        attributes: {"Statements": 30, "Functions": 100, "Average Complexity*": 100}
                    },
                    {
                        name:"leaf2",
                        children: [],
                        attributes: {"Statements": 30, "Functions": 100, "Average Complexity*": 100}
                    },
                    {
                        name:"parent",
                        children: [
                            {
                                name:"leaf3",
                                children: [],
                                attributes: {"Statements": 30, "Functions": 100, "Average Complexity*": 100}
                            }
                        ]
                    }
                ]
            };

            var result = treeMapService.createTreemapNodes(data, 100, 100, 1, "Functions", "Statements");

            result.forEach((node)=>{

                switch(node.name) {
                    case "parent":
                    case "root":
                        expect(node.isLeaf).to.be.false;
                        break;
                    default:
                        expect(node.isLeaf).to.be.true;
                }

            });

        });

        it("TBD: empty data", ()=> {
            //TODO
        });

        it("TBD: test data", ()=> {
            //TODO
        });

    });

    /**
     * @test {TreeMapService#getArea}
     */
    describe("#getArea(node, areaKey)", function() {

        it("extract area by areaKey from node: node with no attributes", ()=> {
            let node = {};
            let area = treeMapService.getArea(node, "some key");
            expect(area).to.equal(0);
        });

        it("node with empty attributes", ()=> {
            let node = {attributes: {}};
            let area = treeMapService.getArea(node, "some key");
            expect(area).to.equal(0);
        });

        it("node with some/empty attributes and empty children array", ()=> {
            let node = {attributes: {}, children:[]};
            let area = treeMapService.getArea(node, "some key");
            expect(area).to.equal(0);
        });

        it("node with matching attribute and empty children array", ()=> {
            let node = {attributes: {"somekey":"somevalue"}, children:[]};
            let area = treeMapService.getArea(node, "somekey");
            expect(area).to.equal("somevalue");
        });

        it("node with matching attribute, other attributes and empty children array", ()=> {
            let node = {attributes: {"somekey":"somevalue", "somekey2":"somevalue2"}, children:[]};
            let area = treeMapService.getArea(node, "somekey");
            expect(area).to.equal("somevalue");
        });

        it("node with matching attribute and no children array", ()=> {
            let node = {attributes: {"somekey":"somevalue"}};
            let area = treeMapService.getArea(node, "somekey");
            expect(area).to.equal("somevalue");
        });

    });

    /**
     * @test {TreeMapService#transformNode}
     */
    describe("#transformNode(node, heightKey, p)", function() {

        it("valid heightKey, is leaf node, p positive", ()=> {

            let node = {
                data: {
                    name: "some name",
                    attributes: {"somekey":20},
                    deltas: {"somedeltakey": -2},
                    link: "www.some-page.something"
                },
                x1: 10,
                x0: 5,
                y1: 15,
                y0: 5,
                isLeaf: true,
                depth: 2
            };

            let heightScale = 0.5;

            treeMapService.transformNode(node, "somekey", 15, heightScale, 2);

            // expect measures
            expect(node.width).to.equal(5);
            expect(node.height).to.equal(10);
            expect(node.length).to.equal(10);

            // expect new z values
            expect(node.z0).to.equal(30);
            expect(node.z1).to.equal(40);

            // expect node.data properties to be pushed to node
            expect(node.attributes["somekey"]).to.equal(20);
            expect(node.name).to.equal("some name");
            expect(node.deltas["somedeltakey"]).to.equal(-2);
            expect(node.link).to.equal("www.some-page.something");

            // expect node.data to be deleted
            expect(node.data).to.be.undefined;
            //TODO
        });

        it("TBD: valid heightKey, is leaf node, p negative", ()=> {

            let node = {
                data: {
                    name: "some name",
                    attributes: {"somekey":20},
                    deltas: {"somedeltakey": -42},
                    link: "www.some-page.something"
                },
                x1: 10,
                x0: 5,
                y1: 15,
                y0: 5,
                isLeaf: true,
                depth: 2
            };

            treeMapService.transformNode(node, "someinvalidkey", -15, 1, 2);

            //TODO what should really happen ?

        });

        it("valid heightKey, is not a leaf node, p positive", ()=> {

            let node = {
                data: {
                    name: "some name",
                    attributes: {"somekey":20},
                    deltas: {"somedeltakey": -42},
                    link: "www.some-page.something"
                },
                x1: 10,
                x0: 5,
                y1: 15,
                y0: 5,
                isLeaf: false,
                depth: 2
            };

            treeMapService.transformNode(node, "somekey", 15, 1, 2);

            expect(node.height).to.equal(15)

        });

        it("TBD: invalid heightKey, is leaf node, p positive", ()=> {

            let node = {
                data: {
                    name: "some name",
                    attributes: {"somekey":20},
                    deltas: {"somedeltakey": -42},
                    link: "www.some-page.something"
                },
                x1: 10,
                x0: 5,
                y1: 15,
                y0: 5,
                isLeaf: true,
                depth: 2
            };

            treeMapService.transformNode(node, "someinvalidkey", 15, 1, 2);

            //TODO what should really happen ?

        });

    });

});

