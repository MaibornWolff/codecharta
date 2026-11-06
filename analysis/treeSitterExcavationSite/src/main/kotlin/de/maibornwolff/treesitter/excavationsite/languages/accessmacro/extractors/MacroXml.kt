package de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors

import org.w3c.dom.Element
import org.w3c.dom.Node
import org.xml.sax.ErrorHandler
import org.xml.sax.InputSource
import org.xml.sax.SAXException
import org.xml.sax.SAXParseException
import java.io.IOException
import java.io.StringReader
import javax.xml.XMLConstants
import javax.xml.parsers.DocumentBuilderFactory

/** Reads the XML of a macro (`UserInterfaceMacro`), as the macro designer copies it; null for XML it cannot read. */
internal object MacroXml {
    private const val MACRO = "UserInterfaceMacro"
    private const val STATEMENTS = "Statements"
    private const val SUBMACRO = "Sub"
    private const val ACTION = "Action"
    private const val ARGUMENT = "Argument"
    private const val CONDITIONAL_BLOCK = "ConditionalBlock"
    private const val CONDITION = "Condition"
    private const val GROUP = "Group"
    private const val COMMENT = "Comment"
    private const val NAME = "Name"
    private const val DISALLOW_DOCTYPE = "http://apache.org/xml/features/disallow-doctype-decl"

    private val factory = DocumentBuilderFactory.newInstance().apply {
        isNamespaceAware = true
        setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true)
        setFeature(DISALLOW_DOCTYPE, true)
        isExpandEntityReferences = false
    }

    // Broken XML falls back to the action rows, so the parser reports nothing on its own
    private object Silent : ErrorHandler {
        override fun warning(exception: SAXParseException) = Unit

        override fun error(exception: SAXParseException) = Unit

        override fun fatalError(exception: SAXParseException) = throw exception
    }

    fun read(xml: String): Macro? {
        val root = parse(xml) ?: return null
        val macros = if (root.localName == MACRO) listOf(root) else childElements(root).filter { it.localName == MACRO }
        return Macro(macros.flatMap { statementsIn(it) }, macros.flatMap { submacrosOf(it) })
    }

    private fun parse(xml: String): Element? = try {
        factory.newDocumentBuilder().apply { setErrorHandler(Silent) }.parse(InputSource(StringReader(xml))).documentElement
    } catch (_: SAXException) {
        null
    } catch (_: IOException) {
        null
    }

    private fun submacrosOf(macro: Element): List<Submacro> =
        childElements(macro).filter { it.localName == SUBMACRO }.map { Submacro(it.getAttribute(NAME), statementsIn(it)) }

    private fun statementsIn(element: Element): List<MacroStatement> =
        childElements(element).filter { it.localName == STATEMENTS }.flatMap { childElements(it) }.mapNotNull { statementOf(it) }

    private fun statementOf(element: Element): MacroStatement? = when (element.localName) {
        ACTION -> MacroAction(element.getAttribute(NAME), argumentsOf(element))
        CONDITIONAL_BLOCK -> MacroConditional(childElements(element).map { branchOf(it) })
        GROUP -> MacroGroup(element.getAttribute(NAME), statementsIn(element))
        COMMENT -> MacroComment(element.textContent)
        else -> null
    }

    // An Else holds no condition
    private fun branchOf(element: Element): MacroBranch {
        val condition = childElements(element).firstOrNull { it.localName == CONDITION }?.textContent
        return MacroBranch(condition, statementsIn(element))
    }

    private fun argumentsOf(action: Element): Map<String, String> =
        childElements(action).filter { it.localName == ARGUMENT }.associate { it.getAttribute(NAME) to it.textContent }

    private fun childElements(element: Element): List<Element> {
        val children = element.childNodes
        return (0 until children.length).map { children.item(it) }.filter { it.nodeType == Node.ELEMENT_NODE }.map { it as Element }
    }
}
