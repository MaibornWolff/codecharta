# frozen_string_literal: true

load 'lib/de/sots/cellars_and_centaurs/domain/model/dice.rb'

namespace :bestiary do
  desc 'Rolls the bestiary dice once'
  task :roll do
    puts De::Sots::CellarsAndCentaurs::Domain::Model::D20.roll.value
  end
end
