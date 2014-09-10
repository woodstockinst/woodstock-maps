import math

#################################
#################################
## Private, helper functions ####
#################################
#################################

# tries to parse an int into a float,
# return false if not possible
def __float__(s):
    try:
        return float(s)
    except:
        print '\nERROR: cannot parse %s as float\n' % s
        return 0.0


# return false if not possible
def __int__(s):
    try:
        return int(s)
    except:
        print '\nERROR: cannot parse %s as int\n' % s
        return 0


# convenience methods for finding and handling uniques in dictionaries
def __create_as_dict__(d, k):
    d[k] = {}
    return d

def __create_as_one__(d, k):
    d[k] = 1
    return d

def __create_as_zero__(d, k):
    d[k] = 0
    return d

def __increment__(d, k):
    d[k] = d[k] + 1
    return d

def __do_nothing__(d, k):
    return d

# if it's a special unique gem, do a, otherwise do b
def __unique_then__(d, k, a, b):
    if not k in d:
        a(d, k)
    else:
        b(d, k)
    return d

# returns a flat list of floats for each index (i) for each row (a) of iterable (d)
def __reduce_float__(d, i):
    vals = []
    for a in d:
        val = a[i]
        try:
            val = float(val)
        except:
            print 'ERROR: %s could not be turned into a float' % val
            continue
        vals.append(val)
    return vals


# given a flat list, return the median
def __get_median__(d):
    ordered = sorted(d)
    length = len(ordered)
    mid = int(math.floor(length / 2))
    # even number of values, return the mean of the two middle numbers
    if mid * 2 == length:
        median = ( ordered[mid-1] + ordered[mid] ) * 0.5
    # odd number of values, return the middle number
    else:
        median = ordered[mid]
    return median


#################################
#################################
## plucking vals from a list ####
#################################
#################################

# creates a new dictionary from a csv
# separates unique keys based on index i
def uniques_from_list(d, i):
    dic = {}
    for r in d:
        if r[i] in dic:
            dic[r[i]].append(r)
        else:
            dic[r[i]] = [r]
    return dic


# same as uniques_from_list, but takes dict as input
def uniques_from_dict(d, i):
    dic = {}
    for k in d:
        r = d[k]
        if r[i] in dic:
            dic[r[i]].append(r)
        else:
            dic[r[i]] = [r]
    return dic

# checks if a dictionary contains a key
# if it does, increment its value by one
# else set its value to one
def unique_or_increment(d, k):
    d = __unique_then__(d, k, __create_as_one__, __increment__)
    return d


# returns a list of unique values from a list
def uniques(l):
    seen, result = {}, []
    for a in l:
        if a in seen:
            continue
        seen[a] = 1
        result.append(a)
    return result


#################################
#################################
## counting, adding, medians ####
#################################
#################################

# first input (d) is a dictionary whose values are lists
# second and third (a, b) are column indicies for those lists
# returns a count of a by b, or:
# {black: 32 actions, white: 15 actions, ...}
def count_by(d, a, b):
    dic = {}
    for k in d:
        rows = d[k]
        packed = {}
        for r in rows:
            # make a the key, count b for a
            key = r[a]
            packed = __unique_then__(packed, key, __create_as_dict__, __do_nothing__)
            val = r[b]
            packed[key] = __unique_then__(packed[key], val, __create_as_one__, __increment__)
        dic[k] = packed
    return dic


# first input (d) is a dictionary whose values are lists
# second (a) is a column index
# returns the median of that column value
def median_by(d, a):
    dic = {}
    for k in d:
        rows = d[k]
        # only one row, so just return that value
        if len(rows) == 1:
            dic[k] = rows[0][a]
        else:
            vals = __reduce_float__(rows, a)
            dic[k] = __get_median__(vals)
    return dic


# first input(d) is a dictionary whose values are lists
# second (a) is a column index
# returns the sum of that column value as floats
def add_by_index(d, a):
    dic = {}
    for k in d:
        rows = d[k]
        sums = 0
        for row in rows:
            sums += __float__(row[a])
        dic[k] = sums
    return dic


# first input(d) is a dictionary whose values are lists
# second (a) is a column index
# returns the column value (this wipes out duplicates)
def compress_by_index(d, a):
    dic = {}
    for k in d:
        rows = d[k]
        val = __int__(rows[0][a])
        dic[k] = val
    return dic


def keys(d):
    keys = list()
    for key in d:
        keys.append(key)
    return keys


#################################
#################################
## organizing and structuring ###
#################################
#################################

# given a target (t) and a dictionary (dic)
# match every key on t that has a corresponding key on dics
def extend(t, dic):
    for k in t:
        if k in dic:
            for kk in dic[k]:
                t[k][kk] = dic[k][kk]
    return t


def copy(dic):
    t = {}
    for k in dic:
        t[k] = {}
        for kk in dic[k]:
            t[k][kk] = dic[k][kk]
    return t


# simple wrapper for extend_all that takes a list of dictionaries
def multi_extend(t, dics):
    for dic in dics:
        t = extend_all(t, dic)
    return t


# given a dictionary of unique id's, returns the following structure:
# id: { _id: {data} }
def subfolder(d, _id):
    dic = {}
    for k in d:
        dic[k] = {}
        dic[k][_id] = d[k]
    return dic


def compress_into_schema(d, sch, key):
    n = []
    for k in d:
        nn = [k]
        for kk in sch:
            nn.append(d[k][kk])
        n.append(nn)

    head = [key]
    head.extend(sch)
    return [head] + n



# converts the keys of one dictionary into the values of another
# so '1' becomes 'Caucasian', etc.
def translate_keys(a, b):
    d = {}
    for k in a:
        if k in b:
            d[b[k]] = a[k]
        else:
            continue
    return d


#################################
#################################
## looping and re-looping #######
#################################
#################################

def iter_neighbors(iterable):
    iterator = iter(iterable)
    prev = None
    item = iterator.next()
    for next in iterator:
        yield (prev, item, next)
        prev = item
        item = next
    yield (prev, item, None)
