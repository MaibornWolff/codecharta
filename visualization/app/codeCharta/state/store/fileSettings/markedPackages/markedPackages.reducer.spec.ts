import { markedPackages } from "./markedPackages.reducer"
import { setMarkedPackages, markPackages, unmarkPackage } from "./markedPackages.actions"
import { MARKED_PACKAGES } from "../../../../util/dataMocks"

describe("markedPackages", () => {
    describe("Action: SET_MARKED_PACKAGES", () => {
        it("should set new markedPackages", () => {
            const result = markedPackages([], setMarkedPackages({ value: MARKED_PACKAGES }))

            expect(result).toEqual(MARKED_PACKAGES)
        })
    })

    describe("Action: UNMARK_PACKAGE", () => {
        it("should remove a marked package", () => {
            const result = markedPackages([{ path: "/root", color: "#000000" }], unmarkPackage({ path: "/root" }))
            expect(result).toEqual([])
        })

        it("should remove nothing, if a parent of a marked node is unmarked", () => {
            const result = markedPackages([{ path: "/root/child", color: "#000000" }], unmarkPackage({ path: "/root" }))
            expect(result).toEqual([{ path: "/root/child", color: "#000000" }])
        })
    })

    describe("Action: MARK_PACKAGES", () => {
        it("should add a package", () => {
            const result = markedPackages([MARKED_PACKAGES[0]], markPackages({ packages: MARKED_PACKAGES.slice(1) }))
            expect(result).toEqual(MARKED_PACKAGES)
        })

        it("should remove the children of a marked package if children marked color is the same", () => {
            const result = markedPackages(
                [{ path: "/root/child", color: "#000000" }],
                markPackages({ packages: [{ path: "/root", color: "#000000" }] })
            )
            expect(result.length).toBe(1)
            expect(result[0]).toEqual({ path: "/root", color: "#000000" })
        })

        it("should not remove the children of a marked package if color is different", () => {
            const result = markedPackages(
                [{ path: "/root/child", color: "#000000" }],
                markPackages({ packages: [{ path: "/root", color: "#ffffff" }] })
            )
            expect(result.length).toBe(2)
            expect(result[0]).toEqual({ path: "/root/child", color: "#000000" })
            expect(result[1]).toEqual({ path: "/root", color: "#ffffff" })
        })

        it("should replace package if it was already marked", () => {
            const result = markedPackages(
                [
                    { path: "/root", color: "#ffffff" },
                    { path: "/root/child", color: "#000000" }
                ],
                markPackages({ packages: [{ path: "/root", color: "#333333" }] })
            )
            expect(result.length).toBe(2)
            expect(result[0]).toEqual({ path: "/root", color: "#333333" })
            expect(result[1]).toEqual({ path: "/root/child", color: "#000000" })
        })
    })
})
