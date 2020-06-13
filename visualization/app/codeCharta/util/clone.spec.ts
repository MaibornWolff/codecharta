import { clone } from "./clone"

describe("clone", () => {
	it("should clone a javascript object", () => {
		const object = { x: 1, y: 2 }

		const actual = clone(object)

		expect(actual).toEqual(object)
		object.x = 1
		expect(actual).not.toEqual(object)
	})
})
