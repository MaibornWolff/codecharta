package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java;

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.TaggableLines;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;

import java.io.IOException;

public class Antlr {

    public static void addTags(TaggableLines source) throws IOException {
        String code = source.text();
        JavaLexer lexer = new JavaLexer(CharStreams.fromString(code));
        CommonTokenStream tokenStream = new CommonTokenStream(lexer);
        JavaParser parser = new JavaParser(tokenStream);
        ExtendedBaseVisitor visitor = new ExtendedBaseVisitor(source);
        CommentFinder commentFinder = new CommentFinder(source);

        commentFinder.extractComments(tokenStream);
        visitor.visit(parser.compilationUnit());
    }
}
