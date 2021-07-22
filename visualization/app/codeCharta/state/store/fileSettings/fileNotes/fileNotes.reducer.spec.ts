import { fileNotes } from "./fileNotes.reducer"
import { FileNotesAction, setFileNotes } from "./fileNotes.actions"

describe("fileNotes", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = fileNotes(undefined, {} as FileNotesAction)

			expect(result).toEqual([])
		})
	})

	describe("Action: SET_FILE_NOTES", () => {
		it("should set new fileNotes", () => {
			const result = fileNotes(
				[],
				setFileNotes([
					{
						fileName: "sample1.cc.json",
						notes: [
							{ nodePath: "root/ParentLeaf", text: "Some text", metricData: ["mcc, rloc, rloc, pairingRate"] },
							{
								nodePath: "root/ParentLeaf/smallLeaf.html",
								text: "Some more text",
								metricData: ["mcc, rloc, rloc, pairingRate"]
							}
						]
					},
					{
						fileName: "sample2.cc.json",
						notes: [
							{ nodePath: "root/ParentLeaf", text: "Some note", metricData: ["mcc, rloc, rloc, pairingRate"] },
							{ nodePath: "root/bigLeaf.ts", text: "Some more notes", metricData: ["mcc, rloc, rloc, pairingRate"] }
						]
					}
				])
			)

			expect(result).toEqual([
				{
					fileName: "sample1.cc.json",
					notes: [
						{ nodePath: "root/ParentLeaf", text: "Some text", metricData: ["mcc, rloc, rloc, pairingRate"] },
						{ nodePath: "root/ParentLeaf/smallLeaf.html", text: "Some more text", metricData: ["mcc, rloc, rloc, pairingRate"] }
					]
				},
				{
					fileName: "sample2.cc.json",
					notes: [
						{ nodePath: "root/ParentLeaf", text: "Some note", metricData: ["mcc, rloc, rloc, pairingRate"] },
						{ nodePath: "root/bigLeaf.ts", text: "Some more notes", metricData: ["mcc, rloc, rloc, pairingRate"] }
					]
				}
			])
		})

		it("should set default fileNotes", () => {
			const result = fileNotes(
				[
					{
						fileName: "sample1.cc.json",
						notes: [
							{ nodePath: "root/ParentLeaf", text: "Some text", metricData: ["mcc, rloc, rloc, pairingRate"] },
							{
								nodePath: "root/ParentLeaf/smallLeaf.html",
								text: "Some more text",
								metricData: ["mcc, rloc, rloc, pairingRate"]
							}
						]
					},
					{
						fileName: "sample2.cc.json",
						notes: [
							{ nodePath: "root/ParentLeaf", text: "Some note", metricData: ["mcc, rloc, rloc, pairingRate"] },
							{ nodePath: "root/bigLeaf.ts", text: "Some more notes", metricData: ["mcc, rloc, rloc, pairingRate"] }
						]
					}
				],
				setFileNotes()
			)

			expect(result).toEqual([])
		})
	})
})
