package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration

internal object DeclarationMerger {
    fun merge(declarations: List<Declaration>): List<Declaration> {
        val merged = linkedMapOf<Pair<List<String>, String>, Declaration>()
        for (decl in declarations) {
            val key = decl.parentPath to decl.name
            val existing = merged[key]
            merged[key] = if (existing == null) decl else existing.copy(usedTypes = existing.usedTypes + decl.usedTypes)
        }
        return merged.values.toList()
    }
}
