import { interpolateColor } from "./color.util"

const HASH_PRIME = 31
const HASH_MODULO = 1_000

export function colorForWord(text: string, startColor: string, endColor: string): string {
    return interpolateColor(startColor, endColor, stableGradientFactorOf(text))
}

function stableGradientFactorOf(text: string): number {
    let hash = 0
    for (const character of text) {
        hash = (hash * HASH_PRIME + (character.codePointAt(0) ?? 0)) % HASH_MODULO
    }
    return hash / HASH_MODULO
}
