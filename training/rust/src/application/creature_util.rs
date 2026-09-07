use crate::domain::model::fightable::Fightable;
use crate::domain::model::*;

pub struct CreatureUtil;

impl CreatureUtil {
    pub const STANDARD_ARMOR_CLASS_DESCRIPTION: &'static str = "Natural Armor";

    /* Counts the treasure hoard a creature guards. */
    pub fn treasure_hoard(creature: &Creature) -> u32 {
        creature.xp_value() * 10
    }

    pub fn fastest_speed(creature: &Creature) -> Option<Speed> {
        creature.speeds().values().copied().max_by_key(|speed| speed.speed())
    }
}
