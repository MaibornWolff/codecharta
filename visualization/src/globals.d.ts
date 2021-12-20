export type BUILDING_RIGHT_CLICKED_EVENT_TYPE = {
	building: CodeMapBuilding
	x: number
	y: number
}

interface CustomEventMap {
	"building-right-clicked": CustomEvent<BUILDING_RIGHT_CLICKED_EVENT_TYPE>
}

declare global {
	declare module "*.md"

	interface Document {
		addEventListener<K extends keyof CustomEventMap>(type: K, listener: (this: Document, event: CustomEventMap[K]) => void): void
	}
}
