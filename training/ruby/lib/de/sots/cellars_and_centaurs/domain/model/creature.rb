# frozen_string_literal: true

require_relative '../../version'
require_relative 'fightable'
require_relative 'creature_id'
require_relative 'creature_type'
require_relative 'armor_class'
require_relative 'speed_type'
require_relative 'speed'
require_relative 'hit_points'
require_relative 'dice'
require_relative '../../application'

module De::Sots::CellarsAndCentaurs::Domain::Model
  # A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
  class Creature
    include Fightable

    XPValue = 25

    attr_accessor :id, :type, :armor_class, :speeds, :xp_value
    attr_writer :hit_points

    # @param id [CreatureId] the identity of the creature
    # @param type [Symbol] one of CreatureType::ALL
    def initialize(id, type = De::Sots::CellarsAndCentaurs::Application::CreatureFacade::STANDARD_CREATURE_TYPE)
      @id = id
      @type = type
      @speeds = {}
      @xp_value = XPValue
    end

    # @return [HitPoints]
    def hit_points
      @hit_points
    end

    # @return [Speed, nil] the walking speed of the creature
    def walking_speed
      speeds[SpeedType::WALKING]
    end

    def attack(target)
      target.hit_points = target.hit_points.take_damage(De::Sots::CellarsAndCentaurs::Domain::Model.roll_d20.value)
    end

    def initiative
      De::Sots::CellarsAndCentaurs::Domain::Model.roll_d20.value
    end

    def to_s
      "#{type} #{id.id} (#{armor_class&.total} AC, #{hit_points&.current} HP)"
    end
  end
end
