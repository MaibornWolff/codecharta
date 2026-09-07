# frozen_string_literal: true

require_relative '../cellars_and_centaurs'

namespace :creatures do
  desc 'Prints every creature type the dungeon knows'
  task :types do
    De::Sots::CellarsAndCentaurs::Domain::Model::CreatureType::ALL.each { |creature_type| puts creature_type }
  end

  desc 'Rolls a d20 for initiative'
  task :roll do
    puts De::Sots::CellarsAndCentaurs::Domain::Model.roll_d20.value
  end
end
