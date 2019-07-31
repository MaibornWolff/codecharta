package de.maibornwolff.codecharta.importer.sourcecodeparser.visitors

import org.sonar.java.ast.visitors.ComplexityVisitor
import org.sonar.plugins.java.api.tree.*

class MaxNestingLevelVisitor : ComplexityVisitor() {
    private var maxNestingLevel = 0
    private var currentMaxNestingLevel = 0

    fun getMaxNestingLevel(tree: Tree): Int {
        super.getNodes(tree)
        return maxNestingLevel
    }

    override fun visitMethod(tree: MethodTree) {
        println("visit method")
        currentMaxNestingLevel = 0
        super.visitMethod(tree)
        if (maxNestingLevel < currentMaxNestingLevel) {
            println(currentMaxNestingLevel)
            maxNestingLevel = currentMaxNestingLevel
        }
    }

    override fun visitBlock(tree: BlockTree) {
        //currentMaxNestingLevel = 0
        println("this is a new block")
        super.visitBlock(tree)
    }

    override fun visitIfStatement(tree: IfStatementTree) {
        currentMaxNestingLevel++
        println("if_statement")
        super.visitIfStatement(tree)
    }

    override fun visitDoWhileStatement(tree: DoWhileStatementTree) {
        currentMaxNestingLevel++
        super.visitDoWhileStatement(tree)
    }

    override fun visitConditionalExpression(tree: ConditionalExpressionTree) {
        currentMaxNestingLevel++
        super.visitConditionalExpression(tree)
    }

    override fun visitForEachStatement(tree: ForEachStatement) {
        currentMaxNestingLevel++
        super.visitForEachStatement(tree)
    }

    override fun visitForStatement(tree: ForStatementTree) {
        currentMaxNestingLevel++
        super.visitForStatement(tree)
    }

    override fun visitWhileStatement(tree: WhileStatementTree) {
        currentMaxNestingLevel++
        super.visitWhileStatement(tree)
    }

    override fun visitSwitchExpression(tree: SwitchExpressionTree) {
        currentMaxNestingLevel++
        super.visitSwitchExpression(tree)
    }

    override fun visitTryStatement(tree: TryStatementTree) {
        currentMaxNestingLevel++
        super.visitTryStatement(tree)
    }
}
