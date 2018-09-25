package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.infrastructure.antlr.java;

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagging.Tags;
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.BranchTags;
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.CodeTags;
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.MethodTags;
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.UnsortedCodeTags;

import java.util.*;

class MccListener extends JavaParserBaseListener {

    private Map<Integer, List<Tags>> lineTags = new HashMap<>();

    Map<Integer, List<Tags>> getLineTags() {
        return lineTags;
    }

    MccListener(Map<Integer, Set<Tags>> lineType) {
        for (Map.Entry<Integer, Set<Tags>> entry : lineType.entrySet()) {
            lineTags.put(entry.getKey(), new ArrayList<>(entry.getValue()));
        }
    }

    @Override
    public void enterPackageDeclaration(JavaParser.PackageDeclarationContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.PACKAGE);
    }

    @Override
    public void enterImportDeclaration(JavaParser.ImportDeclarationContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.IMPORT);
    }

    @Override
    public void enterAnnotation(JavaParser.AnnotationContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.ANNOTATION_INVOCATION);
    }

    /**
     * --> @interface BlockingOperations {
     * boolean fileSystemOperations();
     * }
     */
    @Override
    public void enterAnnotationTypeDeclaration(JavaParser.AnnotationTypeDeclarationContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.ANNOTATION);
    }

    /**
     * @interface BlockingOperations {
     * -->      boolean fileSystemOperations();
     * -->      boolean networkOperations() default false;
     * }
     */
    @Override
    public void enterAnnotationTypeElementDeclaration(JavaParser.AnnotationTypeElementDeclarationContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.ANNOTATION_ELEMENT);
    }

    @Override
    public void enterClassDeclaration(JavaParser.ClassDeclarationContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.CLASS);
    }

    @Override
    public void enterInterfaceDeclaration(JavaParser.InterfaceDeclarationContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.INTERFACE);
    }

    @Override
    public void enterEnumDeclaration(JavaParser.EnumDeclarationContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.ENUM);
    }

    @Override
    public void enterConstructorDeclaration(JavaParser.ConstructorDeclarationContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.CONSTRUCTOR);
    }

    @Override
    public void enterStatement(JavaParser.StatementContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.STATEMENT);
    }

    @Override
    public void exitStatement(JavaParser.StatementContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.STATEMENT);
    }

    /**
     * try (
     * -->    java.util.zip.ZipFile zf =
     * new java.util.zip.ZipFile(zipFileName);
     * -->    java.io.BufferedWriter writer =
     * java.nio.file.Files.newBufferedWriter(outputFilePath, charset)
     * )
     */
    @Override
    public void enterResource(JavaParser.ResourceContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.RESOURCE);
    }

    /**
     * --> } catch (SQLException e) {
     * JDBCTutorialUtilities.printSQLException(e);
     * }
     */
    @Override
    public void enterCatchClause(JavaParser.CatchClauseContext ctx) {
        addTag(ctx.getStart().getLine(), BranchTags.CATCH);
    }

    /**
     * --> } finally{
     * db.close();
     * }
     */
    @Override
    public void enterFinallyBlock(JavaParser.FinallyBlockContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.FINALLY);
    }

    /**
     * public static void writeToFileZipFileContents(String zipFileName)
     * -->  throws IOException, NullPointerException
     */
    @Override
    public void enterQualifiedNameList(JavaParser.QualifiedNameListContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.THROWS_DECLARATION);
    }

    /**
     * switch (month) {
     * -->  case 1:
     * break;
     * -->  default:
     * break;
     */
    @Override
    public void enterSwitchLabel(JavaParser.SwitchLabelContext ctx) {
        CodeTags codeTag = BranchTags.CASE;
        if (ctx.DEFAULT() != null) {
            codeTag = UnsortedCodeTags.DEFAULT_CASE;
        }
        addTag(ctx.getStart().getLine(), codeTag);
    }

    /**
     * --> if (obj == null)
     * --> while (obj == null)
     * do { sth();
     * -->  } while(obj == null)
     * -->  switch (ch) {
     * case 'A': ....
     */
    @Override
    public void enterParExpression(JavaParser.ParExpressionContext ctx) {
        if (isMcCabeBranchStatement(ctx)) {
            addTag(ctx.getStart().getLine(), BranchTags.CONDITION);
        }
    }

    private boolean isMcCabeBranchStatement(JavaParser.ParExpressionContext ctx) {
        boolean parentIsNotSwitch = false;
        if (ctx.getParent() instanceof JavaParser.StatementContext) {
            JavaParser.StatementContext statement = (JavaParser.StatementContext) ctx.getParent();
            if (statement.SWITCH() == null && statement.SYNCHRONIZED() == null) {
                parentIsNotSwitch = true;
            }
        }
        return parentIsNotSwitch;
    }

    /**
     * --> for (int i = 0; i < 5; i++){
     * doStuff();
     * }
     * --> for(String element : list)
     * doSth();
     * }
     */
    @Override
    public void enterForControl(JavaParser.ForControlContext ctx) {
        addTag(ctx.getStart().getLine(), BranchTags.CONDITION);
    }

    /**
     * Called when a constant in an interface is found
     **/
    @Override
    public void enterConstDeclaration(JavaParser.ConstDeclarationContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.INTERFACE_CONSTANT);
    }

    @Override
    public void enterLambdaExpression(JavaParser.LambdaExpressionContext ctx) {
        addTag(ctx.getStart().getLine(), MethodTags.LAMBDA);
    }

    @Override
    public void enterFieldDeclaration(JavaParser.FieldDeclarationContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.CLASS_FIELD);
    }

    @Override
    public void enterInterfaceMethodDeclaration(JavaParser.InterfaceMethodDeclarationContext ctx) {
        addTag(ctx.getStart().getLine(), MethodTags.METHOD);
    }

    @Override
    public void enterMethodDeclaration(JavaParser.MethodDeclarationContext ctx) {
        addTag(ctx.getStart().getLine(), MethodTags.METHOD);
    }

    @Override
    public void enterVariableDeclarator(JavaParser.VariableDeclaratorContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.VARIABLE);
    }

    @Override
    public void enterEnumConstant(JavaParser.EnumConstantContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.ENUM_CONSTANT);
    }

    @Override
    public void enterExpression(JavaParser.ExpressionContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.EXPRESSION);
        if (ctx.bop != null) {
            if (ctx.bop.getText().equals("||")) {
                addTag(ctx.getStart().getLine(), BranchTags.OR_CONDITION);
            } else if (ctx.bop.getText().equals("&&")) {
                addTag(ctx.getStart().getLine(), BranchTags.AND_CONDITION);
            } else if (ctx.bop.getText().equals("?")) {
                addTag(ctx.getStart().getLine(), BranchTags.TERNARY_CONDITION);
            }
        }
    }

    @Override
    public void enterMethodCall(JavaParser.MethodCallContext ctx) {
        addTag(ctx.getStart().getLine(), UnsortedCodeTags.METHOD_CALL);
    }

    private void addTag(int lineNumber, CodeTags codeTag) {
        List<Tags> tags = lineTags.get(lineNumber);
        if (tags.contains(UnsortedCodeTags.ANY)) {
            tags.remove(UnsortedCodeTags.ANY);
        }

        tags.add(codeTag);
    }

}
