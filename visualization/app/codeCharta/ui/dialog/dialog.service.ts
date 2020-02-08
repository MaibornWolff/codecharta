import { dialogDownloadComponent } from "./dialog.download.component"
import { dialogGlobalSettingsComponent } from "./dialog.globalSettings.component"
import { ErrorObject } from "ajv"
import _ from "lodash"

export class DialogService {
	/* @ngInject */
	constructor(private $mdDialog) {}

	public showDownloadDialog() {
		this.showCustomDialog(dialogDownloadComponent)
	}

	public showGlobalSettingsDialog() {
		this.showCustomDialog(dialogGlobalSettingsComponent)
	}

	public showCustomDialog(dialog) {
		this.$mdDialog.show(dialog)
	}

	public showImportErrorDialog(errors: ErrorObject[]) {
		const html = this.createDialogContent(errors)
		this.$mdDialog.show({
			template: this.getWrappedDialog(html),
			clickOutsideToClose: true
		})
	}

	public showErrorDialog(msg: string = "An error occured.", title: string = "Error", button: string = "Ok") {
		this.$mdDialog.show(
			this.$mdDialog
				.alert()
				.clickOutsideToClose(true)
				.title(title)
				.textContent(msg)
				.ok(button)
		)
	}

	public showPromptDialog(
		msg: string,
		initial: string,
		placeholder: string = initial,
		title: string = "Prompt",
		button: string = "Ok"
	): Promise<any> {
		let prompt = this.$mdDialog
			.prompt()
			.title(title)
			.textContent(msg)
			.initialValue(initial)
			.placeholder(placeholder)
			.ok(button)

		return this.$mdDialog.show(prompt)
	}

	private getWrappedDialog(content: string) {
		return (
			'<md-dialog class="import-error-dialog">' +
			"<md-toolbar>" +
			'<h2 class="md-toolbar-tools">JSON Schema Error</h2>' +
			"</md-toolbar>" +
			'<md-dialog-content class="md-dialog-content">' +
			content +
			"</md-dialog-content>" +
			"<md-dialog-actions>" +
			'<md-button class="md-primary">Ok</md-button>' +
			"</md-dialog-actions>" +
			"</md-dialog>"
		)
	}

	private createDialogContent(errors: ErrorObject[]) {
		let html = ""
		errors.forEach((error: ErrorObject, index: number) => {
			const key = _.keys(error.params)[0]
			const object = " " + JSON.stringify(error.params[key])

			html += "<p><b>Error #" + (index + 1) + "</b> " + key + " <i>" + object + "</i></p>"
			html += '<p><i class="fa fa-comment-o" title="Message"></i> ' + _.lowerCase(error.message) + "</p>"
			html += '<p><i class="fa fa-sitemap" title="Data Path"></i> ' + error.dataPath + "</p>"
			html += '<p><i class="fa fa-info" title="Schema Path"></i> ' + error.schemaPath + "</p>"
		})
		return html
	}
}
