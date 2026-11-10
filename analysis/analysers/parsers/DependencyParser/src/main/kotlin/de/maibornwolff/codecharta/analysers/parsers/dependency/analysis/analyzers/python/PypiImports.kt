package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python

import de.maibornwolff.codecharta.model.ExternalImport
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.ImportKind

/**
 * The PyPI distributions a Python file imports: an absolute import whose module is neither the project's nor the
 * standard library's, by its top-level package, written as the distribution it comes in when the two names differ
 * (`yaml` → `PyYAML`). Without an analysis root the project's own modules cannot be told apart and count too.
 */
internal class PypiImports(private val modules: PythonModules?, private val importingFolder: List<String>) {
    fun of(imports: List<ImportDeclaration>): Set<ExternalImport> = imports.mapNotNull(::distributionOf).toSet()

    private fun distributionOf(import: ImportDeclaration): ExternalImport? {
        val module = if (!import.isWildcard && import.kind == ImportKind.MEMBER) import.path.dropLast(1) else import.path
        val topLevel = module.firstOrNull()?.takeIf { it.isNotEmpty() && it != RELATIVE } ?: return null
        if (topLevel in STANDARD_LIBRARY || isProjectModule(module)) return null
        return ExternalImport(ECOSYSTEM, DISTRIBUTION_BY_MODULE[topLevel] ?: topLevel)
    }

    private fun isProjectModule(module: List<String>): Boolean = modules?.modulesOf(module, importingFolder)?.isNotEmpty() == true

    companion object {
        private const val ECOSYSTEM = "pypi"
        private const val RELATIVE = "."

        private val DISTRIBUTION_BY_MODULE = mapOf(
            "yaml" to "PyYAML", "cv2" to "opencv-python", "PIL" to "Pillow", "sklearn" to "scikit-learn",
            "skimage" to "scikit-image", "bs4" to "beautifulsoup4", "dateutil" to "python-dateutil", "dotenv" to "python-dotenv",
            "jwt" to "PyJWT", "attr" to "attrs", "Crypto" to "pycryptodome", "OpenSSL" to "pyOpenSSL", "magic" to "python-magic",
            "docx" to "python-docx", "pptx" to "python-pptx", "serial" to "pyserial", "usb" to "pyusb", "zmq" to "pyzmq",
            "git" to "GitPython", "MySQLdb" to "mysqlclient", "fitz" to "PyMuPDF", "gi" to "PyGObject", "win32api" to "pywin32",
            "jose" to "python-jose", "multipart" to "python-multipart", "slugify" to "python-slugify"
        )

        private val STANDARD_LIBRARY = setOf(
            "__future__", "_thread", "abc", "aifc", "argparse", "array", "ast", "asynchat", "asyncio", "asyncore", "atexit",
            "audioop", "base64", "bdb", "binascii", "bisect", "builtins", "bz2", "calendar", "cgi", "cgitb", "chunk", "cmath",
            "cmd", "code", "codecs", "codeop", "collections", "colorsys", "compileall", "concurrent", "configparser",
            "contextlib", "contextvars", "copy", "copyreg", "cProfile", "crypt", "csv", "ctypes", "curses", "dataclasses",
            "datetime", "dbm", "decimal", "difflib", "dis", "doctest", "email", "encodings", "ensurepip", "enum", "errno",
            "faulthandler", "fcntl", "filecmp", "fileinput", "fnmatch", "fractions", "ftplib", "functools", "gc", "getopt",
            "getpass", "gettext", "glob", "graphlib", "grp", "gzip", "hashlib", "heapq", "hmac", "html", "http", "idlelib",
            "imaplib", "imghdr", "importlib", "inspect", "io", "ipaddress", "itertools", "json", "keyword", "lib2to3",
            "linecache", "locale", "logging", "lzma", "mailbox", "marshal", "math", "mimetypes", "mmap", "modulefinder",
            "msvcrt", "multiprocessing", "netrc", "numbers", "operator", "optparse", "os", "pathlib", "pdb", "pickle",
            "pickletools", "pkgutil", "platform", "plistlib", "poplib", "posix", "pprint", "profile", "pstats", "pty", "pwd",
            "py_compile", "pyclbr", "pydoc", "queue", "quopri", "random", "re", "readline", "reprlib", "resource", "rlcompleter",
            "runpy", "sched", "secrets", "select", "selectors", "shelve", "shlex", "shutil", "signal", "site", "smtplib",
            "socket", "socketserver", "sqlite3", "ssl", "stat", "statistics", "string", "stringprep", "struct", "subprocess",
            "symtable", "sys", "sysconfig", "syslog", "tabnanny", "tarfile", "tempfile", "termios", "textwrap", "threading",
            "time", "timeit", "tkinter", "token", "tokenize", "tomllib", "trace", "traceback", "tracemalloc", "tty", "turtle",
            "types", "typing", "unicodedata", "unittest", "urllib", "uuid", "venv", "warnings", "wave", "weakref",
            "webbrowser", "winreg", "winsound", "wsgiref", "xml", "xmlrpc", "zipapp", "zipfile", "zipimport", "zlib", "zoneinfo"
        )
    }
}
