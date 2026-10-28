import sys

if sys.platform == "win32":
    from app.windows import Console
else:
    from app.posix import Console


class Shell(Console):
    pass


from app.plain import Console  # noqa: E402


def make():
    return Console()
