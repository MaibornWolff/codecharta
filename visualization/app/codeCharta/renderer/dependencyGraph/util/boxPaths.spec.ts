import { declarationPathOf } from "./boxPaths"

describe("declarationPathOf", () => {
    it("should put a declaration below its file, where no node of the map can be", () => {
        // Act
        const path = declarationPathOf("/root/game/creature.ts", "game.Creature")

        // Assert
        expect(path).toBe("/root/game/creature.ts/game.Creature")
    })
})
