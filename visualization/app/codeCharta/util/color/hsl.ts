import convert from "color-convert"

export class HSL {
	constructor(private h: number, private s: number, private l: number) {}

	toHex() {
		return `#${convert.hsl.hex([this.h, this.s, this.l])}`
	}

	decreaseLightness(value: number) {
		this.l -= value
	}

	getLightness() {
		return this.l
	}

	setLightness(value: number) {
		this.l = value
	}

	toString() {
		return `hsl(${this.h}, ${this.s}%, ${this.l}%)`
	}
}
