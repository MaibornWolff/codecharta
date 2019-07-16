// Usage: <layout-switcher-component layouts="CodeCharta, TestVille"></layout-switcher-component>

export class LayoutSwitcherController {
	private static TIMEOUT_IN_MS = 200

	private _viewModel = {
		states: [],
		selectedState: ""
	}

	private layouts = ""

	/* @ngInject */
	constructor(private $state, $timeout) {
		$timeout(() => {
			this._viewModel.selectedState = this.$state.$current.name

			this._viewModel.states = this.layouts
				.replace(/ /g, "")
				.replace(/\n/g, "")
				.split(",")
		}, LayoutSwitcherController.TIMEOUT_IN_MS)
	}

	public onLayoutChange(state: string) {
		this.$state.go(state)
	}
}

export const layoutSwitcherComponent = {
	selector: "layoutSwitcherComponent",
	template: require("./layoutSwitcher.component.html"),
	controller: LayoutSwitcherController,
	bindings: {
		layouts: "@"
	}
}
