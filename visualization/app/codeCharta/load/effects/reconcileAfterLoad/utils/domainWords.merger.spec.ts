import { TEST_FILE_DATA } from "../../../../mocks/dataMocks"
import { CCFile } from "../../../../model/codeCharta.model"
import { clone } from "../../../../util/clone"
import { getMergedDomainWords } from "./domainWords.merger"

describe("DomainWordsMerger", () => {
    let file1: CCFile
    let file2: CCFile

    beforeEach(() => {
        file1 = clone(TEST_FILE_DATA)
        file1.fileMeta.fileName = "file1"

        file2 = clone(TEST_FILE_DATA)
        file2.fileMeta.fileName = "file2"
    })

    describe("getMergedDomainWords", () => {
        it("should return the words of a single file unchanged", () => {
            // Arrange
            file1.settings.fileSettings.domainWords = { "/root/nodeA": [{ text: "invoice", frequency: 3 }] }

            // Act
            const result = getMergedDomainWords([file1], false)

            // Assert
            expect(result).toEqual({ "/root/nodeA": [{ text: "invoice", frequency: 3 }] })
        })

        it("should merge the path-keyed word banks of all files", () => {
            // Arrange
            file1.settings.fileSettings.domainWords = { "/root/nodeA": [{ text: "invoice", frequency: 3 }] }
            file2.settings.fileSettings.domainWords = { "/root/nodeB": [{ text: "payment", frequency: 5 }] }

            // Act
            const result = getMergedDomainWords([file1, file2], false)

            // Assert
            expect(result).toEqual({
                "/root/nodeA": [{ text: "invoice", frequency: 3 }],
                "/root/nodeB": [{ text: "payment", frequency: 5 }]
            })
        })

        it("should re-key the paths of each file when the map is aggregated", () => {
            // Arrange
            file1.settings.fileSettings.domainWords = { "/root": [{ text: "first", frequency: 1 }] }
            file2.settings.fileSettings.domainWords = { "/root/nodeB": [{ text: "payment", frequency: 5 }] }

            // Act
            const result = getMergedDomainWords([file1, file2], true)

            // Assert
            expect(result).toEqual({
                "/root": [{ text: "first", frequency: 1 }],
                "/root/file1": [{ text: "first", frequency: 1 }],
                "/root/file2/nodeB": [{ text: "payment", frequency: 5 }]
            })
        })

        it("should aggregate the root word banks of all files onto the aggregated root", () => {
            // Arrange
            file1.settings.fileSettings.domainWords = {
                "/root": [
                    { text: "invoice", frequency: 1 },
                    { text: "shared", frequency: 2 }
                ]
            }
            file2.settings.fileSettings.domainWords = {
                "/root": [
                    { text: "shared", frequency: 3 },
                    { text: "payment", frequency: 4 }
                ]
            }

            // Act
            const result = getMergedDomainWords([file1, file2], true)

            // Assert
            expect(result["/root"]).toEqual([
                { text: "invoice", frequency: 1 },
                { text: "shared", frequency: 5 },
                { text: "payment", frequency: 4 }
            ])
        })

        it("should keep the re-keyed bank of each file next to the aggregated root", () => {
            // Arrange
            file1.settings.fileSettings.domainWords = { "/root": [{ text: "invoice", frequency: 1 }] }
            file2.settings.fileSettings.domainWords = { "/root": [{ text: "payment", frequency: 4 }] }

            // Act
            const result = getMergedDomainWords([file1, file2], true)

            // Assert
            expect(result["/root/file1"]).toEqual([{ text: "invoice", frequency: 1 }])
            expect(result["/root/file2"]).toEqual([{ text: "payment", frequency: 4 }])
        })

        it("should keep the strongest tfidf when aggregating a word onto the aggregated root", () => {
            // Arrange
            file1.settings.fileSettings.domainWords = { "/root": [{ text: "shared", frequency: 2, tfidf: 0.8 }] }
            file2.settings.fileSettings.domainWords = { "/root": [{ text: "shared", frequency: 3, tfidf: 0.1 }] }

            // Act
            const result = getMergedDomainWords([file1, file2], true)

            // Assert
            expect(result["/root"]).toEqual([{ text: "shared", frequency: 5, tfidf: 0.8 }])
        })

        it("should let the later file win per word when both files share a path in delta mode", () => {
            // Arrange
            file1.settings.fileSettings.domainWords = {
                "/root": [
                    { text: "invoice", frequency: 1 },
                    { text: "shared", frequency: 2, tfidf: 0.8 }
                ]
            }
            file2.settings.fileSettings.domainWords = {
                "/root": [
                    { text: "shared", frequency: 3, tfidf: 0.1 },
                    { text: "payment", frequency: 4 }
                ]
            }

            // Act
            const result = getMergedDomainWords([file1, file2], false)

            // Assert
            expect(result).toEqual({
                "/root": [
                    { text: "invoice", frequency: 1 },
                    { text: "shared", frequency: 3, tfidf: 0.1 },
                    { text: "payment", frequency: 4 }
                ]
            })
        })

        it("should not mutate the word bank of the merged files", () => {
            // Arrange
            file1.settings.fileSettings.domainWords = { "/root": [{ text: "shared", frequency: 2 }] }
            file2.settings.fileSettings.domainWords = { "/root": [{ text: "shared", frequency: 3 }] }

            // Act
            getMergedDomainWords([file1, file2], false)

            // Assert
            expect(file1.settings.fileSettings.domainWords).toEqual({ "/root": [{ text: "shared", frequency: 2 }] })
        })

        it("should return an empty map when no file has domain words", () => {
            // Arrange
            file1.settings.fileSettings.domainWords = {}
            file2.settings.fileSettings.domainWords = {}

            // Act
            const result = getMergedDomainWords([file1, file2], false)

            // Assert
            expect(result).toEqual({})
        })
    })
})
