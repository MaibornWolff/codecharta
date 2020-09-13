import { Color, Vector3 } from "three"
import convert from "color-convert"
import { HSL } from "./hsl"

export class ColorConverter {
	private static colorToVector3Map = new Map<string, Vector3>()
	private static hexToNumberMap = new Map<string, number>()

	public static getVector3(color: string) {
		let vector = this.colorToVector3Map.get(color)
		if (vector === undefined) {
			vector = ColorConverter.colorToVector3(color)
			this.colorToVector3Map.set(color, vector)
		}

		return vector
	}

	public static getNumber(hex: string) {
		let number = this.hexToNumberMap.get(hex)
		if (number === undefined) {
			number = ColorConverter.convertHexToNumber(hex)
			this.hexToNumberMap.set(hex, number)
		}

		return number
	}

	public static convertHexToNumber(hex: string) {
		return Number(hex.replace("#", "0x"))
	}

	public static convertNumberToHex(colorNumber: number) {
		const hexColor = colorNumber.toString(16)
		const zeros: string = "0".repeat(6 - hexColor.length)
		return `#${zeros}${hexColor}`
	}

	public static convertHexToRgba(hex: string, opacity = 1) {
		const rgbColor: number[] = this.encodeHex(hex)
		return `rgba(${rgbColor.join(",")},${opacity})`
	}

	public static convertHexToColorObject(hex: string) {
		const rgbColor: number[] = this.encodeHex(hex)
		return new Color(...rgbColor)
	}

	public static convertColorToHex(colorObject: Color) {
		return (
			String(String(`#${Math.round(colorObject.r).toString(16)}`) + Math.round(colorObject.g).toString(16)) +
			Math.round(colorObject.b).toString(16)
		)
	}

	public static hexToHSL(hex: string) {
		const hsl = convert.hex.hsl(hex)
		return new HSL(hsl[0], hsl[1], hsl[2])
	}

	public static colorToVector3(color: string) {
		const convertedColor = ColorConverter.convertHexToNumber(color)
		return new Vector3(((convertedColor >> 16) & 0xff) / 255, ((convertedColor >> 8) & 0xff) / 255, (convertedColor & 0xff) / 255)
	}

	public static vector3ToRGB(vector: Vector3) {
		const r = Math.floor(vector.x * 255)
		const g = Math.floor(vector.y * 255)
		const b = Math.floor(vector.z * 255)

		return new Color(r, g, b)
	}

	public static gradient(startColor: string, endColor: string, steps: number) {
		const start: Color = this.convertHexToColorObject(startColor)
		const end: Color = this.convertHexToColorObject(endColor)
		const diff: Color = end.sub(start)
		const stepsArray: string[] = []

		for (let i = 0; i <= steps; i++) {
			const stepDiff = diff.clone().multiplyScalar((1 / steps) * i)
			const step = start.clone().add(stepDiff)
			stepsArray[i] = this.convertColorToHex(step)
		}
		return stepsArray
	}

	public static getImageDataUri(hex: string) {
		const rgbColor: number[] = this.encodeHex(hex)
		const encodedRGBColor: string = this.encodeRGB(rgbColor[0], rgbColor[1], rgbColor[2])
		return this.generatePixel(encodedRGBColor)
	}

	private static encodeHex(s: string) {
		let copy = s.slice(1, 7)
		if (copy.length < 6) {
			copy = copy[0] + copy[0] + copy[1] + copy[1] + copy[2] + copy[2]
		}
		return [Number.parseInt(copy[0] + copy[1], 16), Number.parseInt(copy[2] + copy[3], 16), Number.parseInt(copy[4] + copy[5], 16)]
	}

	private static encodeRGB(r: number, g: number, b: number) {
		return this.encodeTriplet(0, r, g) + this.encodeTriplet(b, 255, 255)
	}

	private static encodeTriplet(a: number, b: number, c: number) {
		const keyString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
		const enc1 = a >> 2
		const enc2 = ((a & 3) << 4) | (b >> 4)
		const enc3 = ((b & 15) << 2) | (c >> 6)
		const enc4 = c & 63
		return keyString.charAt(enc1) + keyString.charAt(enc2) + keyString.charAt(enc3) + keyString.charAt(enc4)
	}

	private static generatePixel(color: string) {
		return `data:image/gif;base64,R0lGODlhAQABAPAA${color}/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`
	}
}
