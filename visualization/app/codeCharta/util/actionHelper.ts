export function isActionOfType(actionType: string, actions) {
	return Object.values(actions).includes(actionType)
}
