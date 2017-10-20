import "./data.module.ts";
import angular from "angular";
import {CodeMap} from "./model/CodeMap";
import {TEST_FILE_DATA, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B} from "./data.mocks.ts";
import {DeltaCalculatorService} from "./data.deltaCalculator.service";

/**
 * @test {DataService}
 */
describe("app.codeCharta.core.data.dataService", function() {

    let a: CodeMap;
    let b: CodeMap;
    let deltaCalculatorService: DeltaCalculatorService;

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.module("app.codeCharta.core.data"));

    //noinspection TypeScriptUnresolvedVariable
    beforeEach(angular.mock.inject(function (_deltaCalculatorService_) {deltaCalculatorService = _deltaCalculatorService_;}));

    beforeEach(function() {
        a = TEST_DELTA_MAP_A;
        b = TEST_DELTA_MAP_B;
    });

    it("should result in expected delta maps", ()=>{

        deltaCalculatorService.decorateMapsWithDeltas(a, b);

        expect(a.root.children[0].deltas["rloc"]).toBe(80);
        expect(b.root.children[0].deltas["rloc"]).toBe(-80);

        expect(a.root.children[1].children[0].deltas["more"]).toBe(undefined);
        expect(b.root.children[2].children[0].deltas["more"]).toBe(20);

        expect(b.root.children[2].children[1].deltas["mcc"]).toBe(undefined);
        expect(a.root.children[1].children[1].deltas["mcc"]).toBe(10);

        expect(b.root.children[1].deltas).toBe(undefined);

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

