import "./codeCharta.module"
import { stateObjectReplacer, stateObjectReviver } from "./codeCharta.model"

describe("codeChartaModel", () => {
    describe("stateObjectReplacer", () => {
        it("should replace a Set or Map object in the state object with a native object on JSON.stringify'", () => {
            const state = {
                primitive: "value",
                object1: {
                    property1: "test"
                },
                map1: new Map([
                    ["key1", "value1"],
                    ["key2", "value2"]
                ]),
                set1: new Set(["SetValue1", "SetValue2"])
            }

            const stateAsJson = JSON.stringify(state, stateObjectReplacer)
            expect(stateAsJson).toContain('"primitive":"value"')
            expect(stateAsJson).toContain('"object1":{"property1":"test"}')

            expect(stateAsJson).toContain('"dataType":"Map"')
            expect(stateAsJson).toContain('"dataType":"Set"')
        })
    })

    describe("stateObjectReviver", () => {
        it("should revive a Set or Map object within a Json string on JSON.parse'", () => {
            const stateAsJson =
                '{"primitive":"value","object1":{"property1":"test"},"map1":{"dataType":"Map","value":[["key1","value1"],["key2","value2"]]},"set1":{"dataType":"Set","value":["SetValue1","SetValue2"]}}'

            const state = JSON.parse(stateAsJson, stateObjectReviver)
            expect(state.primitive).toBe("value")
            expect(state.object1.property1).toBe("test")

            expect(state.map1 instanceof Map).toBe(true)
            expect(state.set1 instanceof Set).toBe(true)
        })
    })
})
