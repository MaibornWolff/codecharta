import { readFileSync } from "fs"
import { resolve } from "path"
import vendoredSchema from "./ccJson2Schema.json"

describe("ccJson2Schema drift guard", () => {
    it("should keep the vendored cc.json 2.0 schema in sync with the repo-root source of truth", () => {
        // Arrange
        const sourcePath = resolve(__dirname, "../../../../dev_docs/cc-json-2.0.schema.json")

        // Act
        const sourceSchema = JSON.parse(readFileSync(sourcePath, "utf8"))

        // Assert
        expect(vendoredSchema).toEqual(sourceSchema)
    })
})
