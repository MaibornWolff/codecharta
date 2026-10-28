package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.CopyRules

/**
 * Decision 3 of `go.md`: the logical path is the package's folder, so the files that declare one path are build-tag
 * variants of one package, of which each platform compiles one; a use points at every one of them.
 */
internal val goCopyRules = CopyRules { copies, _ -> copies.map { it.file } }
