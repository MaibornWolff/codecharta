import { RecursivePartial, CcState } from "../codeCharta.model"
import { convertToVectors } from "./settingsHelper"
import { Vector3 } from "three"

describe("SettingsHelper", () => {
    describe("convertToVectors", () => {
        it("should transform object to Vector3 with smaller state", () => {
            const partialState = {
                mapState: {
                    scaling: { y: 27 }
                }
            }

            const expected: RecursivePartial<CcState> = {
                mapState: {
                    scaling: new Vector3(1, 27, 1)
                }
            }

            convertToVectors(partialState as RecursivePartial<CcState>)

            expect(partialState).toEqual(expected)
        })

        it("should transform object to Vector3 with larger state", () => {
            const partialState = {
                mapState: {
                    scaling: { y: 27 },
                    invertHeight: false,
                    amountOfTopLabels: 23,
                    labelSize: 1
                }
            }

            const expected: RecursivePartial<CcState> = {
                mapState: {
                    scaling: new Vector3(1, 27, 1),
                    invertHeight: false,
                    amountOfTopLabels: 23,
                    labelSize: 1
                }
            }

            convertToVectors(partialState as RecursivePartial<CcState>)

            expect(partialState).toEqual(expected)
        })
    })
})
