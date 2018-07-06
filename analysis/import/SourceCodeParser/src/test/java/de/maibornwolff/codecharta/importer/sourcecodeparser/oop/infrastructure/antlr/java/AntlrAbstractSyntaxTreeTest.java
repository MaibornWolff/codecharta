package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java;

import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import static java.nio.file.Files.readAllBytes;
import static org.assertj.core.api.Assertions.assertThat;

public class AntlrAbstractSyntaxTreeTest {

    @Test
    public void findsSixClassMembers() throws IOException {
        JavaParser parser = createSimpleParser();
        JavaParser.CompilationUnitContext ctx = parser.compilationUnit();

        List<JavaParser.ClassBodyDeclarationContext> classBody = ctx.typeDeclaration(0).classDeclaration()
                .classBody().classBodyDeclaration();

        assertThat(classBody.size()).isEqualTo(6);
    }

    @Test
    public void findsIntegerFieldDeclaration() throws IOException {
        JavaParser parser = createSimpleParser();
        JavaParser.CompilationUnitContext ctx = parser.compilationUnit();

        JavaParser.ClassBodyDeclarationContext bodyDeclaration = ctx.typeDeclaration(0).classDeclaration().classBody().classBodyDeclaration(0);

        assertThat(bodyDeclaration.modifier(0).classOrInterfaceModifier().annotation().qualifiedName().getText()).isEqualTo("Deprecated");
        assertThat(bodyDeclaration.modifier(0).classOrInterfaceModifier().annotation().elementValue().getText()).isEqualTo("\"this is bad code\"");
        assertThat(bodyDeclaration.modifier(1).classOrInterfaceModifier().PRIVATE().getText()).isEqualTo("private");
        assertThat(bodyDeclaration.memberDeclaration().fieldDeclaration().typeType().getText()).isEqualTo("int");
        assertThat(bodyDeclaration.memberDeclaration().fieldDeclaration().variableDeclarators().variableDeclarator(0).variableDeclaratorId().getText()).isEqualTo("stuff");
        assertThat(bodyDeclaration.memberDeclaration().fieldDeclaration().variableDeclarators().variableDeclarator(0).variableInitializer()).isNull();
    }

    @Test
    public void findsBooleanFieldDeclaration() throws IOException {
        JavaParser parser = createSimpleParser();
        JavaParser.CompilationUnitContext ctx = parser.compilationUnit();

        JavaParser.ClassBodyDeclarationContext bodyDeclaration = ctx.typeDeclaration(0).classDeclaration().classBody().classBodyDeclaration(1);

        assertThat(bodyDeclaration.modifier(0).classOrInterfaceModifier().getText()).isEqualTo("private");
        assertThat(bodyDeclaration.modifier(1).VOLATILE().getText()).isEqualTo("volatile");
        assertThat(bodyDeclaration.memberDeclaration().fieldDeclaration().typeType().getText()).isEqualTo("boolean");
        assertThat(bodyDeclaration.memberDeclaration().fieldDeclaration().variableDeclarators().variableDeclarator(0).variableDeclaratorId().getText()).isEqualTo("wasReset");
        assertThat(bodyDeclaration.memberDeclaration().fieldDeclaration().variableDeclarators().variableDeclarator(0).variableInitializer().getText()).isEqualTo("false");
    }


    @Test
    public void findsGetStuffMethodDeclaration() throws IOException {
        JavaParser parser = createSimpleParser();
        JavaParser.CompilationUnitContext ctx = parser.compilationUnit();

        JavaParser.ClassBodyDeclarationContext bodyDeclaration = ctx.typeDeclaration(0).classDeclaration().classBody().classBodyDeclaration(3);

        assertThat(bodyDeclaration.modifier(0).classOrInterfaceModifier().getText()).isEqualTo("public");
        assertThat(bodyDeclaration.memberDeclaration().methodDeclaration().typeTypeOrVoid().getText()).isEqualTo("Blub");
        assertThat(bodyDeclaration.memberDeclaration().methodDeclaration().IDENTIFIER().getText()).isEqualTo("getStuff");
        assertThat(bodyDeclaration.memberDeclaration().methodDeclaration().methodBody().block().blockStatement().size()).isEqualTo(4);

        List<JavaParser.BlockStatementContext> blockStatements = bodyDeclaration.memberDeclaration().methodDeclaration().methodBody().block().blockStatement();
        assertThat(blockStatements.get(0).localVariableDeclaration().variableDeclarators().variableDeclarator(0).variableDeclaratorId().getText()).isEqualTo("i");
        assertThat(blockStatements.get(1).statement().expression(0).getText()).isEqualTo("i++");
        assertThat(blockStatements.get(2).statement().expression(0).expression(0).getText()).isEqualTo("i");
        assertThat(blockStatements.get(2).statement().expression(0).expression(1).getText()).isEqualTo("i+0");
        assertThat(blockStatements.get(3).statement().RETURN().getText()).isEqualTo("return");
    }

    @Test
    public void findsSetStuff() throws IOException {
        JavaParser parser = createSimpleParser();
        JavaParser.CompilationUnitContext ctx = parser.compilationUnit();

        JavaParser.ClassBodyDeclarationContext bodyDeclaration = ctx.typeDeclaration(0).classDeclaration().classBody().classBodyDeclaration(4);

        assertThat(bodyDeclaration.modifier(0).classOrInterfaceModifier().getText()).isEqualTo("public");
        assertThat(bodyDeclaration.memberDeclaration().methodDeclaration().typeTypeOrVoid().getText()).isEqualTo("void");
        assertThat(bodyDeclaration.memberDeclaration().methodDeclaration().IDENTIFIER().getText()).isEqualTo("setStuff");
        assertThat(bodyDeclaration.memberDeclaration().methodDeclaration().methodBody().block().blockStatement().size()).isEqualTo(3);

        List<JavaParser.BlockStatementContext> blockStatements = bodyDeclaration.memberDeclaration().methodDeclaration().methodBody().block().blockStatement();
        assertThat(blockStatements.get(0).statement().expression(0).expression(0).getText()).isEqualTo("this.wasReset");
        assertThat(blockStatements.get(1).statement().statement(0).block().blockStatement(0).getText()).isEqualTo("reset(5);");
        assertThat(blockStatements.get(1).statement().statement(1).getText()).isEqualTo("if(reset(-1)){this.stuff=stuff;}");
        assertThat(blockStatements.get(2).statement().expression(0).expression(0).getText()).isEqualTo("System.out");
        assertThat(blockStatements.get(2).statement().expression(0).methodCall().IDENTIFIER().getText()).isEqualTo("println");
        assertThat(blockStatements.get(2).statement().expression(0).methodCall().expressionList().getText()).isEqualTo("\"SetStuff was called\"");
    }

    private JavaParser createSimpleParser() throws IOException {
        return createParserForFile(getClass().getClassLoader().getResource("de/maibornwolff/codecharta/importer/sourcecodeparser/oop/domain/metrics/java/SourceCodeSimple.java").getFile());
    }

    private JavaParser createParserForFile(String filePath) throws IOException {
        return createParser(new ByteArrayInputStream(readAllBytes(new File(filePath).toPath())));
    }

    private JavaParser createParser(InputStream code) throws IOException {

        JavaLexer lexer = new JavaLexer(CharStreams.fromStream(code));
        CommonTokenStream tokens = new CommonTokenStream(lexer);

        return new JavaParser(tokens);
    }
}
