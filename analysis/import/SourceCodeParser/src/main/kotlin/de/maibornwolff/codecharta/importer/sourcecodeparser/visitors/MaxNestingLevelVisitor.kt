package de.maibornwolff.codecharta.importer.sourcecodeparser.visitors

import org.sonar.java.ast.visitors.ComplexityVisitor
import org.sonar.plugins.java.api.tree.*

class MaxNestingLevelVisitor : ComplexityVisitor() {
    private var maxNestingLevel = 0
    private var currentNestingLevel = 0
    fun getMaxNestingLevel(tree: Tree): Int {
        super.getNodes(tree)

        return maxNestingLevel
    }

    private fun potentiallyUpdateMaxNestingLevel() {
        if (maxNestingLevel < currentNestingLevel) {
            maxNestingLevel = currentNestingLevel
        }
    }

    override fun visitMethod(tree: MethodTree) {
        currentNestingLevel = 0
        super.visitMethod(tree)
    }

    override fun visitIfStatement(tree: IfStatementTree) {
        currentNestingLevel++

        potentiallyUpdateMaxNestingLevel()

        super.visitIfStatement(tree)

        currentNestingLevel--
    }

    override fun visitDoWhileStatement(tree: DoWhileStatementTree) {
        currentNestingLevel++

        potentiallyUpdateMaxNestingLevel()

        super.visitDoWhileStatement(tree)

        currentNestingLevel--
    }

    override fun visitLambdaExpression(lambdaExpressionTree: LambdaExpressionTree) {
        currentNestingLevel++

        potentiallyUpdateMaxNestingLevel()

        super.visitLambdaExpression(lambdaExpressionTree)

        currentNestingLevel--
    }

    override fun visitConditionalExpression(tree: ConditionalExpressionTree) {
        currentNestingLevel++

        potentiallyUpdateMaxNestingLevel()

        super.visitConditionalExpression(tree)

        currentNestingLevel--
    }

    override fun visitForEachStatement(tree: ForEachStatement) {
        currentNestingLevel++

        potentiallyUpdateMaxNestingLevel()

        super.visitForEachStatement(tree)

        currentNestingLevel--
    }

    override fun visitForStatement(tree: ForStatementTree) {
        currentNestingLevel++

        potentiallyUpdateMaxNestingLevel()

        super.visitForStatement(tree)

        currentNestingLevel--
    }

    override fun visitWhileStatement(tree: WhileStatementTree) {
        currentNestingLevel++

        potentiallyUpdateMaxNestingLevel()

        super.visitWhileStatement(tree)

        currentNestingLevel--
    }

    override fun visitSwitchExpression(tree: SwitchExpressionTree) {
        currentNestingLevel++

        potentiallyUpdateMaxNestingLevel()

        super.visitSwitchExpression(tree)

        currentNestingLevel--
    }

    override fun visitTryStatement(tree: TryStatementTree) {
        currentNestingLevel++

        potentiallyUpdateMaxNestingLevel()

        super.visitTryStatement(tree)

        currentNestingLevel--
    }
}
