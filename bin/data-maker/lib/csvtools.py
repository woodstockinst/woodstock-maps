from difflib import SequenceMatcher
import csv
import re
import heapq


def read(filename):
    data = []
    with open(filename, 'rU') as f:
        f = csv.reader(f)
        for row in f:
            data.append(row)

    return data


def write(data, filename):
    with open(filename, 'wb') as f:
        writer = csv.writer(f)
        writer.writerows(data)


def read_as_dict(filename):
    csv = read(filename)
    headers = csv.pop(0)
    data = list()
    for row in csv:
        d = dict()
        for index, header in enumerate(headers):
            d[header] = row[index]
        data.append(d)
    return data











def pluck(data, columns):
    h = data[0]
    indices = []
    for c in columns:
        if c in h:
            indices.append(h.index(c))
        else:
            print "ERROR: '%s' is not to be found in this data" % c

    plucked = []
    for r in data:
        row = []
        for i in indices:
            row.append(r[i])
        plucked.append(row)
    # the header is still present, so remove it and replace with new column header
    plucked.pop(0)
    return [columns] + plucked



def found_bounded_word(needle, haystack):
    result = re.findall('\\b' + needle + '\\b', haystack, flags = re.IGNORECASE)
    if result:
        return True
    else:
        return False

def find_in(needle, haystack, i):
    for hay in haystack:
        if hay[i] == needle:
            return hay
    return -1

def join(a, a_i, b, b_i):
    for row in a:
        found = __find_in__(row[a_i], b, b_i)
        if found != -1:
            row += found
    return a

def sequence_match(a, b):
    s = SequenceMatcher(lambda x: x == ' ', a, b)
    return round(s.ratio(), 3)
