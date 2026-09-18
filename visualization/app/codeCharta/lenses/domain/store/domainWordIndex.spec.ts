import { DomainLensData } from "../../../model/codeCharta.model"
import { createDomainWordIndex } from "./domainWordIndex"

describe("createDomainWordIndex", () => {
    const filesOnlyBank: DomainLensData = {
        "/root/billing/invoice.ts": [
            { text: "invoice", frequency: 6, tfidf: 12.5 },
            { text: "payment", frequency: 2 }
        ],
        "/root/billing/dunning.ts": [{ text: "invoice", frequency: 3, tfidf: 12.5 }],
        "/root/api/client.ts": [{ text: "client", frequency: 1 }]
    }

    it("should sum the words of the files beneath a folder", () => {
        // Arrange
        const index = createDomainWordIndex(filesOnlyBank)

        // Act
        const words = index.wordsOf("/root/billing")

        // Assert
        expect(words).toEqual([
            { text: "invoice", frequency: 9, tfidf: 12.5 },
            { text: "payment", frequency: 2 }
        ])
    })

    it("should sum the whole project at the root, which the word cloud opens on", () => {
        // Arrange
        const index = createDomainWordIndex(filesOnlyBank)

        // Act
        const words = index.wordsOf("/root")

        // Assert
        expect(words).toEqual([
            { text: "invoice", frequency: 9, tfidf: 12.5 },
            { text: "payment", frequency: 2 },
            { text: "client", frequency: 1 }
        ])
    })

    it("should return a file's own words", () => {
        // Arrange
        const index = createDomainWordIndex(filesOnlyBank)

        // Act
        const words = index.wordsOf("/root/api/client.ts")

        // Assert
        expect(words).toEqual([{ text: "client", frequency: 1 }])
    })

    it("should ignore a recorded folder aggregate, so an older file and a newer one agree", () => {
        // Arrange - the roll-up an older producer wrote disagrees with the files it was built from
        const bank: DomainLensData = {
            "/root/billing": [{ text: "invoice", frequency: 999 }],
            "/root/billing/invoice.ts": [{ text: "invoice", frequency: 6 }]
        }
        const index = createDomainWordIndex(bank)

        // Act
        const words = index.wordsOf("/root/billing")

        // Assert
        expect(words).toEqual([{ text: "invoice", frequency: 6 }])
    })

    it("should derive a folder's words only once", () => {
        // Arrange
        const index = createDomainWordIndex(filesOnlyBank)

        // Act
        const words = index.wordsOf("/root")
        const wordsAgain = index.wordsOf("/root")

        // Assert
        expect(wordsAgain).toBe(words)
    })

    it("should list the files carrying words and the folders above them", () => {
        // Arrange
        const index = createDomainWordIndex(filesOnlyBank)

        // Act
        const paths = index.pathsWithWords

        // Assert
        expect(paths).toEqual(
            new Set(["/root", "/root/billing", "/root/api", "/root/billing/invoice.ts", "/root/billing/dunning.ts", "/root/api/client.ts"])
        )
    })

    it("should not list a folder whose files carry no words", () => {
        // Arrange
        const index = createDomainWordIndex({ "/root/empty.ts": [] })

        // Act
        const paths = index.pathsWithWords

        // Assert
        expect(paths).toEqual(new Set())
    })

    it("should keep a lone recorded path readable, having no files to derive from", () => {
        // Arrange - a bank that names only the root, which is nobody's ancestor here
        const index = createDomainWordIndex({ "/root": [{ text: "invoice", frequency: 4 }] })

        // Act
        const words = index.wordsOf("/root")

        // Assert
        expect(words).toEqual([{ text: "invoice", frequency: 4 }])
    })
})
