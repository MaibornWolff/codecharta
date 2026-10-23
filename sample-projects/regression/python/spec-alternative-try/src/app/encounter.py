try:
    from app.dice import roll
except ImportError:
    from app.fallback import roll


def surprise():
    return roll()
