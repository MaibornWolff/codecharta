@file:Suppress("unused")

package de.maibornwolff.treesitter.excavationsite.api

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.DependencyResult
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

// Re-export from shared.domain for public API consumers
typealias DependencyResult = DependencyResult
typealias Declaration = Declaration
typealias DeclarationType = DeclarationType
typealias ImportDeclaration = ImportDeclaration
typealias ImportKind = ImportKind
typealias UsedType = UsedType
