import { nestingOf } from "./boxNesting"
import { aBox } from "./dependencyGraphTestData"

describe("nestingOf", () => {
    const boxes = [
        aBox("/root", { parentPath: null }),
        aBox("package:game", { parentPath: "/root" }),
        aBox("/root/src/creature.ts", { parentPath: "package:game" }),
        aBox("/root/src", { parentPath: "/root" })
    ]

    it("should tell a box inside the box it lies in, however deep, and inside itself", () => {
        // Arrange
        const isInside = nestingOf(boxes)

        // Act
        const answers = [
            isInside("/root/src/creature.ts", "package:game"),
            isInside("/root/src/creature.ts", "/root"),
            isInside("/root/src", "/root/src")
        ]

        // Assert
        expect(answers).toEqual([true, true, true])
    })

    it("should go by where a box lies, not by what its path starts with", () => {
        // Arrange
        const isInside = nestingOf(boxes)

        // Act
        const answers = [isInside("/root/src/creature.ts", "/root/src"), isInside("/root", "/root/src"), isInside("/unknown", "/root")]

        // Assert
        expect(answers).toEqual([false, false, false])
    })
})
