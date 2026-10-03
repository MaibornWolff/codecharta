import { WordCloudViewStore } from "./wordCloudView.store"

describe("WordCloudViewStore", () => {
    it("should count every request for the whole cloud, so two in a row are both heard", () => {
        // Arrange
        const store = new WordCloudViewStore()

        // Act
        store.requestFit()
        store.requestFit()

        // Assert
        expect(store.fitRequest()).toBe(2)
    })
})
