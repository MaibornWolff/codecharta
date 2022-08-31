import { NodeType } from "../../../../codeCharta.model"
import { haveSameRoots } from "./compareCollapsedRoot"

describe("haveSameRoots", () => {
	it("should return false if root names are different", () => {
		const reference = { name: "rootA", type: NodeType.FOLDER }
		const comp = { name: "rootB", type: NodeType.FOLDER }

		expect(haveSameRoots(reference.name, comp.name)).toBeFalsy()
	})

	it("should return true if we compare root/app/index.ts and root/myApp.ts", () => {
		const reference = { name: "root", type: NodeType.FOLDER, children: [{ name: "myApp.ts", type: NodeType.FILE }] }
		const comp = {
			name: "root",
			type: NodeType.FOLDER,
			children: [{ name: "app", type: NodeType.FOLDER, children: [{ name: "index.ts", type: NodeType.FILE }] }]
		}

		expect(haveSameRoots(reference.name, comp.name)).toBeTruthy()
	})
})

/*
describe("compareCollapsedRoots", () => {
	it("should return false if root names are different", () => {
		const reference = { name: "rootA", type: NodeType.FOLDER }
		const comp = { name: "rootB", type: NodeType.FOLDER }

		const areComparable = haveSameRoots(reference, comp)
		const areComparableSwitched = haveSameRoots(comp, reference)

		expect(areComparable).toBe(false)
		expect(areComparableSwitched).toBe(false)
	})
	it("should return true if we compare root/app/index.ts and root/myApp.ts", () => {
		const reference = { name: "root", type: NodeType.FOLDER, children: [{ name: "myApp.ts", type: NodeType.FILE }] }
		const comp = {
			name: "root",
			type: NodeType.FOLDER,
			children: [{ name: "app", type: NodeType.FOLDER, children: [{ name: "index.ts", type: NodeType.FILE }] }]
		}

		const areComparable = haveSameRoots(reference, comp)
		const areComparableSwitched = haveSameRoots(comp, reference)

		expect(areComparable).toBe(true)
		expect(areComparableSwitched).toBe(true)
	})
	it("should return false if we compare root/index.ts and rootFolder/index.ts", () => {
		const reference = { name: "root", type: NodeType.FOLDER, children: [{ name: "index.ts", type: NodeType.FILE }] }
		const comp = { name: "rootFolder", type: NodeType.FOLDER, children: [{ name: "index.ts", type: NodeType.FILE }] }

		const areComparable = haveSameRoots(reference, comp)
		const areComparableSwitched = haveSameRoots(comp, reference)

		expect(areComparable).toBe(false)
		expect(areComparableSwitched).toBe(false)
	})
})

describe("getCollapsedRoot", () => {
	it("returns node name if children property is undefined", () => {
		const node = { name: "root", type: NodeType.FOLDER }

		const collapsedRoot = getCollapsedRoot(node)

		expect(collapsedRoot).toBe("root/")
	})
	it("returns node name if no children is empty array", () => {
		const node = { name: "root", children: [], type: NodeType.FOLDER }

		const collapsedRoot = getCollapsedRoot(node)

		expect(collapsedRoot).toBe("root/")
	})
	it("returns node name if three children exist", () => {
		const child1 = { name: "child1", children: [], type: NodeType.FOLDER }
		const child2 = { name: "child2", children: [], type: NodeType.FILE }
		const child3 = { name: "child3", children: [], type: NodeType.FOLDER }
		const node = { name: "root", children: [child1, child2, child3], type: NodeType.FOLDER }

		const collapsedRoot = getCollapsedRoot(node)

		expect(collapsedRoot).toBe("root/")
	})
	it("returns node name + child name if node has exactly one child which is a folder", () => {
		const child = { name: "onlyChild", children: [], type: NodeType.FOLDER }
		const node = { name: "root", children: [child], type: NodeType.FOLDER }

		const collapsedRoot = getCollapsedRoot(node)

		expect(collapsedRoot).toBe("root/onlyChild/")
	})
	it("returns all folder names concatenated by '/', if a chain of only-children occurs", () => {
		const indexFile = { name: "index.ts", children: [], type: NodeType.FILE }
		const sourceFolder = { name: "src", children: [indexFile], type: NodeType.FOLDER }
		const appFolder = { name: "app", children: [sourceFolder], type: NodeType.FOLDER }
		const rootFolder = { name: "root", children: [appFolder], type: NodeType.FOLDER }

		const collapsedRoot = getCollapsedRoot(rootFolder)

		expect(collapsedRoot).toBe("root/app/src/")
	})
	it("returns node name if node has exactly one child which is a file", () => {
		const child = { name: "onlyChild", children: [], type: NodeType.FILE }
		const node = { name: "root", children: [child], type: NodeType.FOLDER }

		const collapsedRoot = getCollapsedRoot(node)

		expect(collapsedRoot).toBe("root/")
	})
})

*/
