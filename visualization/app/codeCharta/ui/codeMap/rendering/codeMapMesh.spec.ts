import { Node } from "../../../codeCharta.model"
import { CodeMapMesh } from "./codeMapMesh"
import { CodeMapBuilding } from "./codeMapBuilding"
import { STATE, TEST_NODE_ROOT } from "../../../util/dataMocks"

describe("codeMapMesh", () => {
    const testNodes: Node[] = [TEST_NODE_ROOT] // no need for 2 files

    describe("setNewDeltaColor", () => {
        let codeMapBuilding: CodeMapBuilding
        const {
            appSettings: { mapColors }
        } = STATE

        const setFlattened = (isFlat: boolean) => {
            for (const node of testNodes) {
                node.flat = isFlat
            }
        }

        const rebuildMesh = () => {
            const codedMapMesh = new CodeMapMesh([TEST_NODE_ROOT], STATE, true)
            codeMapBuilding = codedMapMesh.getBuildingByPath(TEST_NODE_ROOT.path)
        }

        it("should not set flat color when not flat", () => {
            setFlattened(false)
            rebuildMesh()

            expect(testNodes[0].flat).toBeFalsy()
            expect(codeMapBuilding.deltaColor).not.toEqual(mapColors.flat)
        })

        it("should set flat color when flat", () => {
            setFlattened(true)
            rebuildMesh()

            expect(testNodes[0].flat).toBeTruthy()
            expect(codeMapBuilding.deltaColor).toEqual(mapColors.flat)
        })
    })
})
