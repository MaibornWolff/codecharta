import { XMLParser } from "fast-xml-parser"
import { getXMLmodel } from "./build3mfModel"

describe("build3mfModel", () => {
    it("should return a valid xml", () => {
        const testVetrices = ["<vertex x='x' y='y' z='z'/>", "<vertex x='x' y='y' z='z'/>"]
        const testTriangles = ["<triangle v1='1' v2='2' v3='3'/>", "<triangle v1='1' v2='2' v3='3'/>"]

        const xmlContent = getXMLmodel(testVetrices, testTriangles)
        const xmlParser = new XMLParser({ removeNSPrefix: false, ignoreAttributes: false, parseAttributeValue: true })
        const xmlObject = xmlParser.parse(xmlContent)

        expect(xmlObject["model"]["resources"]["object"]["mesh"]["triangles"]["triangle"]).toHaveLength(2)
        expect(xmlObject["model"]["resources"]["object"]["mesh"]["vertices"]["vertex"]).toHaveLength(2)
    })
})
