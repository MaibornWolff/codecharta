import { Overlay, OverlayRef } from "@angular/cdk/overlay"
import { ComponentPortal } from "@angular/cdk/portal"
import { Inject, Injectable } from "@angular/core"
import { Store } from "../../angular-redux/store"
import { setRightClickedNodeData } from "../../store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { NodeContextMenuCardComponent } from "./nodeContextMenuCard/nodeContextMenuCard.component"

@Injectable({ providedIn: "root" })
export class NodeContextMenuService {
	private overlayReference: OverlayRef | null = null

	constructor(@Inject(Overlay) private overlay: Overlay, @Inject(Store) private store: Store) {}

	open(x: number, y: number) {
		const positionStrategy = this.overlay
			.position()
			.flexibleConnectedTo({ x, y })
			.withPositions([
				{
					originX: "end",
					originY: "bottom",
					overlayX: "start",
					overlayY: "top"
				}
			])

		this.overlayReference = this.overlay.create({
			positionStrategy,
			scrollStrategy: this.overlay.scrollStrategies.close()
		})

		this.overlayReference.attach(new ComponentPortal(NodeContextMenuCardComponent))

		document.addEventListener("click", this.onLeftClickHideNodeContextMenu, false)
		document.addEventListener("mousedown", this.onRightClickHideNodeContextMenu, true)
		document.getElementById("codeMap").addEventListener("wheel", this.close, true)
	}

	close = () => {
		document.removeEventListener("click", this.onLeftClickHideNodeContextMenu, true)
		document.removeEventListener("mousedown", this.onRightClickHideNodeContextMenu, true)
		document.getElementById("codeMap").removeEventListener("wheel", this.close, true)

		this.store.dispatch(setRightClickedNodeData(null))

		if (this.overlayReference) {
			this.overlayReference.dispose()
			this.overlayReference = null
		}
	}

	private onLeftClickHideNodeContextMenu = (mouseEvent: MouseEvent) => {
		if (this.isEventFromColorPicker(mouseEvent)) return

		this.close()
	}

	private onRightClickHideNodeContextMenu = event => {
		if (event.button !== 2) return
		// Close on right click down, to close before the map gets potential moved by right clicked
		this.close()
	}

	private isEventFromColorPicker(mouseEvent: MouseEvent) {
		const elements = mouseEvent.composedPath() as Node[]
		return elements.some(element => element?.nodeName === "CC-COLOR-PICKER" || element?.nodeName === "COLOR-CHROME")
	}
}
