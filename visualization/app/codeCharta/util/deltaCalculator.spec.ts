import "../core/data/data.module";
import {DeltaCalculator} from "./deltaCalculator";
import {TEST_DELTA_MAP_A, TEST_DELTA_MAP_B} from "../core/data/data.mocks";
import {CCFile} from "../codeCharta.model";

describe("app.codeCharta.core.data.deltaCalculatorService", function() {

    let fileA: CCFile;
    let fileB: CCFile;

    beforeEach(function() {
        fileA = JSON.parse(JSON.stringify(TEST_DELTA_MAP_A));
        fileB = JSON.parse(JSON.stringify(TEST_DELTA_MAP_B));
    });

    it("golden test", ()=>{

        fileA.map.children.push({
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

        fileB.map.children.push({
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

        DeltaCalculator.getDeltaFile(fileA, fileB);

        expect(fileA.map.children[2].children[0].children[0].attributes["special"]).toBe(42);
        expect(fileA.map.children[2].children[0].children[1].attributes["monster"]).toBe(0);
        expect(fileB.map.children[3].children[0].children[0].attributes["monster"]).toBe(666);
        expect(fileB.map.children[3].children[0].children[1].attributes["special"]).toBe(0);
    });

    it("getDeltaFile should return input files if a file does not exist", ()=>{
        let na = null;
        let nb = JSON.parse(JSON.stringify(fileB));

        DeltaCalculator.getDeltaFile(na, nb);

        expect(na).toBe(null);
        expect(nb).toEqual(fileB);
    });

    it("getDeltaFile should return input files if a file has no root", ()=>{
        fileA.map = null;
        let na = JSON.parse(JSON.stringify(fileA));
        let nb = JSON.parse(JSON.stringify(fileB));

        DeltaCalculator.getDeltaFile(na, nb);

        expect(na).toEqual(fileA);
        expect(nb).toEqual(fileB);
    });

    it("additionalLeaf from fileB should exist in a after calling getDeltaFile, metrics should be 0", ()=>{
        fileA.map.children[0].origin = "hallo";

        DeltaCalculator.getDeltaFile(fileA, fileB);

        expect(fileA.map.children[2].name).toBe("additional leaf");
        expect(fileB.map.children[1].name).toBe("additional leaf");

        expect(fileA.map.children[2].attributes.rloc).toBe(0);
        expect(fileB.map.children[1].attributes.rloc).toBe(10);
    });

    it("getDeltaFile should result in expected deltaFiles", ()=>{
        DeltaCalculator.getDeltaFile(fileA, fileB);

        expect(fileA.map.children[0].deltas["rloc"]).toBe(80);
        expect(fileB.map.children[0].deltas["rloc"]).toBe(-80);

        expect(fileA.map.children[1].children[0].deltas["more"]).toBe(undefined);
        expect(fileB.map.children[2].children[0].deltas["more"]).toBe(20);

        expect(fileB.map.children[2].children[1].deltas["mcc"]).toBe(undefined);
        expect(fileA.map.children[1].children[1].deltas["mcc"]).toBe(10);

        expect(fileB.map.children[2].deltas).toBe(undefined);
    });

    it("checking delta calculation between two attribute lists", () => {
        let a = {"a":100,"b":10,"c":1};
        let b = {"a":110,"b":11,"c":0};
        let c = {"a":110,"b":11,"c":0, "d":10};
        let d = {"a":110,"b":11};
        let e = {"d":110,"e":11};

        let ab: any = DeltaCalculator.calculateAttributeListDelta(a,b);
        expect(ab.a).toBe(b.a-a.a);
        expect(ab.b).toBe(b.b-a.b);
        expect(ab.c).toBe(b.c-a.c);

        let ac: any = DeltaCalculator.calculateAttributeListDelta(a,c);
        expect(ac.a).toBe(c.a-a.a);
        expect(ac.b).toBe(c.b-a.b);
        expect(ac.c).toBe(c.c-a.c);
        expect(ac.d).toBe(c.d);

        let ad: any = DeltaCalculator.calculateAttributeListDelta(a,d);
        expect(ad.a).toBe(d.a-a.a);
        expect(ad.b).toBe(d.b-a.b);
        expect(ad.c).toBe(undefined);

        let ae: any = DeltaCalculator.calculateAttributeListDelta(a,e);
        expect(ae.a).toBe(undefined);
        expect(ae.b).toBe(undefined);
        expect(ae.c).toBe(undefined);
        expect(ae.d).toBe(e.d);
        expect(ae.e).toBe(e.e);
    });
});

