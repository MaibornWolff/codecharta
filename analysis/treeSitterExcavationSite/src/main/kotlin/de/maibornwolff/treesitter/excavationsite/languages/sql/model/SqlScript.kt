package de.maibornwolff.treesitter.excavationsite.languages.sql.model

/**
 * What a SQL file creates, changes and names, for the name lookup of the dependency parser (`sql.md`). A name is its
 * parts as the database compares them: unquoted parts in lower case, a part quoted in mixed case as written.
 * [statements] are the statements outside every object, in groups of one default schema.
 */
data class SqlScript(val objects: List<SqlObject>, val statements: List<SqlStatements>)

enum class SqlObjectKind {
    TABLE,
    VIEW,
    SYNONYM,
    SEQUENCE,
    TYPE,
    DOMAIN,
    ROUTINE,
    TRIGGER,
    PACKAGE,
    PACKAGE_BODY,
    TYPE_BODY,

    /** A statement that changes an object: `ALTER TABLE`, `CREATE INDEX … ON`, `COMMENT ON`; [SqlObject.name] is the object. */
    CHANGE
}

/**
 * An object a statement creates or changes, named as written without a database (`[sales, orders]`), after the
 * [defaultSchema] `SET search_path` or `CURRENT_SCHEMA` set; [names] are what it writes outside its [members], without
 * those its locals hide; [changedKind] is what a change names (`ALTER SEQUENCE`), null for a table or view.
 */
data class SqlObject(
    val kind: SqlObjectKind,
    val name: List<String>,
    val defaultSchema: String? = null,
    val members: List<SqlMember> = emptyList(),
    val names: List<SqlName> = emptyList(),
    val changedKind: SqlObjectKind? = null
)

enum class SqlMemberKind {
    ROUTINE,
    CONSTANT,
    VARIABLE,
    TYPE,
    CURSOR,
    EXCEPTION,

    /** An attribute or method of an object type. */
    ATTRIBUTE
}

/** A member of a package specification or body, or of an object type, with the names it writes. */
data class SqlMember(val name: String, val kind: SqlMemberKind, val names: List<SqlName> = emptyList())

/** Statements outside every object, with the schema `SET search_path` or `CURRENT_SCHEMA` set before them. */
data class SqlStatements(val defaultSchema: String?, val names: List<SqlName>)

enum class SqlNameKind {
    /** A table, view or synonym: `FROM`, `JOIN`, `INTO`, `REFERENCES`, `%ROWTYPE`. */
    RELATION,

    /** A routine: a call, `EXEC`, `CALL`, `PERFORM`, `EXECUTE FUNCTION`, a call in `FROM`. */
    ROUTINE,

    /** The type of a column, parameter, variable or return value, or of a cast. */
    TYPE,

    /** A sequence: `NEXTVAL`, `CURRVAL`, `NEXT VALUE FOR`, `nextval('…')`. */
    SEQUENCE,

    /** A dotted name in an expression, which means something only as a member of a package (`pricing.c_max`). */
    MEMBER,

    /** A plain identifier inside a package, which means something only as a member of that package (`c_max`). */
    BARE,

    /** What a synonym stands for: an object of any kind. */
    ANY
}

/** A name as written, in its parts, and the kind of object its position asks for. */
data class SqlName(val parts: List<String>, val kind: SqlNameKind)
