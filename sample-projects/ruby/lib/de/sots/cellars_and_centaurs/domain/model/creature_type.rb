# frozen_string_literal: true

require_relative '../../version'

module De::Sots::CellarsAndCentaurs::Domain::Model
  module CreatureType
    MONSTROSITY = :monstrosity
    BEAST = :beast
    ABERRATION = :aberration
    CELESTIAL = :celestial
    DRAGON = :dragon
    FIEND = :fiend
    HUMANOID = :humanoid
    UNDEAD = :undead

    ALL = [MONSTROSITY, BEAST, ABERRATION, CELESTIAL, DRAGON, FIEND, HUMANOID, UNDEAD].freeze

    def self.valid?(creature_type)
      ALL.include?(creature_type)
    end
  end
end
