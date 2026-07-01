import { firstValueFrom, of } from "rxjs"
import { AttributeTypes, AttributeTypeValue } from "../../../codeCharta.model"
import { TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED } from "../../../mocks/dataMocks"
import { MetricsLensStore } from "../store/metricsLens.store"
import { DescriptorsRepo } from "./descriptors.repo"

function repoFor(attributeTypes: AttributeTypes): DescriptorsRepo {
    const fakeStore: Pick<MetricsLensStore, "attributeDescriptors$" | "attributeTypes$" | "getAttributeDescriptors" | "getAttributeTypes"> =
        {
            attributeDescriptors$: of(TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED),
            attributeTypes$: of(attributeTypes),
            getAttributeDescriptors: () => TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED,
            getAttributeTypes: () => attributeTypes
        }
    return new DescriptorsRepo(fakeStore as MetricsLensStore)
}

describe("DescriptorsRepo", () => {
    it("should expose the attribute descriptors", () => {
        expect(repoFor({ nodes: {}, edges: {} }).descriptors()).toEqual(TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED)
    })

    it("should expose the node-side attribute types", () => {
        const nodes = { rloc: AttributeTypeValue.absolute }

        expect(repoFor({ nodes, edges: {} }).attributeTypes()).toEqual(nodes)
    })

    it("should default to an empty map when AttributeTypes.nodes is undefined", () => {
        expect(repoFor({ edges: {} }).attributeTypes()).toEqual({})
    })

    it("should emit the node-side attribute types reactively", async () => {
        const nodes = { rloc: AttributeTypeValue.relative }

        await expect(firstValueFrom(repoFor({ nodes, edges: {} }).attributeTypes$)).resolves.toEqual(nodes)
    })
})
