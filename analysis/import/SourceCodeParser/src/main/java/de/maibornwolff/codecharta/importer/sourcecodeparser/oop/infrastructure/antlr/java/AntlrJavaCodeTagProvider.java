package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java;

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.source.SourceCode;
import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging.Tags;
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.application.JavaCodeTagProvider;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.tree.ParseTreeWalker;

import java.io.PrintStream;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class AntlrJavaCodeTagProvider implements JavaCodeTagProvider {

    private PrintStream parseErrorPrintStream;

    public AntlrJavaCodeTagProvider(PrintStream parseErrorPrintStream) {
        this.parseErrorPrintStream = parseErrorPrintStream;
    }

    @Override
    public Map<Integer, List<Tags>> getTags(SourceCode sourceCode) {
        CommonTokenStream tokenStream = getTokenStream(sourceCode);
        Map<Integer, Set<Tags>> categoriesPerLine = new CodeLineCategorizer().getCategoriesPerLine(tokenStream);

        MccListener mccListener = new MccListener(categoriesPerLine);
        new ParseTreeWalker().walk(mccListener, getCompilationUnit(sourceCode, tokenStream));

        return mccListener.getLineTags();
    }

    private CommonTokenStream getTokenStream(SourceCode sourceCode) {
        JavaLexer lexer = new JavaLexer(CharStreams.fromString(String.join("\n", sourceCode.getLines())));
        return new CommonTokenStream(lexer);
    }

    private JavaParser.CompilationUnitContext getCompilationUnit(SourceCode sourceCode, CommonTokenStream tokenStream) {
        JavaParser parser = new JavaParser(tokenStream);
        parser.removeErrorListeners();
        parser.addErrorListener(new SourceNamePrintingErrorListener(parseErrorPrintStream, sourceCode));
        return parser.compilationUnit();
    }
}
