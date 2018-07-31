package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java;

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode;
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging.Tags;
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.application.CodeAnalyzeProvider;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.tree.ParseTreeWalker;

import java.util.List;
import java.util.Map;
import java.util.Set;

public class AntlrEntryPoint implements CodeAnalyzeProvider {

    public static Map<Integer, List<Tags>> addTags(SourceCode sourceCode) {
        JavaLexer lexer = new JavaLexer(CharStreams.fromString(String.join("\n", sourceCode.getLines())));
        CommonTokenStream tokenStream = new CommonTokenStream(lexer);

        JavaParser parser = new JavaParser(tokenStream);
        parser.removeErrorListeners();
        parser.addErrorListener(new SourceNamePrintingErrorListener(sourceCode));
        CommentFinder commentFinder = new CommentFinder();

        Map<Integer, Set<Tags>> lineType = commentFinder.extractComments(tokenStream);

        ExtendedBaseListener extendedBaseListener = new ExtendedBaseListener(lineType);
        new ParseTreeWalker().walk(extendedBaseListener, parser.compilationUnit());

        return extendedBaseListener.getLineTags();
    }
}
