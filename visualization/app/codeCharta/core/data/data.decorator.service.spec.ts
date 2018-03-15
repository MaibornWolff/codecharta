import "./data.module";
import {NGMock} from "../../../../mocks/ng.mockhelper";
import DoneCallback = jest.DoneCallback;
import {CodeMap} from "./model/CodeMap";
import {TEST_FILE_DATA, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B} from "./data.mocks";
import {DeltaCalculatorService} from "./data.deltaCalculator.service";
import {DataDecoratorService} from "./data.decorator.service";
import * as d3 from "d3";

/**
 * @test {DataService}
 */
describe("app.codeCharta.core.data.dataService", () => {

    let a: CodeMap;
    let b: CodeMap;
    let dataDecoratorService: DataDecoratorService;

    beforeEach(function() {
        a = JSON.parse(JSON.stringify(TEST_DELTA_MAP_A));
        b = JSON.parse(JSON.stringify(TEST_DELTA_MAP_B));
        dataDecoratorService = new DataDecoratorService();
    });

    describe("decorateLeavesWithMissingMetrics", () => {

        it("leaves should have all metrics", ()=>{
            dataDecoratorService.decorateLeavesWithMissingMetrics([a, b],["some", "metrics", "rloc", "functions", "mcc"]);
            let h = d3.hierarchy(a.root);
            h.leaves().forEach((node)=>{
                expect(node.data.attributes).toBeDefined();
                expect(node.data.attributes.some).toBe(0);
                expect(node.data.attributes.metrics).toBe(0);
                expect(node.data.attributes.rloc).toBeDefined();
                expect(node.data.attributes.functions).toBeDefined();
                expect(node.data.attributes.mcc).toBeDefined();
            });
        });

        it("leaves should have all metrics even if some attributesLists are undefined", ()=>{
            a.root.children[0].attributes = undefined;
            dataDecoratorService.decorateLeavesWithMissingMetrics([a, b],["some", "metrics", "rloc", "functions", "mcc"]);
            let h = d3.hierarchy(a.root);
            h.leaves().forEach((node)=>{
                expect(node.data.attributes).toBeDefined();
                expect(node.data.attributes.some).toBe(0);
                expect(node.data.attributes.metrics).toBe(0);
                expect(node.data.attributes.rloc).toBeDefined();
                expect(node.data.attributes.functions).toBeDefined();
                expect(node.data.attributes.mcc).toBeDefined();
            });
        });

    });

    describe("decorateParentNodesWithMeanAttributesOfChildren",() => {

        it("all nodes should have an attribute list with all possible metrics", ()=>{
            a.root.children[0].attributes = undefined;
            a.root.children[1].attributes = { "some": 1 };
            dataDecoratorService.decorateLeavesWithMissingMetrics([a],["some", "metrics", "rloc", "functions", "mcc"]);
            dataDecoratorService.decorateParentNodesWithMeanAttributesOfChildren([a], ["some", "metrics", "rloc", "functions", "mcc"]);
            let h = d3.hierarchy(a.root);
            h.each((node)=>{
                expect(node.data.attributes).toBeDefined();
                expect(node.data.attributes.some).toBeDefined();
                expect(node.data.attributes.metrics).toBeDefined();
            });
        });

        it("all nodes should have an attribute list with listed and available metrics", ()=>{
            dataDecoratorService.decorateLeavesWithMissingMetrics([a],["rloc", "functions"]);
            dataDecoratorService.decorateParentNodesWithMeanAttributesOfChildren([a], ["rloc", "functions"]);
            let h = d3.hierarchy(a.root);
            h.each((node)=>{
                expect(node.data.attributes).toBeDefined();
                expect(node.data.attributes["rloc"]).toBeDefined();
                expect(node.data.attributes["functions"]).toBeDefined();
            });
        });

        it("folders should have mean attributes of children", ()=>{
            dataDecoratorService.decorateLeavesWithMissingMetrics([a],["rloc", "functions"]);
            dataDecoratorService.decorateParentNodesWithMeanAttributesOfChildren([a], ["rloc", "functions"]);
            let h = d3.hierarchy(a.root);
            expect(h.data.attributes["rloc"]).toBeCloseTo(200/3, 1);
            expect(h.children[0].data.attributes["rloc"]).toBe(100);
            expect(h.data.attributes["functions"]).toBe(370);
        });

    });

    describe("decorateMapWithOriginAttribute",() => {

        it("all nodes should have an origin", ()=>{
            a.root.children[0].origin = undefined
            dataDecoratorService.decorateMapWithOriginAttribute(a);
            let h = d3.hierarchy(a.root);
            h.each((node)=>{
                expect(node.data.origin).toBeDefined();
            });
        });

    });

    describe("decorateMapWithUnaryMetric",() => {

        it("maps with no attribute nodes should be accepted and an attributes member added", ()=>{

            let cm: CodeMap = {
                fileName: "a",
                projectName: "b",
                root: {
                    name: "a node"
                }
            };

            dataDecoratorService.decorateMapWithUnaryMetric(cm);

            let h = d3.hierarchy(cm.root);

            h.each((node)=>{
                expect(node.data.attributes["unary"]).toBeDefined();
            });

        });

        it("all nodes should have a unary attribute", ()=>{
            a.root.children[0].attributes = {};
            dataDecoratorService.decorateMapWithUnaryMetric(a);
            let h = d3.hierarchy(a.root);
            h.each((node)=>{
                expect(node.data.attributes["unary"]).toBeDefined();
            });
        });

    });


    describe("decorateMapWithPathAttribute",() => {

        it("should have the correct path", ()=>{

            let cm: CodeMap = {
                fileName: "a",
                projectName: "b",
                root: {
                    name: "a node",
                    children: [
                        {
                            name: "b node"
                        },
                        {
                            name: "c node",
                            children: [
                                {
                                    name: "d node",
                                }
                            ]
                        }
                    ]
                }
            };

            dataDecoratorService.decorateMapWithPathAttribute(cm);

            let h = d3.hierarchy(cm.root);

            h.each((node)=>{
                expect(node.data.path).toBeDefined();
            });

            expect(cm.root.path).toBe("/a node");
            expect(cm.root.children[1].children[0].path).toBe("/a node/c node/d node");

        });


    });

});

