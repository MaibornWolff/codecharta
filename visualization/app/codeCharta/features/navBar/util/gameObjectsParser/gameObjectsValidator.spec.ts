import { clone } from "../../../../util/clone"
import { TEST_GAMEOBJECTS_FILE } from "./gameObjectsMocks"
import { validateGameObjects } from "./gameObjectsValidator"

/**
 * The validator takes a JSON string, so its input may legitimately hold values the schema rejects.
 * Widening the fields a test mutates to `unknown` states that intent in the type instead of suppressing it.
 */
type GameObjectsFileWithUncheckedValues = {
    gameObjectPositions: { name: string; position: { x: unknown; y: number; z: number }; scale: unknown }[]
}

describe("GameObjectsValidator", () => {
    it("should accept a gameObjects file with a valid structure", () => {
        // Arrange
        const gameObjectsFile = clone(TEST_GAMEOBJECTS_FILE)

        // Act
        const isValid = validateGameObjects(JSON.stringify(gameObjectsFile))

        // Assert
        expect(isValid).toBeTruthy()
    })

    it("should reject a gameObjects file when position and scale hold values of the wrong type", () => {
        // Arrange
        const gameObjectsFile: GameObjectsFileWithUncheckedValues = clone(TEST_GAMEOBJECTS_FILE)
        gameObjectsFile.gameObjectPositions[0].position.x = false
        gameObjectsFile.gameObjectPositions[0].scale = {}

        // Act
        const isValid = validateGameObjects(JSON.stringify(gameObjectsFile))

        // Assert
        expect(isValid).toBeFalsy()
    })
})
