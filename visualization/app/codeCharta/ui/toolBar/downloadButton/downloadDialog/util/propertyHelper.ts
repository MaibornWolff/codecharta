import { hierarchy } from "d3-hierarchy"
import { AttributeTypes, BlacklistItem, BlacklistType, CodeMapNode } from "../../../../../codeCharta.model"

export type DownloadableProperty = {
	name: string
	amount: number
	isSelected: boolean
	isDisabled: boolean
}

export const getDownloadableProperty = (name: string, amount: number): DownloadableProperty => ({
	name,
	amount,
	isSelected: amount > 0,
	isDisabled: amount === 0
})

export const getAmountOfNodes = (unifiedMapNode: CodeMapNode) => {
	let amountOfNodes = 0
	hierarchy(unifiedMapNode).each(() => amountOfNodes++)
	return amountOfNodes
}

export const getAmountOfAttributeTypes = (attributeTypes: AttributeTypes) =>
	(attributeTypes.nodes ? Object.keys(attributeTypes.nodes).length : 0) +
	(attributeTypes.edges ? Object.keys(attributeTypes.edges).length : 0)

export const getFilteredBlacklistLength = (blacklist: BlacklistItem[], blacklistType: BlacklistType) => {
	let count = 0
	for (const entry of blacklist) {
		if (entry.type === blacklistType) {
			count++
		}
	}
	return count
}
