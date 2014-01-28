
require 'csv'
require 'json'

species = {}

CSV.foreach('species_to_id.txt') do |row|
    rowsplit = row[0].split '('

    sciname = rowsplit[-1].sub ')', ''
    commonname = rowsplit[0..-2].join('(').strip

    species[sciname] ||= []
    species[sciname] << commonname

    puts "#{commonname} (#{sciname})"
end

File.open('species.json', 'w') do |f|
    f.write(JSON.dump species)
end