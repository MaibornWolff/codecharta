from app.other import Inner


class Outer:
    class Inner:
        pass

    default = Inner()

    def make(self):
        return Inner()
