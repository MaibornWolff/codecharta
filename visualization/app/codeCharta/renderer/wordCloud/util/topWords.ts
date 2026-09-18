import { DomainWord } from "../../../model/codeCharta.model"
import { WordCloudSizingMode, wordSizingValue } from "../../../model/wordCloud.model"

interface RankedWord {
    word: DomainWord
    value: number
    /** Where the word sat in the input, so equal values keep the order the caller handed them in. */
    index: number
}

/**
 * The highest ranked `topN` words, best first. A project can carry hundreds of thousands of words while
 * the cloud draws a few hundred of them, so the ranking keeps a heap of the best it has seen instead of
 * sorting everything: sorting a 300k word vocabulary costs about 44 ms, and this runs on every render.
 */
export function selectTopWords(words: DomainWord[], sizingMode: WordCloudSizingMode, topN: number): DomainWord[] {
    if (topN <= 0) {
        return []
    }
    const worstFirst: RankedWord[] = []
    for (let index = 0; index < words.length; index++) {
        const candidate = { word: words[index], value: wordSizingValue(words[index], sizingMode), index }
        if (worstFirst.length < topN) {
            siftUp(worstFirst, worstFirst.push(candidate) - 1)
            continue
        }
        if (ranksAbove(candidate, worstFirst[0])) {
            worstFirst[0] = candidate
            siftDown(worstFirst, 0)
        }
    }
    worstFirst.sort((one, other) => (ranksAbove(one, other) ? -1 : 1))
    return worstFirst.map(({ word }) => word)
}

/** Higher value first; equal values keep the caller's order, so the cut-off never depends on the heap. */
function ranksAbove(one: RankedWord, other: RankedWord): boolean {
    return one.value > other.value || (one.value === other.value && one.index < other.index)
}

function siftUp(heap: RankedWord[], startIndex: number): void {
    let index = startIndex
    while (index > 0) {
        const parent = (index - 1) >> 1
        if (!ranksAbove(heap[parent], heap[index])) {
            return
        }
        swap(heap, index, parent)
        index = parent
    }
}

function siftDown(heap: RankedWord[], startIndex: number): void {
    let index = startIndex
    while (hasChild(heap, index)) {
        const worst = worstOfNodeAndChildren(heap, index)
        if (worst === index) {
            return
        }
        swap(heap, index, worst)
        index = worst
    }
}

const hasChild = (heap: RankedWord[], index: number): boolean => leftChildOf(index) < heap.length

function worstOfNodeAndChildren(heap: RankedWord[], index: number): number {
    const left = leftChildOf(index)
    const right = left + 1
    let worst = index
    if (ranksAbove(heap[worst], heap[left])) {
        worst = left
    }
    if (right < heap.length && ranksAbove(heap[worst], heap[right])) {
        worst = right
    }
    return worst
}

const leftChildOf = (index: number): number => 2 * index + 1

function swap(heap: RankedWord[], one: number, other: number): void {
    const swapped = heap[one]
    heap[one] = heap[other]
    heap[other] = swapped
}
