use std::collections::HashMap;

use log::info;
use uuid::Uuid;

use crate::domain::model::armor_class::ArmorClass;
use crate::domain::model::creature::Creature;
use crate::domain::model::creature_id::CreatureId;
use crate::domain::model::creature_type::CreatureType;
use crate::domain::model::hit_points::HitPoints;
use crate::domain::model::speed::Speed;
use crate::domain::model::speed_type::SpeedType;
use crate::domain::service::creature_service::CreatureService;

pub struct CreatureFacade {
    creature_service: CreatureService,
}

impl CreatureFacade {
    pub const STANDARD_CREATURE_TYPE: CreatureType = CreatureType::Monstrosity;
    pub const STABLE_NAME: &'static str = "centaur-stable";

    pub fn new(creature_service: CreatureService) -> Self {
        CreatureFacade { creature_service }
    }

    pub fn create(
        &mut self,
        creature_type: CreatureType,
        walking_speed: Speed,
        flying_speed: Speed,
        swimming_speed: Speed,
        burrowing_speed: Speed,
        climbing_speed: Speed,
        armor_class: ArmorClass,
        hit_points_value: u32,
    ) -> Creature {
        // Rolls initiative for every creature in the dungeon before the encounter starts.
        let mut creature = Creature::new(CreatureId::new(Self::generate_uuid()));
        creature.set_armor_class(armor_class);
        creature.set_hit_points(HitPoints::init(hit_points_value));
        creature.set_type(creature_type);

        let mut speeds = HashMap::new();
        speeds.insert(SpeedType::Walking, walking_speed);
        speeds.insert(SpeedType::Flying, flying_speed);
        speeds.insert(SpeedType::Swimming, swimming_speed);
        speeds.insert(SpeedType::Burrowing, burrowing_speed);
        speeds.insert(SpeedType::Climbing, climbing_speed);
        creature.set_speeds(speeds);

        info!("created creature {} in {}", creature.id().id, Self::STABLE_NAME);
        self.creature_service.save(creature.clone());
        creature
    }

    pub fn to_dto(&self, creature: &Creature) -> crate::application::dto::creature::Creature {
        crate::application::dto::creature::Creature {
            id: creature.id().id.clone(),
            hit_points: creature.hit_points().map(|hit_points| hit_points.current).unwrap_or(0),
        }
    }

    fn generate_uuid() -> String {
        Uuid::new_v4().to_string()
    }
}
