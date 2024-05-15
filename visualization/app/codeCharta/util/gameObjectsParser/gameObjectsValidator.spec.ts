import { validateGameObjects } from "./gameObjectsValidator"
import { clone } from "../clone"
import { TEST_GAMEOBJECTS_FILE } from "./gameObjectsMocks"

describe("GameObjectsValidator", () => {
    it("should check if gameObjects File structure is valid", function () {
        const gameObjectsFile = clone(TEST_GAMEOBJECTS_FILE)

        expect(validateGameObjects(JSON.stringify(gameObjectsFile))).toBeTruthy()

        // @ts-ignore
        gameObjectsFile.gameObjectPositions[0].position.x = false
        // @ts-ignore
        gameObjectsFile.gameObjectPositions[0].scale = {}

        expect(validateGameObjects(JSON.stringify(gameObjectsFile))).toBeFalsy()
    })
})
