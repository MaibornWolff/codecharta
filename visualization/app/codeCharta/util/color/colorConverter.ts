import { Color, Vector3 } from "three"
import convert from "color-convert"
import { HSL } from "./hsl"

export class ColorConverter {
	public static convertHexToNumber(hex: string): number {
		return Number(hex.replace("#", "0x"))
	}

	public static convertNumberToHex(colorNumber: number): string {
		const hexColor = colorNumber.toString(16)
		const zeros: string = "0".repeat(6 - hexColor.length)
		return "#" + zeros + hexColor
	}

	public static convertHexToRgba(hex: string, opacity = 1): string {
		const rgbColor: number[] = this.encodeHex(hex)
		return "rgba(" + rgbColor.join(",") + "," + opacity + ")"
	}

	public static convertHexToColorObject(hex: string): Color {
		const rgbColor: number[] = this.encodeHex(hex)
		return new Color(...rgbColor)
	}

	public static convertColorToHex(colorObject: Color): string {
		return (
			"#" +
			Math.round(colorObject.r).toString(16) +
			"" +
			Math.round(colorObject.g).toString(16) +
			"" +
			Math.round(colorObject.b).toString(16)
		)
	}

	public static hexToHSL(hex: string): HSL {
		const hsl = convert.hex.hsl(hex)
		return new HSL(hsl[0], hsl[1], hsl[2])
	}

	public static colorToVector3(color: string): Vector3 {
		const convertedColor = ColorConverter.convertHexToNumber(color)
		return new Vector3(((convertedColor >> 16) & 0xff) / 255.0, ((convertedColor >> 8) & 0xff) / 255.0, (convertedColor & 0xff) / 255.0)
	}

	public static vector3ToRGB(vector: Vector3): Color {
		const r = Math.floor(vector.x * 255)
		const g = Math.floor(vector.y * 255)
		const b = Math.floor(vector.z * 255)

		return new Color(r, g, b)
	}

	public static gradient(startColor: string, endColor: string, steps: number): string[] {
		const start: Color = this.convertHexToColorObject(startColor)
		const end: Color = this.convertHexToColorObject(endColor)
		const diff: Color = end.sub(start)
		const stepsArray = []

		for (let i = 0; i <= steps; i++) {
			const stepDiff = diff.clone().multiplyScalar((1 / steps) * i)
			const step = start.clone().add(stepDiff)
			stepsArray[i] = this.convertColorToHex(step)
		}
		return stepsArray
	}

	public static getImageDataUri(hex: string): string {
		const rgbColor: number[] = this.encodeHex(hex)
		const encodedRGBColor: string = this.encodeRGB(rgbColor[0], rgbColor[1], rgbColor[2])
		return this.generatePixel(encodedRGBColor)
	}

	private static encodeHex(s: string): number[] {
		let copy = s.substring(1, 7)
		if (copy.length < 6) {
			copy = copy[0] + copy[0] + copy[1] + copy[1] + copy[2] + copy[2]
		}
		return [parseInt(copy[0] + copy[1], 16), parseInt(copy[2] + copy[3], 16), parseInt(copy[4] + copy[5], 16)]
	}

	private static encodeRGB(r: number, g: number, b: number): string {
		return this.encodeTriplet(0, r, g) + this.encodeTriplet(b, 255, 255)
	}

	private static encodeTriplet(e1: number, e2: number, e3: number): string {
		const keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
		const enc1 = e1 >> 2
		const enc2 = ((e1 & 3) << 4) | (e2 >> 4)
		const enc3 = ((e2 & 15) << 2) | (e3 >> 6)
		const enc4 = e3 & 63
		return keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4)
	}

	private static generatePixel(color: string): string {
		return "data:image/gif;base64,R0lGODlhAQABAPAA" + color + "/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
	}
}
