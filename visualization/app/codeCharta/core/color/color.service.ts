export class ColorService {

    /* @ngInject */
    constructor(){

    }

    public convertHexToNumber(hexString: string): number {
        return Number("0x" + hexString.substring(1));
    }

    public convertNumberToHex(colorNumber: number): string {
        return "#" + colorNumber.toString(16);
    }

    public convertHexTo0xString(hexString: string): string {
        return hexString.replace("#","0x");
    }

    public convert0xStringToHex(hex0xString: string): string {
        return hex0xString.replace("0x","#");
    }

    public getImageDataUri(hex: number): string {
        let hexS: string = "#" + hex.toString(16);
        let color: string = this.encodeHex(hexS);
        return this.generatePixel(color);
    }

    private encodeHex(s: string): string {
        s = s.substring(1, 7);
        if (s.length < 6) {
            s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
        }
        return this.encodeRGB(
            parseInt(s[0] + s[1], 16), parseInt(s[2] + s[3], 16), parseInt(s[4] + s[5], 16));
    }

    private encodeRGB(r: number, g: number, b: number): string {
        return this.encodeTriplet(0, r, g) + this.encodeTriplet(b, 255, 255);
    }

    private encodeTriplet(e1: number, e2: number, e3: number): string {
        let keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        let enc1 = e1 >> 2;
        let enc2 = ((e1 & 3) << 4) | (e2 >> 4);
        let enc3 = ((e2 & 15) << 2) | (e3 >> 6);
        let enc4 = e3 & 63;
        return keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }


    private generatePixel(color: string): string {
        return "data:image/gif;base64,R0lGODlhAQABAPAA" + color + "/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
    }

}