import { XMLValidator } from "fast-xml-parser"
import { getXMLcontentType, getXMLrelationships } from "./build3mfStatics"

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
