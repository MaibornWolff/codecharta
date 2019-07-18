import convert from "color-convert"

export class HSL {
	constructor(private h: number, private s: number, private l: number) {}

	public toHex(): string {
		return `#${convert.hsl.hex([this.h, this.s, this.l])}`
	}

	public decreaseLightness(value: number) {
		this.l -= value
	}

	public getLightness() {
		return this.l
	}

	public setLightness(value: number) {
		this.l = value
	}
}
