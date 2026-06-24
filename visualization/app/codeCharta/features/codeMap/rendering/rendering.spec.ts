import { CodeMapShaderStrings } from "./shaders/loaders/codeMapShaderStrings"

describe("common rendering tests", () => {
    describe("shader strings", () => {
        it("init", () => {
            const cmss: CodeMapShaderStrings = new CodeMapShaderStrings()
            expect(cmss.fragmentShaderCode).toMatchSnapshot()
            expect(cmss.vertexShaderCode).toMatchSnapshot()
        })
    })
})
