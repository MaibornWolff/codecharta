# frozen_string_literal: true

require_relative '../version'
require_relative '../domain/model/creature'
require_relative '../domain/model/fightable'
require_relative '../domain/model/dice'

module De::Sots::CellarsAndCentaurs::Application
  module CreatureUtil
    include De::Sots::CellarsAndCentaurs::Domain::Model

    STANDARD_ARMOR_CLASS_DESCRIPTION = 'Natural Armor'

=begin
Counts the treasure hoard a creature guards.
=end
    def self.hoard_size(creature)
      D20.roll.value * creature.xp_value
    end

    def self.describe(creature)
      "#{creature.type.to_s.capitalize} with #{creature.armor_class.description}"
    end
  end
end
