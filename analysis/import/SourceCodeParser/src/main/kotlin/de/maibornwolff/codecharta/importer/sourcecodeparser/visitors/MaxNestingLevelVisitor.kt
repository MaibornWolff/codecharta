package de.maibornwolff.codecharta.importer.sourcecodeparser.visitors

import org.sonar.java.ast.visitors.ComplexityVisitor
import org.sonar.plugins.java.api.tree.*

class MaxNestingLevelVisitor: ComplexityVisitor() {
    private var maxNestingLevel = 0
    private var forwardNesting = 0


    fun getMaxNestingLevel(tree: Tree): Int {
        super.getNodes(tree)

        return maxNestingLevel
    }

    private fun checkForChildrenAndUpdateMax(tree: Tree) {
        if(super.getNodes(tree).isEmpty()) {
            if(maxNestingLevel < forwardNesting) {
                maxNestingLevel = forwardNesting
            }
            forwardNesting = 0
        }
    }

    override fun visitMethod(tree: MethodTree) {
        forwardNesting = 0
        super.visitMethod(tree)
    }

    override fun visitIfStatement(tree: IfStatementTree) {
        forwardNesting++

        checkForChildrenAndUpdateMax(tree)

        super.visitIfStatement(tree)
    }

    override fun visitDoWhileStatement(tree: DoWhileStatementTree) {
        forwardNesting++

        checkForChildrenAndUpdateMax(tree)

        super.visitDoWhileStatement(tree)
    }

    override fun visitConditionalExpression(tree: ConditionalExpressionTree) {
        forwardNesting++

        checkForChildrenAndUpdateMax(tree)

        super.visitConditionalExpression(tree)
    }

    override fun visitForEachStatement(tree: ForEachStatement) {
        forwardNesting++

        checkForChildrenAndUpdateMax(tree)

        super.visitForEachStatement(tree)
    }

    override fun visitForStatement(tree: ForStatementTree) {
        forwardNesting++

        checkForChildrenAndUpdateMax(tree)

        super.visitForStatement(tree)
    }

    override fun visitWhileStatement(tree: WhileStatementTree) {
        forwardNesting++

        checkForChildrenAndUpdateMax(tree)

        super.visitWhileStatement(tree)
    }

    override fun visitSwitchExpression(tree: SwitchExpressionTree) {
        forwardNesting++

        checkForChildrenAndUpdateMax(tree)

        super.visitSwitchExpression(tree)
    }

    override fun visitTryStatement(tree: TryStatementTree) {
        forwardNesting++

        checkForChildrenAndUpdateMax(tree)

        super.visitTryStatement(tree)
    }
}
