export function isActionOfType(actionType: string, actions) {
	return Object.keys(actions).includes(actionType)
}
