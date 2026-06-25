import { TEST_GAMEOBJECTS_FILE } from "./gameObjectsMocks"
import { clone } from "../../../../util/clone"
import { parseGameObjectsFile } from "./gameObjectsImporter"

describe("GameObjectsImporter", () => {
    it("should parse gameObjects json to cc.json", function () {
        const gameObjectsFile = clone(TEST_GAMEOBJECTS_FILE)

        expect(parseGameObjectsFile(JSON.stringify(gameObjectsFile))).toMatchSnapshot()
    })
})
