import { CodeMapNode } from "../../../../codeCharta.model"

const MAX_MARGIN = 100

export function getResetMargin(dynamicMargin: boolean, map?: CodeMapNode) {
	if (dynamicMargin && map) {
		return MAX_MARGIN
	}
	return 0
}
