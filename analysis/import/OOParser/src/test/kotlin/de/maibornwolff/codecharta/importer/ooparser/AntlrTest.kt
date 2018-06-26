package de.maibornwolff.codecharta.importer.ooparser

import de.maibornwolff.codecharta.importer.ooparser.AntlrTestHelper.createParserForFile
import org.assertj.core.api.Assertions.assertThat
import org.junit.Ignore
import org.junit.Test
import java.io.IOException

class AntlrTest {

    @Test
    @Throws(IOException::class)
    fun findsSixClassMembers() {
        val parser = createParserForFile("de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java")

        val ctx = parser.compilationUnit()

        val classBody = ctx.typeDeclaration(0).classDeclaration().classBody().classBodyDeclaration()

        assertThat(classBody.size).isEqualTo(6)
    }

    @Test
    @Throws(IOException::class)
    fun findsIntegerFieldDeclaration() {
        val parser = createParserForFile("de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java")

        val ctx = parser.compilationUnit()

        val bodyDeclaration = ctx.typeDeclaration(0).classDeclaration().classBody().classBodyDeclaration(0)

        assertThat(bodyDeclaration.modifier(0).classOrInterfaceModifier().annotation().qualifiedName().getText()).isEqualTo("Deprecated")
        assertThat(bodyDeclaration.modifier(0).classOrInterfaceModifier().annotation().elementValue().getText()).isEqualTo("\"this is bad code\"")
        assertThat(bodyDeclaration.modifier(1).classOrInterfaceModifier().PRIVATE().getText()).isEqualTo("private")
        assertThat(bodyDeclaration.memberDeclaration().fieldDeclaration().typeType().getText()).isEqualTo("int")
        assertThat(bodyDeclaration.memberDeclaration().fieldDeclaration().variableDeclarators().variableDeclarator(0).variableDeclaratorId().getText()).isEqualTo("stuff")
        assertThat(bodyDeclaration.memberDeclaration().fieldDeclaration().variableDeclarators().variableDeclarator(0).variableInitializer()).isNull()
    }

    @Test
    @Throws(IOException::class)
    fun findsBooleanFieldDeclaration() {
        val parser = createParserForFile("de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java")

        val ctx = parser.compilationUnit()

        val bodyDeclaration = ctx.typeDeclaration(0).classDeclaration().classBody().classBodyDeclaration(1)

        assertThat(bodyDeclaration.modifier(0).classOrInterfaceModifier().getText()).isEqualTo("private")
        assertThat(bodyDeclaration.modifier(1).VOLATILE().getText()).isEqualTo("volatile")
        assertThat(bodyDeclaration.memberDeclaration().fieldDeclaration().typeType().getText()).isEqualTo("boolean")
        assertThat(bodyDeclaration.memberDeclaration().fieldDeclaration().variableDeclarators().variableDeclarator(0).variableDeclaratorId().getText()).isEqualTo("wasReset")
        assertThat(bodyDeclaration.memberDeclaration().fieldDeclaration().variableDeclarators().variableDeclarator(0).variableInitializer().getText()).isEqualTo("false")
    }


    @Test
    @Throws(IOException::class)
    fun findsGetStuffMethodDeclaration() {
        val parser = createParserForFile("de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java")

        val ctx = parser.compilationUnit()

        val bodyDeclaration = ctx.typeDeclaration(0).classDeclaration().classBody().classBodyDeclaration(3)

        assertThat(bodyDeclaration.modifier(0).classOrInterfaceModifier().getText()).isEqualTo("public")
        assertThat(bodyDeclaration.memberDeclaration().methodDeclaration().typeTypeOrVoid().getText()).isEqualTo("Blub")
        assertThat(bodyDeclaration.memberDeclaration().methodDeclaration().IDENTIFIER().getText()).isEqualTo("getStuff")
        assertThat(bodyDeclaration.memberDeclaration().methodDeclaration().methodBody().block().blockStatement().size).isEqualTo(4)

        val blockStatements = bodyDeclaration.memberDeclaration().methodDeclaration().methodBody().block().blockStatement()
        assertThat(blockStatements.get(0).localVariableDeclaration().variableDeclarators().variableDeclarator(0).variableDeclaratorId().getText()).isEqualTo("i")
        assertThat(blockStatements.get(1).statement().expression(0).getText()).isEqualTo("i++")
        assertThat(blockStatements.get(2).statement().expression(0).expression(0).getText()).isEqualTo("i")
        assertThat(blockStatements.get(2).statement().expression(0).expression(1).getText()).isEqualTo("i+0")
        assertThat(blockStatements.get(3).statement().RETURN().getText()).isEqualTo("return")
    }

    @Test
    @Throws(IOException::class)
    fun findsSetStuff() {
        val parser = createParserForFile("de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java")

        val ctx = parser.compilationUnit()

        val bodyDeclaration = ctx.typeDeclaration(0).classDeclaration().classBody().classBodyDeclaration(4)

        assertThat(bodyDeclaration.modifier(0).classOrInterfaceModifier().getText()).isEqualTo("public")
        assertThat(bodyDeclaration.memberDeclaration().methodDeclaration().typeTypeOrVoid().getText()).isEqualTo("void")
        assertThat(bodyDeclaration.memberDeclaration().methodDeclaration().IDENTIFIER().getText()).isEqualTo("setStuff")
        assertThat(bodyDeclaration.memberDeclaration().methodDeclaration().methodBody().block().blockStatement().size).isEqualTo(3)

        val blockStatements = bodyDeclaration.memberDeclaration().methodDeclaration().methodBody().block().blockStatement()
        assertThat(blockStatements.get(0).statement().expression(0).expression(0).getText()).isEqualTo("this.wasReset")
        assertThat(blockStatements.get(1).statement().statement(0).block().blockStatement(0).getText()).isEqualTo("reset(5);")
        assertThat(blockStatements.get(1).statement().statement(1).getText()).isEqualTo("{this.stuff=stuff;}")
        assertThat(blockStatements.get(2).statement().expression(0).expression(0).getText()).isEqualTo("System.out")
        assertThat(blockStatements.get(2).statement().expression(0).methodCall().IDENTIFIER().getText()).isEqualTo("println")
        assertThat(blockStatements.get(2).statement().expression(0).methodCall().expressionList().getText()).isEqualTo("\"SetStuff was called\"")
    }

    @Test
    @Throws(IOException::class)
    fun getAmoutOfImports() {
        val parser = createParserForFile("de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java")
        val javaBaseParserVisitorExtended = JavaBaseParserVisitorExtended()
        javaBaseParserVisitorExtended.getAmoutOfImports(parser)

        var amountOfImports = javaBaseParserVisitorExtended.realLinesOfCode
        assertThat(amountOfImports).isEqualTo(2)
    }

    @Test
    @Throws(IOException::class)
    @Ignore
    fun startVisitCompilationUnit() {
        val parser = createParserForFile("de/maibornwolff/codecharta/importer/ooparser/SourceCodeSimple.java")
        val javaBaseParserVisitorExtended = JavaBaseParserVisitorExtended()

        javaBaseParserVisitorExtended.visitCompilationUnit(parser.compilationUnit())
        val rLoC =  javaBaseParserVisitorExtended.realLinesOfCode
        val importStatements =  javaBaseParserVisitorExtended.importStatements
    }
}