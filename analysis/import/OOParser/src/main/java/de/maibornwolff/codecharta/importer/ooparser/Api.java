package de.maibornwolff.codecharta.importer.ooparser;

import de.maibornwolff.codecharta.importer.ooparser.antlr.java.JavaLexer;
import de.maibornwolff.codecharta.importer.ooparser.antlr.java.JavaParser;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;

import java.io.*;

public class Api {

    public static void addTagsToSource(Source source) throws IOException {
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
