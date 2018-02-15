import "./data.module";
import {NGMock} from "../../../ng.mockhelper";
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

    describe("decorateEmptyAttributeLists",() => {

        it("all nodes should have an attribute list", ()=>{
            a.root.children[0].attributes = undefined
            dataDecoratorService.decorateEmptyAttributeLists(a, ["some", "metrics"]);
            let h = d3.hierarchy(a.root);
            h.each((node)=>{
                expect(node.data.attributes).toBeDefined();
            });
        });

        it("all nodes should have an attribute list with listed and available metrics", ()=>{
            dataDecoratorService.decorateEmptyAttributeLists(a, ["rloc", "functions"]);
            let h = d3.hierarchy(a.root);
            h.each((node)=>{
                expect(node.data.attributes).toBeDefined();
                expect(node.data.attributes["rloc"]).toBeDefined();
                expect(node.data.attributes["functions"]).toBeDefined();
            });
        });

        it("folders should have mean attributes of children", ()=>{
            dataDecoratorService.decorateEmptyAttributeLists(a, ["rloc", "functions"]);
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

});

