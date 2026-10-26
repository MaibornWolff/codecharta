use crate::creature::Creature;
use crate::fightable::Fightable;

impl Fightable for Vec<Creature> {
    fn attack(&self) -> u8 {
        1
    }
}
