class Lair:
    def __init__(self):
        self.residents = []

    def shelter(self, creature: "Creature") -> None:
        self.residents.append(creature)

    def first_resident(self) -> "Creature":
        return self.residents[0]
