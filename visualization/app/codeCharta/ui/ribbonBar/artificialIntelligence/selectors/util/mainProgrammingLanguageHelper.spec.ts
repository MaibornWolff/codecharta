import { getMostFrequentLanguage } from "./mainProgrammingLanguageHelper"

describe("mainProgrammingLanguageHelper", () => {
    it("should get most frequently programming language", () => {
        const numberOfFilesByLanguage = new Map<string, number>([
            ["java", 10],
            ["css", 9],
            ["html", 8]
        ])
        expect(getMostFrequentLanguage(numberOfFilesByLanguage)).toBe("java")
    })

    it("should get undefined when a programming language is not detected", () => {
        const numberOfFilesByLanguage = new Map<string, number>()
        expect(getMostFrequentLanguage(numberOfFilesByLanguage)).toBeUndefined()
    })
})
