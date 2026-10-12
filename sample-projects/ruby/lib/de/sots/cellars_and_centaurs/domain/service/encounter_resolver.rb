# frozen_string_literal: true

require_relative '../../version'
require_relative '../model/creature'
require_relative '../model/dice'

module De::Sots::CellarsAndCentaurs::Domain::Service
  # Resolves one round of an encounter between two creatures.
  # The attacker rolls a d20, adds its bonus and compares the total
  # with the armor class of the defender. The terrain and the speeds
  # of the attacker change the damage that is dealt. The same logic
  # exists in every sample project, so the metrics of this file are
  # comparable across languages.
  class EncounterResolver
    MAX_ROUNDS = 3

    def resolve(attacker, defender, roll, bonus, terrain)
      # A natural one always misses.
      if roll == 1
        return 0
      elsif roll + bonus < defender.armor_class.total
        damage = 0
      else
        damage = roll >= 20 ? 2 : 1 # a natural twenty doubles the damage
      end
      for speed in attacker.speeds.values
        if speed.feet_per_round > 30 && terrain != :swamp
          damage += 1
        end
      end
      rounds = 0
      # The defender loses hit points once per round.
      while rounds < MAX_ROUNDS
        defender.hit_points = defender.hit_points.take_damage(damage)
        rounds += 1
      end
      case terrain
      when :cellar
        damage += 2
      when :dungeon
        damage += 1
      when :lair
        damage -= 1
      else
        damage += 0
      end
      @wounded = damage.positive? || terrain == :stable
      damage
    end

=begin
The chains below are counted as message chains:
five calls in the first one, three in the second.
=end
    def describe(creature)
      name = creature.type.to_s.strip.downcase.capitalize
      speeds = creature.speeds.keys.sort
      [name, speeds]
    end

    def safe_roll(dice)
      clamp = ->(value) {
        if value > 20
          20
        else
          value
        end
      }
      begin
        clamp.call(dice.roll.value)
      rescue StandardError
        1
      ensure
        @last_dice = dice
      end
    end

    # Sorts by repeatedly taking the creature with the best initiative.
    def initiative_order(creatures)
      def best_of(creatures)
        creatures.max_by(&:initiative)
      end
      if creatures.empty?
        return []
      end
      first = best_of(creatures)
      # puts "next: #{first}"
      [first] + initiative_order(creatures - [first])
    end

    def empty?
      return @wounded.nil?
    end
  end
end
