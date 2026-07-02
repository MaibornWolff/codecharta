import { firstValueFrom, of } from "rxjs"
import { AttributeTypeValue } from "../../../codeCharta.model"
import { TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED } from "../../../mocks/dataMocks"
import { MetricsLensStore } from "../store/metricsLens.store"
import { DescriptorsRepo } from "./descriptors.repo"

function repoFor(nodeTypes: Record<string, AttributeTypeValue>): DescriptorsRepo {
    const fakeStore: Pick<MetricsLensStore, "attributeDescriptors$" | "attributeTypes$" | "getAttributeDescriptors" | "getAttributeTypes"> =
        {
            attributeDescriptors$: of(TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED),
            attributeTypes$: of(nodeTypes),
            getAttributeDescriptors: () => TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED,
            getAttributeTypes: () => nodeTypes
        }
    return new DescriptorsRepo(fakeStore as MetricsLensStore)
}

describe("DescriptorsRepo", () => {
    it("should expose the attribute descriptors", () => {
        expect(repoFor({}).descriptors()).toEqual(TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED)
    })

    it("should expose the node-side attribute types the store projects", () => {
        const nodes = { rloc: AttributeTypeValue.absolute }

        expect(repoFor(nodes).attributeTypes()).toEqual(nodes)
    })

    it("should emit the node-side attribute types reactively", async () => {
        const nodes = { rloc: AttributeTypeValue.relative }

        await expect(firstValueFrom(repoFor(nodes).attributeTypes$)).resolves.toEqual(nodes)
    })
})
