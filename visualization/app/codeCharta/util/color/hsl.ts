import convert from "color-convert"

export class HSL {
    constructor(
        private readonly h: number,
        private readonly s: number,
        private l: number
    ) {}

    toHex() {
        return `#${convert.hsl.hex([this.h, this.s, this.l])}`
    }

    withoutSaturation() {
        return new HSL(this.h, 0, this.l)
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
