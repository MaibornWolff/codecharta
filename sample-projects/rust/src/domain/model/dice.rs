#[derive(Debug, Clone, Copy)]
pub struct Dice {
    pub sides: u32,
}

#[derive(Debug, Clone, Copy)]
pub struct DiceRoll {
    pub dice: Dice,
    pub result: u32,
}

impl Dice {
    pub fn roll(&self) -> DiceRoll {
        let d20_roll = (self.sides * 7 + 3) % self.sides + 1;
        DiceRoll {
            dice: *self,
            result: d20_roll,
        }
    }
}

pub fn roll_d20() -> DiceRoll {
    Dice { sides: 20 }.roll()
}
