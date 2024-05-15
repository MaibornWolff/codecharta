import { MarkedPackage } from "../../../../../codeCharta.model"
import { addMarkedPackage } from "./addMarkedPackage"

describe("addMarkedPackage", () => {
    it("should add a folder that is not marked yet and has no marked children packages", () => {
        const markedPackagesMap = new Map<string, MarkedPackage>()
        markedPackagesMap.set("/root/branch", { path: "/root/branch", color: "#ffffff" })

        addMarkedPackage(markedPackagesMap, { path: "/root/otherBranch", color: "#ffffff" })

        expect(markedPackagesMap.size).toBe(2)
        expect(markedPackagesMap.get("/root/otherBranch")).toEqual({ path: "/root/otherBranch", color: "#ffffff" })
        expect(markedPackagesMap.get("/root/branch")).toEqual({ path: "/root/branch", color: "#ffffff" })
    })

    it("should remove the children of a marked package if color is the same", () => {
        const markedPackagesMap = new Map<string, MarkedPackage>()

        addMarkedPackage(markedPackagesMap, { path: "/root/branch", color: "#ffffff" })
        addMarkedPackage(markedPackagesMap, { path: "/root", color: "#ffffff" })

        expect(markedPackagesMap.size).toBe(1)
        expect(markedPackagesMap.get("/root")).toEqual({ path: "/root", color: "#ffffff" })
    })

    it("should not remove the children of a marked package if color is different", () => {
        const markedPackagesMap = new Map<string, MarkedPackage>()

        addMarkedPackage(markedPackagesMap, { path: "/root/branch", color: "#ffffff" })
        addMarkedPackage(markedPackagesMap, { path: "/root", color: "#000000" })

        expect(markedPackagesMap.size).toBe(2)
        expect(markedPackagesMap.get("/root/branch")).toEqual({ path: "/root/branch", color: "#ffffff" })
        expect(markedPackagesMap.get("/root")).toEqual({ path: "/root", color: "#000000" })
    })

    it("should not overwrite color of already marked sub-node", () => {
        const markedPackagesMap = new Map<string, MarkedPackage>()
        markedPackagesMap.set("/root/branch", { path: "/root/branch", color: "#000000" })

        addMarkedPackage(markedPackagesMap, { path: "/root", color: "#ffffff" })

        expect(markedPackagesMap.size).toBe(2)
        expect(markedPackagesMap.get("/root/branch")).toEqual({ path: "/root/branch", color: "#000000" })
        expect(markedPackagesMap.get("/root")).toEqual({ path: "/root", color: "#ffffff" })
    })
})
