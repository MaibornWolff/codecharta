use crate::creature::Creature;
use crate::fightable::Fightable;

pub fn first() -> u8 {
    Fightable::attack(&Creature)
}

pub fn second() -> u8 {
    <Creature as Fightable>::attack(&Creature)
}
