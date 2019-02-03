import { ColorService } from "./color.service";

describe("ColorService", () => {

    let colorService: ColorService;

    beforeEach(function() {
        colorService = new ColorService();
    });

    describe("Color to pixel image", () => {
        it("generate pixel in base64", () => {
            expect(colorService.generatePixel("some color value")).toBe("data:image/gif;base64,R0lGODlhAQABAPAAsome color value/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==");
        });

        it("html -> base64", () => {
            expect(colorService.getImageDataUri("000000")).toBe("data:image/gif;base64,R0lGODlhAQABAPAAAAAAAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==");
        });

        it("encode hex to rgb", () => {
            expect(colorService.encodeHex("#000000")).toBe("AAAAAP//");
            expect(colorService.encodeHex("#ff0000")).toBe("AP8AAP//");
            expect(colorService.encodeHex("#0000ff")).toBe("AAAA////");
            expect(colorService.encodeHex("#000")).toBe("AAAAAP//");
            expect(colorService.encodeHex("#f00")).toBe("AP8AAP//");
            expect(colorService.encodeHex("#00f")).toBe("AAAA////");
        });

        it("encode rgb to base64 color value", () => {
            expect(colorService.encodeRGB(0, 0, 0)).toBe("AAAAAP//");
            expect(colorService.encodeRGB(255, 255, 255)).toBe("AP//////");
            expect(colorService.encodeRGB(123, 3, 111)).toBe("AHsDb///");
        });

        it("encode triplet to base64 color value", () => {
            expect(colorService.encodeTriplet(0, 0, 0)).toBe("AAAA");
            expect(colorService.encodeTriplet(255, 255, 255)).toBe("////");
            expect(colorService.encodeTriplet(123, 3, 111)).toBe("ewNv");
        });
    });

});