use crate::fightable::Fightable;

pub struct Creature;

impl Fightable for Creature {
    fn attack(&self) -> u8 {
        1
    }
}
