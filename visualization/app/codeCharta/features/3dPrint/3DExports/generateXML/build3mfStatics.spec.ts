import { getXMLcontentType, getXMLrelationships } from "./build3mfStatics"
import { XMLValidator } from "fast-xml-parser"

describe("build3mfStatics", () => {
    describe("contentType", () => {
        it("should return valid xml", () => {
            const xmlContent = getXMLcontentType()
            expect(XMLValidator.validate(xmlContent)).toBe(true)
        })
    })

    describe("relationships", () => {
        it("should return valid xml", () => {
            const xmlContent = getXMLrelationships()
            expect(XMLValidator.validate(xmlContent)).toBe(true)
        })
    })
})
