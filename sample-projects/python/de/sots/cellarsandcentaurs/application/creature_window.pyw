import tkinter

from de.sots.cellarsandcentaurs.domain.model.creature_type import CreatureType
from de.sots.cellarsandcentaurs.domain.model.dice import roll_d20


class CreatureWindow:
    """Shows the bestiary in a window without a console."""

    def __init__(self, title="Bestiary"):
        self.root = tkinter.Tk()
        self.root.title(title)

    def show(self, creature_type: CreatureType) -> None:
        if creature_type is CreatureType.DRAGON:
            caption = "dragon"
        else:
            caption = str(roll_d20().value)
        tkinter.Label(self.root, text=caption).pack()
        self.root.mainloop()
