# frozen_string_literal: true

require 'securerandom'
require 'logger'

require_relative '../version'
require_relative '../domain/service/creature_service'
require_relative '../domain/model/creature'
require_relative '../domain/model/creature_id'
require_relative '../domain/model/creature_type'
require_relative '../domain/model/hit_points'
require_relative '../domain/model/speed_type'
require_relative '../domain/model/armor_class'
require_relative 'dto/creature'

module De::Sots::CellarsAndCentaurs::Application
  class CreatureFacade
    STANDARD_CREATURE_TYPE = De::Sots::CellarsAndCentaurs::Domain::Model::CreatureType::MONSTROSITY
    STABLE_NAME = 'centaur-stable'

    Model = De::Sots::CellarsAndCentaurs::Domain::Model

    def initialize(creature_service)
      @creature_service = creature_service
      @logger = Logger.new($stdout)
    end

    # @return [Dto::Creature]
    def create(type, walk_speed, fly_speed, swim_speed, burrow_speed, climb_speed, armor_class, hit_points_value)
      # Rolls initiative for every creature in the dungeon before the encounter starts.
      creature = Model::Creature.new(Model::CreatureId.new(SecureRandom.uuid), type)
      creature.armor_class = armor_class
      creature.hit_points = Model::HitPoints.init(hit_points_value)
      creature.speeds = {
        Model::SpeedType::WALKING => walk_speed,
        Model::SpeedType::FLYING => fly_speed,
        Model::SpeedType::SWIMMING => swim_speed,
        Model::SpeedType::BURROWING => burrow_speed,
        Model::SpeedType::CLIMBING => climb_speed
      }
      @creature_service.save(creature)
      @logger.info("#{creature} stabled in #{STABLE_NAME}")
      to_dto(creature)
    end

    def create_default(type)
      speed = De::Sots::CellarsAndCentaurs::Domain::Model::Speed.new(30)
      create(type, speed, speed, speed, speed, speed, Model::ArmorClass.new(10, 2), 12)
    end

    private

    def to_dto(creature)
      Dto::Creature.new(creature.id.id, creature.type, creature.walking_speed&.feet_per_round)
    end
  end
end
