# frozen_string_literal: true

require 'set'
require 'de/sots/cellars_and_centaurs/domain/model/speed'
require_relative '../model/creature'

module De::Sots::CellarsAndCentaurs::Domain::Service
  ##
  # Collects the constructs of Ruby that a metric parser is likely to miscount.
  # Every method holds exactly one construct.
  class EncounterEdgeCases
    MAX_ROUNDS = 3 # :nodoc:

    attr_accessor :terrain, :rounds

    def initialize(terrain = :cellar)
      @terrain = terrain
      @rounds = 0
    end

    def unless_block(creature)
      unless creature.nil?
        creature.initiative
      end
    end

    def until_loop(rounds)
      until rounds >= MAX_ROUNDS
        rounds += 1
      end
      rounds
    end

    def modifier_if(roll)
      return 20 if roll > 20
      roll
    end

    def modifier_unless(roll)
      return 1 unless roll.positive?
      roll
    end

    def modifier_while(rounds)
      rounds -= 1 while rounds > MAX_ROUNDS
      rounds
    end

    def modifier_until(rounds)
      rounds += 1 until rounds >= MAX_ROUNDS
      rounds
    end

    def do_while(rounds)
      begin
        rounds += 1
      end while rounds < MAX_ROUNDS
      rounds
    end

    def endless_loop(rounds)
      loop do
        rounds += 1
        break if rounds > MAX_ROUNDS
      end
      rounds
    end

    def elsif_ladder(roll)
      if roll < 5
        :miss
      elsif roll < 15
        :graze
      elsif roll < 20
        :hit
      else
        :critical
      end
    end

    def one_line_if(roll)
      if roll > 10 then :hit else :miss end
    end

    def nested_ternary(roll)
      roll > 15 ? :high : roll > 5 ? :middle : :low
    end

    def case_values_and_ranges(roll)
      case roll
      when 1 then :fumble
      when 2, 3, 4 then :miss
      when 5..19 then :hit
      else :critical
      end
    end

    def case_without_subject(roll, bonus)
      case
      when roll > 10 && bonus.positive? then :hit
      when roll.zero? then :fumble
      else :miss
      end
    end

    def pattern_match(creature)
      case creature
      in { type: :centaur, speed: Integer => speed } if speed > 40
        :galloping
      in { type: :dragon | :beast }
        :prowling
      in [first, *]
        first
      else
        :resting
      end
    end

    def one_line_pattern(creature)
      creature in { type: :centaur }
    end

    def symbolic_operators(attacker, defender)
      attacker.nil? && defender.nil? || attacker == defender
    end

    def word_operators(attacker, defender)
      attacker.nil? and defender.nil? or attacker == defender
    end

    def conditional_assignment(cache)
      cache ||= {}
      cache[:lair] &&= 1
      cache
    end

    def safe_navigation(creature)
      creature&.armor_class&.total&.to_s&.strip
    end

    def rescue_all(dice)
      attempts = 0
      begin
        dice.roll
      rescue ArgumentError, TypeError => error
        attempts += 1
        retry if attempts < MAX_ROUNDS
        raise error
      rescue StandardError
        nil
      else
        attempts
      ensure
        @rounds = attempts
      end
    end

    def rescue_modifier(dice)
      dice.roll rescue 1
    end

    def method_level_rescue(dice)
      dice.roll
    rescue StandardError
      1
    ensure
      @rounds += 1
    end

    def catch_and_throw(creatures)
      catch(:found) do
        throw :found, creatures.first
      end
    end

    def brace_block(creatures)
      creatures.each { |creature| creature.initiative }
    end

    def do_block(creatures)
      creatures.each do |creature|
        creature.initiative
      end
    end

    def iterator_chain(creatures)
      creatures.select { |creature| creature.initiative > 10 }.map { |creature| creature.type }.uniq.sort.first
    end

    def leading_dot_chain(creatures)
      creatures
        .select(&:alive?)
        .sort_by(&:initiative)
        .reverse
        .first
    end

    def lambda_keyword(bonus)
      lambda { |roll| roll + bonus }
    end

    def stabby_lambda(bonus)
      ->(roll) { roll + bonus }
    end

    def proc_keyword(bonus)
      proc { |roll| roll + bonus }
    end

    def proc_new(bonus)
      Proc.new { |roll| roll + bonus }
    end

    def yield_to_block(creature)
      yield creature if block_given?
    end

    define_method(:dynamic_roll) { |dice| dice.roll }

    def self.singleton_roll(dice)
      dice.roll
    end

    class << self
      def eigenclass_roll(dice)
        dice.roll
      end
    end

    private def private_roll(dice)
      dice.roll
    end

    alias charge modifier_if

    def endless_total(roll, bonus) = roll + bonus

    def endless_verdict(roll) = roll > 10 ? :hit : :miss

    def default_parameter(roll, bonus = 2)
      roll + bonus
    end

    def splat_parameters(first, *rest, **options)
      [first, rest, options]
    end

    def keyword_parameters(roll:, bonus: 0)
      roll + bonus
    end

    def block_parameter(creatures, &block)
      creatures.each(&block)
    end

    def every_parameter_kind(roll, bonus = 0, *rest, terrain:, cover: nil, **options, &block)
      [roll, bonus, rest, terrain, cover, options, block]
    end

    def +(other)
      rounds + other.rounds
    end

    def [](index)
      index
    end

    def cover=(value)
      @cover = value
    end

    def ambushed?
      rounds.zero?
    end

    def reset!
      @rounds = 0
    end

    def heredoc_with_hash(roll)
      <<~TEXT
        # the gate is locked, this line is text
        Roll #{roll} if the door && the portcullis are open
      TEXT
    end

    def markers_in_strings
      ['# no remark here', "=begin", 'if x && y || z']
    end

    def interpolated_ternary(roll)
      "The roll is #{roll > 10 ? 'high' : 'low'}"
    end

    def word_lists
      [%w[goblin kobold], %i[basilisk wyvern], /owlbear\s+den/]
    end

    def variable_sigils
      @@mimic_count = 1
      $griffon_seen = true
      @gelatinous_cube = nil
    end

    def lazy_require
      require_relative '../model/dice'
      De::Sots::CellarsAndCentaurs::Domain::Model::Dice.new(20)
    end
  end
end

=begin
if roll > 10 && bonus > 0
  def hidden_vault; end
end
=end
__END__
def phantom_method(roll)
  return 20 if roll > 20 || roll.zero?
end
# not a remark either
