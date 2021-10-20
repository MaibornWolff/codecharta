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
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.dialog")
		$mdDialog = getService("$mdDialog")
	}
	function rebuildController() {
		dialogChangelogController = new DialogChangelogController($mdDialog)
	}

	describe("constructor", () => {
		it("should extract the changes from changelog only for the last version", () => {
			Storage.prototype.getItem = jest.fn(() => "1.76.0")
			packageJson.version = "1.77.0"
			rebuildController()
			expect(dialogChangelogController["_viewModel"].changes).not.toBeNull()
			expect(dialogChangelogController["_viewModel"].changes["Added 🚀"]).toBeUndefined()
			expect(dialogChangelogController["_viewModel"].changes["Fixed 🐞"]).toBe(
				'<li>3 (<a href="">#3</a>)</li>\n' + '<li>4 (<a href="">#4</a>)</li>\n' + '<li>5 (<a href="">#5</a>)</li>'
			)
			expect(dialogChangelogController["_viewModel"].changes["Removed 🗑"]).toBeUndefined()
			expect(dialogChangelogController["_viewModel"].changes["Changed"]).toBeUndefined()
			expect(dialogChangelogController["_viewModel"].changes["Chore 👨‍💻 👩‍💻"]).toBe('<li>6 (<a href="">#6</a>)</li>')
		})
		it("should extract the changes from changelog for 2 versions", () => {
			packageJson.version = "1.77.0"
			Storage.prototype.getItem = jest.fn(() => "1.75.0")
			rebuildController()
			expect(dialogChangelogController["_viewModel"].changes).not.toBeNull()
			expect(dialogChangelogController["_viewModel"].changes["Added 🚀"]).toBe(
				'<li>7 (<a href="">#7</a>)</li>\n' + '<li>8 (<a href="">#8</a>)</li>'
			)
			expect(dialogChangelogController["_viewModel"].changes["Fixed 🐞"]).toBe(
				'<li>3 (<a href="">#3</a>)</li>\n' + '<li>4 (<a href="">#4</a>)</li>\n' + '<li>5 (<a href="">#5</a>)</li>'
			)
			expect(dialogChangelogController["_viewModel"].changes["Chore 👨‍💻 👩‍💻"]).toBe('<li>6 (<a href="">#6</a>)</li>')
			expect(dialogChangelogController["_viewModel"].changes["Changed"]).toBe(
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
			expect(dialogChangelogController["_viewModel"].changes["Removed 🗑"]).toBeUndefined()
		})
	})

	describe("find version line", () => {
		it("should find the first version line", () => {
			const versionLine = dialogChangelogController.findVersionLine(
				["</ul>", "<h2>[1.77.0] - 2021-07-30</h2>", "<h3>Fixed 🐞</h3>", "<h2>[1.76.0] - 2021-06-30</h2>"],
				"1.77.0"
			)

			expect(versionLine).toBe(1)
		})
	})

	describe("find changes end line", () => {
		it("should find the end line of the given changes before another change list ", () => {
			const versionLine = dialogChangelogController.findEndChangesLine(
				["<ul>", '<a href="">#7</a>)</li>\n', '<li>8 (<a href="">#8</a>)</li>', "</ul>", "<h3>Fixed 🐞</h3>"],
				0
			)

			expect(versionLine).toBe(3)
		})
		it("should find the end line of the given changes before a new version ", () => {
			const versionLine = dialogChangelogController.findEndChangesLine(
				["<ul>", '<a href="">#7</a>)</li>\n', '<li>8 (<a href="">#8</a>)</li>', "</ul>", "<h2>[1.76.0] - 2021-06-30</h2>"],
				0
			)

			expect(versionLine).toBe(3)
		})
	})

	describe("get all indexes", () => {
		it("should find the indexes of every occurrence of the pattern", () => {
			const indexes = dialogChangelogController.getAllIndexes(
				[
					"</ul>",
					"<h2>[1.77.0] - 2021-07-30</h2>",
					"<h3>Fixed 🐞</h3>",
					"<h2>[1.76.0] - 2021-06-30</h2>",
					"</ul>",
					"<h2>[1.77.0] - 2021-07-30</h2>",
					"<h3>Fixed 🐞</h3>"
				],
				/Fixed 🐞/
			)

			expect(indexes).toEqual([2, 6])
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
