import type { DomainWord } from "./domain.model"

export function wordSizingValue(word: DomainWord, sizingMode: WordCloudSizingMode): number {
    if (sizingMode === WordCloudSizingMode.tfidf) {
        return word.tfidf ?? word.frequency
    }
    return word.frequency
}

export enum WordCloudShape {
    circle = "circle",
    cardioid = "cardioid",
    diamond = "diamond",
    triangle = "triangle",
    pentagon = "pentagon",
    star = "star",
    logoM = "logoM"
}

export const wordCloudShapeLabels: Record<WordCloudShape, string> = {
    [WordCloudShape.circle]: "Circle",
    [WordCloudShape.cardioid]: "Heart",
    [WordCloudShape.diamond]: "Diamond",
    [WordCloudShape.triangle]: "Triangle",
    [WordCloudShape.pentagon]: "Pentagon",
    [WordCloudShape.star]: "Star",
    [WordCloudShape.logoM]: "M"
}

export enum WordCloudSizingMode {
    frequency = "frequency",
    tfidf = "tfidf"
}

export interface WordCloudSettings {
    shape: WordCloudShape
    sizeRange: [number, number]
    rotationRange: [number, number]
    rotationStep: number
    gridSize: number
    sizingMode: WordCloudSizingMode
    topN: number
    shrinkToFit: boolean
    drawOutOfBound: boolean
}

export const defaultWordCloudSettings: WordCloudSettings = {
    shape: WordCloudShape.circle,
    sizeRange: [12, 60],
    rotationRange: [-90, 90],
    rotationStep: 90,
    gridSize: 8,
    sizingMode: WordCloudSizingMode.frequency,
    topN: 150,
    shrinkToFit: true,
    drawOutOfBound: false
}

export const withRangeMin = (range: [number, number], min: number): [number, number] => [min, range[1]]
export const withRangeMax = (range: [number, number], max: number): [number, number] => [range[0], max]
