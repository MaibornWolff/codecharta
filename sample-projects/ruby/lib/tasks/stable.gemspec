# frozen_string_literal: true

require_relative '../de/sots/cellars_and_centaurs/version'

# Chooses the farrier plugin gem only on request.
def farrier_wanted?(flag = ENV['FARRIER'])
  flag == 'yes' && !flag.nil?
end

Gem::Specification.new do |spec|
  spec.name = 'stable'
  spec.version = De::Sots::CellarsAndCentaurs::VERSION
  spec.summary = 'Blacksmith tools for the menagerie'
  spec.add_dependency 'horseshoe' if farrier_wanted?
end
