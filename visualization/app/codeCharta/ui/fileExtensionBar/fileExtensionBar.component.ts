import "./fileExtensionBar.component.scss"

export class FileExtensionBarController {
	private java = 0
	private typescript = 0
	private kotlin = 0
	private all = 370
	private rest = 0

	/* @ngInject */
	constructor() {
		this.getPercentage()
	}

	public getPercentage() {
		this.java = (100 / 370) * 100
		this.typescript = (200 / 370) * 100
		this.kotlin = (50 / 370) * 100
		this.rest = (20 / 370) * 100
	}
}

export const fileExtensionBarComponent = {
	selector: "fileExtensionBarComponent",
	template: require("./fileExtensionBar.component.html"),
	controller: FileExtensionBarController
}
