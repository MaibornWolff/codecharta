import "./dialog.module.ts"
import { DialogChangelogController } from "./dialog.changelog.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import packageJson from "../../../../package.json"

describe("DialogChangelogController", () => {
	let dialogChangelogController: DialogChangelogController
	let $mdDialog

	beforeEach(() => {
		Storage.prototype.getItem = jest.fn(() => "1.76.0")
		restartSystem()
		dialogChangelogController = new DialogChangelogController($mdDialog)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.dialog")
		$mdDialog = getService("$mdDialog")
	}

	describe("constructor", () => {
		const added = "Added 🚀"
		const fixed = "Fixed 🐞"
		const removed = "Removed 🗑"
		const changed = "Changed"
		const chore = "Chore 👨‍💻 👩‍💻"

		it("should extract the changes from changelog only for the last version", () => {
			Storage.prototype.getItem = jest.fn(() => "1.76.0")
			packageJson.version = "1.77.0"
			dialogChangelogController = new DialogChangelogController($mdDialog)

			expect(dialogChangelogController["_viewModel"].changes).not.toBeNull()
			expect(dialogChangelogController["_viewModel"].changes[added]).toBeUndefined()
			expect(dialogChangelogController["_viewModel"].changes[fixed]).toBe(
				'<li>3 (<a href="">#3</a>)</li>\n' + '<li>4 (<a href="">#4</a>)</li>\n' + '<li>5 (<a href="">#5</a>)</li>'
			)
			expect(dialogChangelogController["_viewModel"].changes[removed]).toBeUndefined()
			expect(dialogChangelogController["_viewModel"].changes[changed]).toBeUndefined()
			expect(dialogChangelogController["_viewModel"].changes[chore]).toBe('<li>6 (<a href="">#6</a>)</li>')
		})

		it("should extract the changes from changelog for 2 versions", () => {
			packageJson.version = "1.77.0"
			Storage.prototype.getItem = jest.fn(() => "1.75.0")
			dialogChangelogController = new DialogChangelogController($mdDialog)

			expect(dialogChangelogController["_viewModel"].changes).not.toBeNull()
			expect(dialogChangelogController["_viewModel"].changes[added]).toBe(
				'<li>7 (<a href="">#7</a>)</li>\n' + '<li>8 (<a href="">#8</a>)</li>'
			)
			expect(dialogChangelogController["_viewModel"].changes[fixed]).toBe(
				'<li>3 (<a href="">#3</a>)</li>\n' + '<li>4 (<a href="">#4</a>)</li>\n' + '<li>5 (<a href="">#5</a>)</li>'
			)
			expect(dialogChangelogController["_viewModel"].changes[chore]).toBe('<li>6 (<a href="">#6</a>)</li>')
			// Expect nested list to be correctly parsed
			expect(dialogChangelogController["_viewModel"].changes[changed]).toBe(
				"<li>\n" +
					'<p>9 (<a href="">#9</a>)</p>\n' +
					"</li>\n" +
					"<li>\n" +
					'<p>10 (<a href="">#10</a>)</p>\n' +
					"<ul>\n" +
					"<li>10.1</li>\n" +
					"<li>10.2</li>\n" +
					"</ul>\n" +
					"</li>"
			)
			expect(dialogChangelogController["_viewModel"].changes[removed]).toBeUndefined()
		})
	})

	describe("hide", () => {
		it("should hide dialog properly", () => {
			$mdDialog.hide = jest.fn()

			dialogChangelogController.hide()

			expect($mdDialog.hide).toHaveBeenCalled()
		})
	})
})
