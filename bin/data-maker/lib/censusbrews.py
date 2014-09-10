import dictools as dt
import csvtools as ct
import lookup


# mortgage brews
def action_by_race(d, geo):

    h = d.pop(0)

    # get a dictionary that only contains unique fips
    print '\nGetting unique ids...'
    fips = dt.uniques_from_list(d, h.index(geo))
    print 'Done!'

    # each entry in the dictionary is an array of rows from that fip
    # each row has a race and an action
    # packed returns race by action
    print '\nPacking ids by race and action...'
    packed = dt.count_by(fips, h.index('Race'), h.index('Action'))
    print 'Done!'

    # put it into human readable format using tables in lookup
    print '\nTurning id numbers into human-readable text...'
    races = ct.read(lookup.race)
    races = lookup.to_lookup_dict(races)
    actions = ct.read(lookup.action)
    actions = lookup.to_lookup_dict(actions)
    for k in packed:
        packed[k] = dt.translate_keys(packed[k], races)
        for kk in packed[k]:
            packed[k][kk] = dt.translate_keys(packed[k][kk], actions)
    print 'Done!'

    # put all the race id's into a sub-dictionary called 'race'
    print '\nCompressing into a single id...'
    packed = dt.subfolder(packed, 'race_actions')
    print 'Done!'

    return packed
