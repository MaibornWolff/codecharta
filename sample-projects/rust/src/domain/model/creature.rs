use std::collections::HashMap;

use crate::application::CreatureFacade;
use crate::domain::model::armor_class::ArmorClass;
use crate::domain::model::creature_id::CreatureId;
use crate::domain::model::creature_type::CreatureType;
use crate::domain::model::fightable::Fightable;
use crate::domain::model::hit_points::HitPoints;
use crate::domain::model::speed::Speed;
use crate::domain::model::speed_type::SpeedType;

pub type XPValue = u32;

/// A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
#[derive(Debug, Clone)]
pub struct Creature {
    id: CreatureId,
    creature_type: CreatureType,
    armor_class: Option<ArmorClass>,
    speeds: HashMap<SpeedType, Speed>,
    hit_points: Option<HitPoints>,
    xp_value: XPValue,
}

impl Creature {
    pub fn new(id: CreatureId) -> Self {
        Self::with_type(id, CreatureFacade::STANDARD_CREATURE_TYPE)
    }

    pub fn with_type(id: CreatureId, creature_type: CreatureType) -> Self {
        Creature {
            id,
            creature_type,
            armor_class: None,
            speeds: HashMap::new(),
            hit_points: None,
            xp_value: 0,
        }
    }

    pub fn id(&self) -> &CreatureId {
        &self.id
    }

    pub fn creature_type(&self) -> CreatureType {
        self.creature_type
    }

    pub fn set_type(&mut self, creature_type: CreatureType) {
        self.creature_type = creature_type;
    }

    pub fn armor_class(&self) -> Option<&ArmorClass> {
        self.armor_class.as_ref()
    }

    pub fn set_armor_class(&mut self, armor_class: ArmorClass) {
        self.armor_class = Some(armor_class);
    }

    pub fn speeds(&self) -> &HashMap<SpeedType, Speed> {
        &self.speeds
    }

    pub fn set_speeds(&mut self, speeds: HashMap<SpeedType, Speed>) {
        self.speeds = speeds;
    }

    pub fn hit_points(&self) -> Option<&HitPoints> {
        self.hit_points.as_ref()
    }

    pub fn set_hit_points(&mut self, hit_points: HitPoints) {
        self.hit_points = Some(hit_points);
    }

    pub fn xp_value(&self) -> XPValue {
        self.xp_value
    }
}

impl Fightable for Creature {
    fn attack_bonus(&self) -> i32 {
        self.xp_value as i32 / 100
    }
}
