import { fileChooserComponent } from "./fileChooser.component"

export class FileChooserDirective {
	template = require("./fileChooser.component.html")
	restrict = "E"
	scope = {}
	controller = fileChooserComponent.controller
	controllerAs = "ctrl"
	bindToController = true
	uniqueId = 0

	/**
	 * Links the unique id to the scope id and increments it
	 */
	link($scope) {
		$scope.id = `fileChooser${this.uniqueId++}`
	}
}
