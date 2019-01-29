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
describe("app.codeCharta.core.data.deltaCalculatorService", function() {

    let a: CodeMap;
    let b: CodeMap;
    let deltaCalculatorService: DeltaCalculatorService;

    beforeEach(NGMock.mock.module("app.codeCharta.core.data"));

    beforeEach(NGMock.mock.inject(function (_deltaCalculatorService_) {deltaCalculatorService = _deltaCalculatorService_;}));

    beforeEach(function() {
        a = JSON.parse(JSON.stringify(TEST_DELTA_MAP_A));
        b = JSON.parse(JSON.stringify(TEST_DELTA_MAP_B));
    });

    function decorate(map: CodeMap) {
        let dds = new DataDecoratorService();
        dds.decorateMapWithPathAttribute(map);
        dds.decorateMapWithOriginAttribute(map);
    }

    it("golden test", ()=>{

        a.nodes.children.push({
            name: "onlyA",
            type: "Folder",
            attributes: {},
            path: "/root/onlyA",
            children: [
                {
                    name: "special",
                    type: "Folder",
                    attributes: {},
                    path: "/root/onlyA/special",
                    children: [
                        {
                            name: "unicorn",
                            type: "File",
                            attributes: { "special": 42 },
                            path: "/root/onlyA/special/unicorn"
                        }
                    ]
                }
            ]
        });

        b.nodes.children.push({
            name: "onlyA",
            type: "Folder",
            attributes: {},
            path: "/root/onlyA",
            children: [
                {
                    name: "special",
                    type: "Folder",
                    attributes: {},
                    path: "/root/onlyA/special",
                    children: [
                        {
                            name: "Narwal",
                            type: "File",
                            attributes: {"monster": 666 },
                            path: "/root/onlyA/special/Narwal"
                        }
                    ]
                }
            ]
        });

        decorate(a);
        decorate(b);

        deltaCalculatorService.provideDeltas(a,b);

        expect(a.nodes.children[2].children[0].children[0].attributes["special"]).toBe(42);
        expect(a.nodes.children[2].children[0].children[1].attributes["monster"]).toBe(0);
        expect(b.nodes.children[3].children[0].children[0].attributes["monster"]).toBe(666);
        expect(b.nodes.children[3].children[0].children[1].attributes["special"]).toBe(0);
    });


    it("should remove all nodes with other origin than itself", ()=>{
        a.nodes.children[0].origin = "something else"
        a.nodes.children[1].origin = a.fileName;
        deltaCalculatorService.removeCrossOriginNodes(a);
        let h = d3.hierarchy(a.nodes);
        h.each((node)=>{
            expect(node.data.origin === a.fileName);
        });
    });

    it("fill maps should return input maps when a map does not exist", ()=>{
        decorate(a);
        decorate(b);

        let na = null;
        let nb = JSON.parse(JSON.stringify(b));

        deltaCalculatorService.provideDeltas(na, nb);

        expect(na).toBe(null);
        expect(nb).toEqual(b);

    });

    it("fill maps should return input maps when a map has no root", ()=>{
        decorate(a);
        decorate(b);

        a.nodes = null;
        let na = JSON.parse(JSON.stringify(a));
        let nb = JSON.parse(JSON.stringify(b));

        deltaCalculatorService.provideDeltas(na, nb);

        expect(na).toEqual(a);
        expect(nb).toEqual(b);

    });

    it("additionalLeaf from map b should exist in a after calling fillMapsWithNonExistingNodesFromOtherMap, metrics should be 0", ()=>{
        decorate(a);
        decorate(b);

        a.nodes.children[0].origin = "hallo";

        deltaCalculatorService.provideDeltas(a, b);

        expect(a.nodes.children[2].name).toBe("additional leaf");
        expect(b.nodes.children[1].name).toBe("additional leaf");

        expect(a.nodes.children[2].attributes.rloc).toBe(0);
        expect(b.nodes.children[1].attributes.rloc).toBe(10);

    });

    it("should result in expected delta maps", ()=>{
        decorate(a);
        decorate(b);

        deltaCalculatorService.provideDeltas(a, b);

        expect(a.nodes.children[0].deltas["rloc"]).toBe(80);
        expect(b.nodes.children[0].deltas["rloc"]).toBe(-80);

        expect(a.nodes.children[1].children[0].deltas["more"]).toBe(undefined);
        expect(b.nodes.children[2].children[0].deltas["more"]).toBe(20);

        expect(b.nodes.children[2].children[1].deltas["mcc"]).toBe(undefined);
        expect(a.nodes.children[1].children[1].deltas["mcc"]).toBe(10);

        expect(b.nodes.children[2].deltas).toBe(undefined);

    });

    it("checking delta calculation between two attribute lists", () => {

        let a = {"a":100,"b":10,"c":1};
        let b = {"a":110,"b":11,"c":0};
        let c = {"a":110,"b":11,"c":0, "d":10};
        let d = {"a":110,"b":11};
        let e = {"d":110,"e":11};

        let sut = deltaCalculatorService;

        let ab: any = sut.calculateAttributeListDelta(a,b);
        expect(ab.a).toBe(b.a-a.a);
        expect(ab.b).toBe(b.b-a.b);
        expect(ab.c).toBe(b.c-a.c);

        let ac: any = sut.calculateAttributeListDelta(a,c);
        expect(ac.a).toBe(c.a-a.a);
        expect(ac.b).toBe(c.b-a.b);
        expect(ac.c).toBe(c.c-a.c);
        expect(ac.d).toBe(c.d);

        let ad: any = sut.calculateAttributeListDelta(a,d);
        expect(ad.a).toBe(d.a-a.a);
        expect(ad.b).toBe(d.b-a.b);
        expect(ad.c).toBe(undefined);

        let ae: any = sut.calculateAttributeListDelta(a,e);
        expect(ae.a).toBe(undefined);
        expect(ae.b).toBe(undefined);
        expect(ae.c).toBe(undefined);
        expect(ae.d).toBe(e.d);
        expect(ae.e).toBe(e.e);

    });

});

