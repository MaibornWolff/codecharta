use crate::fightable::Fightable;
use crate::speed::Speed;

pub struct Creature;

impl Creature {
    pub fn speed(&self) -> Speed {
        Speed
    }
}

impl Fightable for Creature {
    fn attack(&self) -> u8 {
        1
    }
}
