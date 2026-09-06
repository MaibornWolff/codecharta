# frozen_string_literal: true

require_relative 'lib/de/sots/cellars_and_centaurs/version'

Gem::Specification.new do |spec|
  spec.name = 'cellars_and_centaurs'
  spec.version = De::Sots::CellarsAndCentaurs::VERSION
  spec.authors = ['Sots']
  spec.summary = 'Creatures, centaurs and cellars for the CodeCharta training project'
  spec.files = Dir['lib/**/*.rb', 'lib/tasks/*.rake']
  spec.require_paths = ['lib']
  spec.required_ruby_version = '>= 3.1'

  spec.add_dependency 'logger'
  spec.add_development_dependency 'rake'
  spec.add_development_dependency 'rspec'
end
