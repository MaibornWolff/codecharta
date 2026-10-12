# frozen_string_literal: true

require_relative '../de/sots/cellars_and_centaurs/domain/service/encounter_resolver'

# Picks the terrain of the skirmish from the environment.
def encounter_terrain(name = ENV['TERRAIN'])
  if name.nil? || name.empty?
    :cellar
  else
    name.to_sym
  end
end

namespace :encounters do
  desc 'Resolves one skirmish in the catacomb'
  task :resolve do
    puts encounter_terrain
  end
end
