@file:Suppress("unused")

package de.maibornwolff.treesitter.excavationsite.languages

import de.maibornwolff.treesitter.excavationsite.shared.domain.Language

/**
 * Re-export Language from shared/domain for backward compatibility.
 *
 * This type alias allows code that imports Language from the languages package
 * to continue working while the actual implementation lives in shared/domain.
 */
typealias Language = Language
