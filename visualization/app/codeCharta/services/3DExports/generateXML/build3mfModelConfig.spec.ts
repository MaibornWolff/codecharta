import { XMLParser } from "fast-xml-parser"
import { Volume } from "../serialize3mf.service"
import { getXMLmodelConfig } from "./build3mfModelConfig"

describe("build3mfModelConfig", () => {
    it("should return a valid xml with properly defined volumes", () => {
        const exampleVolumeList: Volume[] = []
        for (let index = 0; index < 5; index++) {
            const aVolume: Volume = {
                id: index,
                name: "",
                color: "",
                extruder: index,
                firstTriangleId: index * 10,
                lastTriangleId: index * 10 + 9
            }
            exampleVolumeList[index] = aVolume
        }

        const xmlContent = getXMLmodelConfig(exampleVolumeList)
        const xmlParser = new XMLParser({ removeNSPrefix: false, ignoreAttributes: false, parseAttributeValue: true })
        const xmlObject = xmlParser.parse(xmlContent)

        let expectedID = 0

        for (const volume of xmlObject["config"]["object"]["volume"]) {
            expect(volume["@_firstid"]).toBe(expectedID)
            expectedID = volume["@_lastid"] + 1
            // name, extruder, source_object_id, source_volume_id
            expect(volume["metadata"][1]["@_value"]).toBeLessThanOrEqual(5)
            expect(volume["metadata"][2]["@_value"]).toBe(1)
        }
    })
})
