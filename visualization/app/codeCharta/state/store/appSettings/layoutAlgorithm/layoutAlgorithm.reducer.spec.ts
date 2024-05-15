import { layoutAlgorithm } from "./layoutAlgorithm.reducer"
import { setLayoutAlgorithm } from "./layoutAlgorithm.actions"
import { LayoutAlgorithm } from "../../../../codeCharta.model"

describe("layoutAlgorithm", () => {
    describe("setLayoutAlgorithm", () => {
        it("should set new layoutAlgorithm", () => {
            const result = layoutAlgorithm(LayoutAlgorithm.SquarifiedTreeMap, setLayoutAlgorithm({ value: LayoutAlgorithm.StreetMap }))
            expect(result).toEqual(LayoutAlgorithm.StreetMap)
        })
    })
})
