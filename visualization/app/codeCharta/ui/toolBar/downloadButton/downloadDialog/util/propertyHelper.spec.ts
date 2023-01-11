import { AttributeTypeValue } from "../../../../../codeCharta.model"
import { BLACKLIST } from "../../../../../util/dataMocks"
import { getAmountOfAttributeTypes, getDownloadableProperty, getFilteredBlacklistLength } from "./propertyHelper"

describe("propertyHelper", () => {
	describe("getDownloadableProperty", () => {
		it("should set isSelected to true and isDisabled to false when there is an amount", () => {
			expect(getDownloadableProperty("MarkedPackages", 2)).toEqual({
				name: "MarkedPackages",
				amount: 2,
				isSelected: true,
				isDisabled: false
			})
		})

		it("should set isSelected to false and isDisabled to true when there is no amount", () => {
			expect(getDownloadableProperty("Edges", 0)).toEqual({
				name: "Edges",
				amount: 0,
				isSelected: false,
				isDisabled: true
			})
		})
	})
	describe("getAmountOfAttributeTypes", () => {
		it("should calculate amount of attributes for nodes and edges", () => {
			expect(
				getAmountOfAttributeTypes({
					nodes: { rloc: AttributeTypeValue.absolute },
					edges: { pairingRate: AttributeTypeValue.relative }
				})
			).toBe(2)
		})

		it("should calculate amount of attributes for nodes only", () => {
			expect(
				getAmountOfAttributeTypes({
					nodes: { rloc: AttributeTypeValue.absolute }
				})
			).toBe(1)
		})

		it("should calculate amount of attributes for edges only", () => {
			expect(
				getAmountOfAttributeTypes({
					edges: { pairingRate: AttributeTypeValue.relative }
				})
			).toBe(1)
		})
	})

	describe("getFilteredBlacklistLength", () => {
		it("should get length of flattened buildings", () => {
			expect(getFilteredBlacklistLength(BLACKLIST, "flatten")).toBe(1)
		})

		it("should get length of excluded buildings", () => {
			expect(getFilteredBlacklistLength(BLACKLIST, "exclude")).toBe(2)
		})
	})
})
