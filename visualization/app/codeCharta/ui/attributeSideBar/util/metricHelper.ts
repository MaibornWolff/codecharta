export type Metric = {
	name: string
	value: number
	showAttributeTypeSelector: boolean
}

export const shouldShowAttributeTypeSelector = ({ isLeaf }: { isLeaf: boolean }) => !isLeaf
