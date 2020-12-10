// import { StoreService } from "../../state/store.service"
// import { defaultMapColors, setMapColors } from "../../state/store/appSettings/mapColors/mapColors.actions"

export class MapColorPickerController {
	// @ts-ignore todo is there maybe a @bindings to be more clear why we need this?
	private mapColorFor: string
	// @ts-ignore todo is there maybe a @bindings to be more clear why we need this?
	private label: string
	private open: string

	constructor(/* private storeService: StoreService, */ private $element: JQLite, private $scope) {}

	$onInit() {
		// console.log( this.mapColorFor, this.label)
		// console.log(this.storeService.getState())
		this.$scope.color = "#f542ec"
		this.$scope.colorPickerOptions = { pos: this.open }

		// this.storeService.dispatch(
		//   setMapColors({
		//     ...defaultMapColors,
		//     negative: "#f542ec"
		//   })
		// )
	}

	$postLink() {
		this.getColorPickerPanel().then(this.addColorInbox)
	}

	private async getColorPickerPanel() {
		return new Promise<ChildNode>(resolve => {
			const mutationObserver = new MutationObserver((mutations, observer) => {
				observer.disconnect()

				const colorPickerPanel = mutations[0].addedNodes[0].childNodes[1]
				resolve(colorPickerPanel)
			})

			const colorPicker = this.$element.find("color-picker")[0]
			mutationObserver.observe(colorPicker, { childList: true })
		})
	}

	private addColorInbox(colorPickerPanel: ChildNode) {
		const node = document.createElement("div")
		node.innerHTML = "yolo"
		node.addEventListener("click", () => alert("yolo yolo"))
		colorPickerPanel.appendChild(node)
	}
}

export const mapColorPickerComponent = {
	selector: "mapColorPicker",
	template: require("./mapColorPicker.component.html"),
	controller: MapColorPickerController,
	bindings: {
		label: "@",
		mapColorFor: "@",
		open: "@" // ['bottom left', 'bottom right', 'top left', 'top right'] - passed to angularjs-color-picker
	}
}
