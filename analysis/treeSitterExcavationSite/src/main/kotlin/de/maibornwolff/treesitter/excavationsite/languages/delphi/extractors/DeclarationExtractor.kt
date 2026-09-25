package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

/**
 * Extracts type declarations (classes, interfaces, records, enums, helpers) from a Delphi file.
 *
 * Pascal wraps every type declaration in a `declType` node:
 *   `TMyClass = class(Base, IFoo) ... end;`
 *   `TPoint = record X, Y: Integer; end;`
 *   `TColor = (Red, Green, Blue);`
 *
 * The inner `type` field distinguishes the variant:
 *   - `declClass` with keyword `kClass` / `kObject` / ObjC variants → CLASS
 *   - `declClass` with keyword `kRecord` → RECORD
 *   - `declIntf` (also covers `dispinterface`) → INTERFACE
 *   - `declHelper` → CLASS (class / record / type helpers)
 *   - `type` wrapper containing `declEnum` → ENUM
 *
 * Type aliases (`TInt = Integer;`), arrays, sets, and other non-declaration type
 * kinds are skipped. Forward declarations (`TFoo = class;`) are filtered so the
 * full definition is the unique entry for a given type name. Declarations whose
 * name cannot be resolved are also skipped (defensive extraction).
 *
 * Nested type declarations (`type TInner = class … end;` inside another type body)
 * are emitted as siblings of their enclosing type, with `parentPath` carrying the
 * outer-to-inner enclosing chain.
 *
 * Pascal splits classes across interface (declaration) and implementation (method
 * bodies) sections. Method implementations live in `defProc` nodes attached to
 * `implementation`, NOT inside the owning `declType`. Their used types are
 * therefore gathered separately and attributed back to the declaring class by
 * parsing the `TFoo.Method` prefix on `defProc.header.name`.
 */
internal object DeclarationExtractor {
    private const val DECL_TYPE = "declType"
    private const val DECL_CLASS = "declClass"
    private const val DECL_INTF = "declIntf"
    private const val DECL_HELPER = "declHelper"
    private const val DECL_ENUM = "declEnum"
    private const val DEF_PROC = "defProc"
    private const val TYPE_FIELD = "type"
    private const val HEADER_FIELD = "header"
    private const val NAME_FIELD = "name"
    private const val ENTITY_FIELD = "entity"
    private const val LHS_FIELD = "lhs"
    private const val IDENTIFIER = "identifier"
    private const val GENERIC_DOT = "genericDot"
    private const val GENERIC_TPL = "genericTpl"
    private const val K_CLASS = "kClass"
    private const val K_RECORD = "kRecord"
    private const val K_OBJECT = "kObject"
    private const val K_OBJC_CLASS = "kObjcclass"
    private const val K_OBJC_CATEGORY = "kObjccategory"
    private const val K_OBJC_PROTOCOL = "kObjcprotocol"
    private const val K_END = "kEnd"

    private val CLASS_KEYWORDS = setOf(K_CLASS, K_OBJECT, K_OBJC_CLASS, K_OBJC_CATEGORY, K_OBJC_PROTOCOL)

    fun extract(rootNode: TSNode, sourceCode: String): List<Declaration> {
        val defProcsByClass = collectDefProcsByClass(rootNode, sourceCode)
        // Build the full declType→name lookup before filtering forward decls so that the parent-path
        // walk can still resolve any ancestor that we don't end up emitting (e.g. an outer forward
        // wrapper that the parser may produce).
        val allDeclTypes = TreeTraversal.findAllDescendantsOfType(rootNode, DECL_TYPE)
        val namesByStartByte = allDeclTypes.associate { it.startByte to extractDelphiDeclTypeName(it, sourceCode) }
        return allDeclTypes
            .filter { !isForwardDeclaration(it) }
            .mapNotNull { declTypeNode ->
                val name = namesByStartByte[declTypeNode.startByte]
                if (name.isNullOrBlank()) return@mapNotNull null

                val declarationType = resolveDeclarationType(declTypeNode) ?: return@mapNotNull null
                val additionalRoots = defProcsByClass[name].orEmpty()
                val usedTypes = UsedTypeExtractor.extractFromRoots(listOf(declTypeNode) + additionalRoots, sourceCode)
                Declaration(
                    name = name,
                    type = declarationType,
                    usedTypes = usedTypes,
                    parentPath = findParentPath(declTypeNode, namesByStartByte)
                )
            }
    }

    /**
     * Walks the AST parent chain collecting names of ancestor `declType` nodes, outer-to-inner.
     * Mirrors the Kotlin/C# approach so nested-type declarations carry their enclosing-class chain.
     */
    private fun findParentPath(declTypeNode: TSNode, namesByStartByte: Map<Int, String?>): List<String> {
        val parents = mutableListOf<String>()
        var current = declTypeNode.parent
        while (current != null && !current.isNull) {
            if (current.type == DECL_TYPE) {
                val parentName = namesByStartByte[current.startByte]
                if (!parentName.isNullOrBlank()) parents.add(0, parentName)
            }
            current = current.parent
        }
        return parents
    }

