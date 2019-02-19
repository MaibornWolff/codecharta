import { ColorService } from "./color.service";

describe("ColorService", () => {

    describe("Convert hex and decimal", () => {
        it("convert hex to decimal", () => {
            expect(ColorService.convertHexToNumber("#ABABAB")).toEqual(0xABABAB);
        });

        it("convert decimal to hex", () => {
            expect(ColorService.convertNumberToHex(0xABABAB)).toEqual("#ababab");
        });
    });

    describe("Color to pixel image", () => {
        it("generate pixel in base64", () => {
            expect(ColorService.generatePixel("some color value")).toBe("data:image/gif;base64,R0lGODlhAQABAPAAsome color value/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==");
        });

        it("html -> base64", () => {
            expect(ColorService.getImageDataUri("000000")).toBe("data:image/gif;base64,R0lGODlhAQABAPAAAAAAAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==");
        });

        it("encode hex to rgb", () => {
            expect(ColorService.encodeHex("#000000")).toEqual([0,0,0]);
            expect(ColorService.encodeHex("#ff0000")).toEqual([255,0,0]);
            expect(ColorService.encodeHex("#0000ff")).toEqual([0,0,255]);
            expect(ColorService.encodeHex("#000")).toEqual([0,0,0]);
            expect(ColorService.encodeHex("#f00")).toEqual([255,0,0]);
            expect(ColorService.encodeHex("#00f")).toEqual([0,0,255]);
        });

        it("encode rgb to encodeRGB", () => {
            expect(ColorService.encodeRGB(0,0,0)).toBe("AAAAAP//");
            expect(ColorService.encodeRGB(255,0,0)).toBe("AP8AAP//");
            expect(ColorService.encodeRGB(0,0,255)).toBe("AAAA////");
            expect(ColorService.encodeRGB(0,0,0)).toBe("AAAAAP//");
            expect(ColorService.encodeRGB(255,0,0)).toBe("AP8AAP//");
            expect(ColorService.encodeRGB(0,0,255)).toBe("AAAA////");
        });

        it("encode rgb to base64 color value", () => {
            expect(ColorService.encodeRGB(0, 0, 0)).toBe("AAAAAP//");
            expect(ColorService.encodeRGB(255, 255, 255)).toBe("AP//////");
            expect(ColorService.encodeRGB(123, 3, 111)).toBe("AHsDb///");
        });

        it("encode triplet to base64 color value", () => {
            expect(ColorService.encodeTriplet(0, 0, 0)).toBe("AAAA");
            expect(ColorService.encodeTriplet(255, 255, 255)).toBe("////");
            expect(ColorService.encodeTriplet(123, 3, 111)).toBe("ewNv");
        });
    });

});