import { firstValueFrom } from "rxjs"
import { WordSortingOption } from "../../../features/domainWordOccurrences/facade"
import { DomainWordSortStore } from "./domainWordSort.store"

describe("DomainWordSortStore", () => {
    it("should open on the most frequent words first", async () => {
        // Arrange & Act
        const store = new DomainWordSortStore()

        // Assert
        expect(await firstValueFrom(store.sorting$)).toEqual({ option: WordSortingOption.OCCURRENCES, ascending: false })
    })

    it("should offer every way a word list can be ordered", () => {
        // Arrange & Act
        const store = new DomainWordSortStore()

        // Assert
        expect(store.options).toEqual([WordSortingOption.OCCURRENCES, WordSortingOption.NAME, WordSortingOption.RELEVANCE])
    })

    it("should start a picked option in the direction it reads best in", async () => {
        // Arrange — names read A to Z, counts read biggest first
        const store = new DomainWordSortStore()

        // Act
        store.setOption(WordSortingOption.NAME)

        // Assert
        expect(await firstValueFrom(store.sorting$)).toEqual({ option: WordSortingOption.NAME, ascending: true })
    })

    it("should sort the most relevant word first when relevance is picked", async () => {
        // Arrange
        const store = new DomainWordSortStore()

        // Act
        store.setOption(WordSortingOption.RELEVANCE)

        // Assert
        expect(await firstValueFrom(store.sorting$)).toEqual({ option: WordSortingOption.RELEVANCE, ascending: false })
    })

    it("should flip the order on toggleAscending", async () => {
        // Arrange
        const store = new DomainWordSortStore()

        // Act
        store.toggleAscending()

        // Assert
        expect(await firstValueFrom(store.ascending$)).toBe(true)
    })
})
