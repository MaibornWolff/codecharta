import { declarationPathOf } from "./boxPaths"

describe("declarationPathOf", () => {
    it("should put a declaration below its file, where no node of the map can be", () => {
        // Arrange
        const filePath = "/root/game/creature.ts"

        // Act
        const path = declarationPathOf(filePath, "game.Creature")

        // Assert
        expect(path).toBe("/root/game/creature.ts/game.Creature")
    })
})