    /**
     * A forward declaration `TFoo = class;` parses as a `declType` whose `declClass` body contains
     * only the kind keyword (`kClass` / `kRecord` / …) — no `kEnd`, no parent clause, no members.
     * We skip these so the later full definition wins as the unique entry for the type name.
     */
    private fun isForwardDeclaration(declTypeNode: TSNode): Boolean {
        val typeFieldNode = declTypeNode.getChildByFieldName(TYPE_FIELD)
        if (typeFieldNode.isNull) return false
        if (typeFieldNode.type != DECL_CLASS && typeFieldNode.type != DECL_INTF) return false
        return typeFieldNode.children().none { it.type == K_END }
    }

    /**
     * Groups every `defProc` by the class name it is implementing.
     *
     * `defProc.header.name` is a `genericDot` like `TFoo.Method` (or `TFoo<T>.Method`
     * for generic classes); the `lhs` side is the class name. Free-standing procedures
     * have a plain `identifier` name and are not associated with any class.
     *
     * Operator implementations (`class operator TAny.Implicit(…)`) keep the same shape:
     * the method-name segment uses the regular `identifier` node (the AST does not wrap
     * it in `operatorName`). Since [qualifiedNameClassPrefix] only inspects the LHS to
     * resolve the owning class, operator implementations are bound just like any other
     * method.
     */
    private fun collectDefProcsByClass(rootNode: TSNode, sourceCode: String): Map<String, List<TSNode>> {
        val result = mutableMapOf<String, MutableList<TSNode>>()
        TreeTraversal.findAllDescendantsOfType(rootNode, DEF_PROC).forEach { defProc ->
            val header = defProc.getChildByFieldName(HEADER_FIELD)
            if (header.isNull) return@forEach
            val nameNode = header.getChildByFieldName(NAME_FIELD)
            if (nameNode.isNull) return@forEach
            val className = qualifiedNameClassPrefix(nameNode, sourceCode) ?: return@forEach
            result.getOrPut(className) { mutableListOf() } += defProc
        }
        return result
    }

    private fun qualifiedNameClassPrefix(nameNode: TSNode, sourceCode: String): String? {
        if (nameNode.type != GENERIC_DOT) return null
        val lhs = nameNode.getChildByFieldName(LHS_FIELD)
        if (lhs.isNull) return null
        return when (lhs.type) {
            IDENTIFIER -> TreeTraversal.getNodeText(lhs, sourceCode)
            GENERIC_TPL -> {
                val entity = lhs.getChildByFieldName(ENTITY_FIELD)
                if (!entity.isNull && entity.type == IDENTIFIER) {
                    TreeTraversal.getNodeText(entity, sourceCode)
                } else {
                    null
                }
            }
            GENERIC_DOT -> {
                // Nested qualification (e.g. `Namespace.Class.Method`): take the penultimate
                // segment as the class name, which is the rhs of the outer lhs.
                val innerRhs = lhs.getChildByFieldName("rhs")
                if (!innerRhs.isNull && innerRhs.type == IDENTIFIER) {
                    TreeTraversal.getNodeText(innerRhs, sourceCode)
                } else {
                    null
                }
            }
            else -> null
        }
    }

    private fun resolveDeclarationType(declTypeNode: TSNode): DeclarationType? {
        val typeFieldNode = declTypeNode.getChildByFieldName(TYPE_FIELD)
        if (typeFieldNode.isNull) return null

        // Unrecognised shapes (type aliases like `TInt = Integer;`, subranges, array / set / proc-ref
        // types, and `type Integer`-style distinct-type aliases) return null and are skipped at the
        // call site via `return@mapNotNull null`.
        return when (typeFieldNode.type) {
            DECL_CLASS -> classifyDeclClass(typeFieldNode)
            DECL_INTF -> DeclarationType.INTERFACE
            DECL_HELPER -> DeclarationType.CLASS
            TYPE_FIELD -> classifyTypeWrapper(typeFieldNode)
            else -> null
        }
    }

    /**
     * `declClass` is shared between classes, records, and Pascal `object` types —
     * the first keyword child (`kClass` / `kRecord` / `kObject` / ObjC variants)
     * distinguishes them.
     */
    private fun classifyDeclClass(declClassNode: TSNode): DeclarationType {
        val keyword = declClassNode
            .children()
            .firstOrNull { it.type in CLASS_KEYWORDS || it.type == K_RECORD }
            ?: return DeclarationType.CLASS
        return if (keyword.type == K_RECORD) DeclarationType.RECORD else DeclarationType.CLASS
    }

    /**
     * A `type` wrapper that contains a `declEnum` child is an enum declaration.
     * Other wrapped types (arrays, sets, aliases, …) are not modelled as declarations.
     */
    private fun classifyTypeWrapper(typeNode: TSNode): DeclarationType? {
        val hasEnum = typeNode.children().any { it.type == DECL_ENUM }
        return if (hasEnum) DeclarationType.ENUM else null
    }
}
