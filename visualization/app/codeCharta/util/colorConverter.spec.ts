import {ColorConverter} from "./colorConverter"
import * as THREE from "three";
import {Vector3} from "three";

describe("colorConverter", () => {
    describe("convertHexToNumber", () => {
        it("should return that the input can't be a number", () => {
            const result = ColorConverter.convertHexToNumber("string")
            const expected = NaN

            expect(result).toBe(expected)
        })

        it("should replace the first occurences of # with 0x and return a number", () => {
            const result = ColorConverter.convertHexToNumber("#ABCDEF")
            const expected = 0xABCDEF

            expect(result).toBe(expected)
        })
    })

    describe("convertNumberToHex", () => {
        it("should not create any 0s after # and convert", () => {
            const result = ColorConverter.convertNumberToHex(16777215)
            const expected = "#ffffff"

            expect(result).toBe(expected)
        })

        it("should not create any five 0s after # and convert", () => {
            const result = ColorConverter.convertNumberToHex(15)
            const expected = "#00000f"

            expect(result).toBe(expected)
        })
    })

    describe("convertHexToRGBA", () => {
        it("should convert a hex to rgba with default opacity of 1", () => {
            const result = ColorConverter.convertHexToRgba("#ffffff")
            const expected = "rgba(255,255,255,1)"

            expect(result).toBe(expected)
        })

        it("should convert a hex to rgba with default opacity of 10", () => {
            const result = ColorConverter.convertHexToRgba("#000000", 10)
            const expected = "rgba(0,0,0,10)"

            expect(result).toBe(expected)
        })

        it("should convert a hex to rgba in mid range", () => {
            const result = ColorConverter.convertHexToRgba("#123456")
            const expected = "rgba(18,52,86,1)"

            expect(result).toBe(expected)
        })

        it("should convert a hex to rgba with hex size smaller than 6", () => {
            const result = ColorConverter.convertHexToRgba("#123")
            const expected = "rgba(17,34,51,1)"

            expect(result).toBe(expected)
        })
    })

    describe("colorToVector3", () => {
        it("0x000000 should return 0,0,0", ()=>{
            const vec: Vector3 = ColorConverter.colorToVector3("#000000");
            expect(vec.x).toBe(0);
            expect(vec.y).toBe(0);
            expect(vec.z).toBe(0);
        });

        it("0xffffff should return 1,1,1", ()=>{
            const vec: Vector3 = ColorConverter.colorToVector3("#FFFFFF");
            expect(vec.x).toBe(1);
            expect(vec.y).toBe(1);
            expect(vec.z).toBe(1);
        });

        it("0xff00aa should be close to 1,0,0.666", ()=>{
            const vec: Vector3 = ColorConverter.colorToVector3("#FF00AA");
            expect(vec.x).toBe(1);
            expect(vec.y).toBe(0);
            expect(vec.z).toBeCloseTo(0.666,2);
        });
    })

    describe("getImageDataUri", () => {
        it("should return a generated pixel of max input value", () => {
            const result = ColorConverter.getImageDataUri("#ffffff")
            const expected = "data:image/gif;base64,R0lGODlhAQABAPAAAP///////yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="

            expect(result).toBe(expected)
        })

        it("should return a generated pixel of min input value", () => {
            const result = ColorConverter.getImageDataUri("#000000")
            const expected = "data:image/gif;base64,R0lGODlhAQABAPAAAAAAAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
            
            expect(result).toBe(expected)
        })

        it("should return a generated pixel of midrange input value", () => {
            const result = ColorConverter.getImageDataUri("#012345")
            const expected = "data:image/gif;base64,R0lGODlhAQABAPAAAAEjRf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="

            expect(result).toBe(expected)
        })

        it("should return a generated pixel of midrange input value with less than 6 digits", () => {
            const result = ColorConverter.getImageDataUri("#123")
            const expected = "data:image/gif;base64,R0lGODlhAQABAPAAABEiM////yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="

            expect(result).toBe(expected)
        })
    })
})