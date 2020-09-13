import { fileChooserComponent } from "./fileChooser.component"

export class FileChooserDirective {
	public template = require("./fileChooser.component.html")
	public restrict = "E"
	public scope = {}
	public controller = fileChooserComponent.controller
	public controllerAs = "ctrl"
	public bindToController = true
	public uniqueId = 0

	/**
	 * Links the unique id to the scope id and increments it
	 */
	public link($scope) {
		$scope.id = `fileChooser${this.uniqueId++}`
	}
}
