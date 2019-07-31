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

    private fun potentiallyUpdateMaxNestingLevel() {
        if (maxNestingLevel < forwardNesting) {
            maxNestingLevel = forwardNesting
        }
    }

    override fun visitMethod(tree: MethodTree) {
        forwardNesting = 0
        super.visitMethod(tree)
    }

    override fun visitIfStatement(tree: IfStatementTree) {
        forwardNesting++

        potentiallyUpdateMaxNestingLevel()

        super.visitIfStatement(tree)

        forwardNesting--
    }

    override fun visitDoWhileStatement(tree: DoWhileStatementTree) {
        forwardNesting++

        potentiallyUpdateMaxNestingLevel()

        super.visitDoWhileStatement(tree)

        forwardNesting--
    }

    override fun visitLambdaExpression(lambdaExpressionTree: LambdaExpressionTree) {
        forwardNesting++

        potentiallyUpdateMaxNestingLevel()

        super.visitLambdaExpression(lambdaExpressionTree)

        forwardNesting--
    }

    override fun visitConditionalExpression(tree: ConditionalExpressionTree) {
        forwardNesting++

        potentiallyUpdateMaxNestingLevel()

        super.visitConditionalExpression(tree)

        forwardNesting--
    }

    override fun visitForEachStatement(tree: ForEachStatement) {
        forwardNesting++

        potentiallyUpdateMaxNestingLevel()

        super.visitForEachStatement(tree)

        forwardNesting--
    }

    override fun visitForStatement(tree: ForStatementTree) {
        forwardNesting++

        potentiallyUpdateMaxNestingLevel()

        super.visitForStatement(tree)

        forwardNesting--
    }

    override fun visitWhileStatement(tree: WhileStatementTree) {
        forwardNesting++

        potentiallyUpdateMaxNestingLevel()

        super.visitWhileStatement(tree)

        forwardNesting--
    }

    override fun visitSwitchExpression(tree: SwitchExpressionTree) {
        forwardNesting++

        potentiallyUpdateMaxNestingLevel()

        super.visitSwitchExpression(tree)

        forwardNesting--
    }

    override fun visitTryStatement(tree: TryStatementTree) {
        forwardNesting++

        potentiallyUpdateMaxNestingLevel()

        super.visitTryStatement(tree)

        forwardNesting--
    }
}
