@file:Suppress("unused")

package de.maibornwolff.treesitter.excavationsite.api

import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiDeclarationKind
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiSection
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiUnit
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiUnitKind
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustExternCrate
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustImpl
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustItem
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustItemKind
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustModDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustModule
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustNamespace
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustPath
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustUse
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustVisibility
import de.maibornwolff.treesitter.excavationsite.shared.domain.AliasPathStart
import de.maibornwolff.treesitter.excavationsite.shared.domain.AngularDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.AngularSelector
import de.maibornwolff.treesitter.excavationsite.shared.domain.BundlerAlias
import de.maibornwolff.treesitter.excavationsite.shared.domain.ComponentRegistration
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.DependencyResult
import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedDeclarations
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.TypeUsage
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

// Re-export from shared.domain for public API consumers
typealias DependencyResult = DependencyResult
typealias Declaration = Declaration
typealias DeclarationType = DeclarationType
typealias ImportDeclaration = ImportDeclaration
typealias ImportKind = ImportKind
typealias TypeUsage = TypeUsage
typealias UsedType = UsedType
typealias BundlerAlias = BundlerAlias
typealias ComponentRegistration = ComponentRegistration
typealias AliasPathStart = AliasPathStart
typealias AngularDeclaration = AngularDeclaration
typealias AngularSelector = AngularSelector
typealias EmbeddedDeclarations = EmbeddedDeclarations
typealias DelphiUnit = DelphiUnit
typealias DelphiUnitKind = DelphiUnitKind
typealias DelphiSection = DelphiSection
typealias DelphiDeclaration = DelphiDeclaration
typealias DelphiDeclarationKind = DelphiDeclarationKind
typealias RustModule = RustModule
typealias RustModDeclaration = RustModDeclaration
typealias RustItem = RustItem
typealias RustItemKind = RustItemKind
typealias RustUse = RustUse
typealias RustImpl = RustImpl
typealias RustExternCrate = RustExternCrate
typealias RustPath = RustPath
typealias RustNamespace = RustNamespace
typealias RustVisibility = RustVisibility
