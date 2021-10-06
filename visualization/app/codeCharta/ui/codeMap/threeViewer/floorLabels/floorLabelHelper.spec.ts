import { FloorLabelHelper } from "./floorLabelHelper"

describe("FloorLabelHelper", () => {
	function appendMapCanvas(mapCanvasWidth) {
		const fakeMapCanvas = document.createElement("canvas")
		fakeMapCanvas.width = fakeMapCanvas.height = mapCanvasWidth

		const fragment = document.createDocumentFragment()
		fragment.appendChild(fakeMapCanvas)

		document.getElementsByTagName = jest.fn().mockReturnValue(fragment.children)
	}

	describe("getMapResolutionScaling", () => {
		it("should not scale since map width is smaller than scaling threshold (four times the display width)", () => {
			appendMapCanvas(500)

			expect(FloorLabelHelper.getMapResolutionScaling(400)).toBe(1)
		})

		it("should scale since map width is greater than scaling threshold (four times the display width)", () => {
			const displayWidth = 1000
			appendMapCanvas(displayWidth)

			const mapWidth = 5000
			expect(FloorLabelHelper.getMapResolutionScaling(mapWidth)).toBe((displayWidth * 4) / mapWidth)
		})

		it("should not scale since map width is smaller than scaling threshold (four times the width of FullHD+)", () => {
			appendMapCanvas(1000)

			expect(FloorLabelHelper.getMapResolutionScaling(400)).toBe(1)
		})

		it("should scale since map width is greater than scaling threshold (four times the width of FullHD+)", () => {
			const fullHdPlusWidth = 2560
			appendMapCanvas(fullHdPlusWidth * 5)

			const mapWidth = fullHdPlusWidth * 6
			expect(FloorLabelHelper.getMapResolutionScaling(mapWidth)).toBe((fullHdPlusWidth * 4) / mapWidth)
		})
	})
})
