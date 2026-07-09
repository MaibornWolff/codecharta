import { LayoutAlgorithm } from "../../../../model/codeCharta.model"
import { setLayoutAlgorithm } from "./layoutAlgorithm.actions"
import { layoutAlgorithm } from "./layoutAlgorithm.reducer"

describe("layoutAlgorithm", () => {
    describe("setLayoutAlgorithm", () => {
        it("should set new layoutAlgorithm", () => {
            const result = layoutAlgorithm(LayoutAlgorithm.SquarifiedTreeMap, setLayoutAlgorithm({ value: LayoutAlgorithm.StreetMap }))
            expect(result).toEqual(LayoutAlgorithm.StreetMap)
        })
    })
})
