import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { STATE } from "../../../mocks/dataMocks"
import { CcState, DomainWord } from "../../../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudShape } from "../../../model/wordCloud.model"
import { defaultDomainState } from "../../../stores/domainState/domainState.read.facade"
import { DomainBarReadStore } from "./domainBar.read.store"

describe("DomainBarReadStore", () => {
    function setup(domainState = defaultWordCloudSettings, words: Record<string, DomainWord[]> = {}) {
        const state: CcState = { ...STATE, domainState: { ...defaultDomainState, ...domainState }, domainLensSource: { words } }
        TestBed.configureTestingModule({
            providers: [provideMockStore({ initialState: state }), { provide: State, useValue: { getValue: () => state } }]
        })
        return TestBed.inject(DomainBarReadStore)
    }

    it("should expose the persisted settings as a signal", () => {
        // Arrange
        const domainState = { ...defaultWordCloudSettings, shape: WordCloudShape.star }
        const readStore = setup(domainState)

        // Act & Assert
        expect(readStore.settings()).toEqual(domainState)
    })

    it("should report no tfidf data when no word carries a tfidf score", () => {
        // Arrange
        const readStore = setup(defaultWordCloudSettings, { "/root": [{ text: "invoice", frequency: 1 }] })

        // Act & Assert
        expect(readStore.hasTfidfData()).toBe(false)
    })

    it("should report tfidf data when a word carries a tfidf score", () => {
        // Arrange
        const readStore = setup(defaultWordCloudSettings, { "/root": [{ text: "invoice", frequency: 1, tfidf: 0.4 }] })

        // Act & Assert
        expect(readStore.hasTfidfData()).toBe(true)
    })
})
