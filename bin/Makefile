TOPOJSON = ../node_modules/.bin/topojson
TARGET = ../app/data/topojson/

GENERATED_FILES = \
	allcsv \
	topo/il_cbsa.json \
	topo/il_counties.json \
	topo/il_tracts_2010.json \
	topo/il_tracts_2000.json \
	topo/il_places.json \
	topo/il_congressional.json \
	topo/il_state_senate.json \
	topo/il_state_house.json \
	topo/il_chicago_community_area.json \
	shp/il_legislative \
	shp/il_tracts_2000

all: \
	node_modules \
	$(GENERATED_FILES)

node_modules:
	npm install

.PHONY: clean all

# only clean topo folder
# as files in zip or shp are likely
# to be updated manually
clean:
	rm -rf -- topo

.SECONDARY:

##############
#  download  #
##############

# 2013 US CBSA
zip/us_cbsa.zip:
	mkdir -p $(dir $@)
	curl -o $@ 'http://www2.census.gov/geo/tiger/GENZ2013/cb_2013_us_cbsa_500k.zip' -o $@.download

# 2013 US Counties
zip/us_counties.zip:
	mkdir -p $(dir $@)
	curl -o $@ 'http://www2.census.gov/geo/tiger/GENZ2013/cb_2013_us_county_500k.zip' -o $@.download

# 113th US Congressional Districts
zip/us_congressional.zip:
	mkdir -p $(dir $@)
	curl -o $@ 'http://www2.census.gov/geo/tiger/GENZ2013/cb_2013_us_cd113_500k.zip' -o $@.download

# 2000 tracts
# use the special 2000 files from Woodstock
# LINK NOT WORKING (basecamp or cloud)
# zip/il_tracts_2000.zip:
# 	mkdir -p $(dir $@)
# 	curl -o $@ 'http://cl.ly/1O3z2h0A2D41/download/il_tracts_2000.zip' -o $@.download
# 	mv $@.download $@

# 2010 tracts
zip/il_tracts_2010.zip:
	mkdir -p $(dir $@)
	curl 'http://www2.census.gov/geo/tiger/GENZ2013/cb_2013_17_tract_500k.zip' -o $@.download
	mv $@.download $@

# 2013 places
zip/il_places.zip:
	mkdir -p $(dir $@)
	curl 'http://www2.census.gov/geo/tiger/GENZ2013/cb_2013_17_place_500k.zip' -o $@.download
	mv $@.download $@

### State Legislative ###
zip/il_legislative.zip:
	mkdir -p $(dir $@)
	curl 'http://ilhousedems.com/redistricting/2011-maps/Legislative_Districts_Public_Act/House%20and%20Senate%20shape%20files.zip' -o $@.download
	mv $@.download $@

### Chicago Community Area ###
zip/il_chicago_community_area.zip:
	mkdir -p $(dir $@)
	curl 'https://data.cityofchicago.org/api/geospatial/cauq-8yn6?method=export&format=Shapefile' -o $@.download
	mv $@.download $@

### Scaffolding for all numeric data
zip/input.zip:
	mkdir -p $(dir $@)
	curl -L 'https://www.dropbox.com/s/mlhnclpxl1dctoi/input.zip?dl=1' -o $@.download
	mv $@.download $@

##############
#   unzip    #
##############

# 2013 US CBSA
shp/us_cbsa.shp: zip/us_cbsa.zip
	rm -rf $(basename $@)
	mkdir -p $(basename $@)
	unzip -d $(basename $@) $<
	for file in $(basename $@)/*; do chmod 644 $$file; mv $$file $(basename $@).$${file##*.}; done
	rmdir $(basename $@)
	touch $@

# 2013 US Counties
shp/us_counties.shp: zip/us_counties.zip
	rm -rf $(basename $@)
	mkdir -p $(basename $@)
	unzip -d $(basename $@) $<
	for file in $(basename $@)/*; do chmod 644 $$file; mv $$file $(basename $@).$${file##*.}; done
	rmdir $(basename $@)
	touch $@

# 113th US Congressional Districts
shp/us_congressional.shp: zip/us_congressional.zip
	rm -rf $(basename $@)
	mkdir -p $(basename $@)
	unzip -d $(basename $@) $<
	for file in $(basename $@)/*; do chmod 644 $$file; mv $$file $(basename $@).$${file##*.}; done
	rmdir $(basename $@)
	touch $@

# IL Census Tracts 2000 folder
shp/il_tracts_2000: zip/il_tracts_2000.zip
	rm -rf $(basename $@)
	mkdir -p $(basename $@)
	unzip -d $(basename $@) $<
	cp $(basename $@)/*/*.* $(basename $@)
	rm -rf $(basename $@)/*/ # delete the secondary folder
	for file in $(basename $@)/*; do mv "$$file" "`echo $$file | sed -e 's/ /_/g'`"; done # join the space with "_"

# IL Census Tracts 2010
shp/il_tracts_2010.shp: zip/il_tracts_2010.zip
	rm -rf $(basename $@)
	mkdir -p $(basename $@)
	unzip -d $(basename $@) $<
	for file in $(basename $@)/*; do chmod 644 $$file; mv $$file $(basename $@).$${file##*.}; done
	rmdir $(basename $@)
	touch $@

# IL Places
shp/il_places.shp: zip/il_places.zip
	rm -rf $(basename $@)
	mkdir -p $(basename $@)
	unzip -d $(basename $@) $<
	for file in $(basename $@)/*; do chmod 644 $$file; mv $$file $(basename $@).$${file##*.}; done
	rmdir $(basename $@)
	touch $@

# IL legislative folder
# Note 1: House of representative and state senate districts are under the same folder
# Note 2: When unzipped the folder has long name with space

shp/il_legislative: zip/il_legislative.zip
	rm -rf $(basename $@)
	mkdir -p $(basename $@)
	unzip -d $(basename $@) $<
	cp $(basename $@)/*/*.* $(basename $@)
	rm -rf $(basename $@)/*/ # delete the secondary folder
	for file in $(basename $@)/*; do mv "$$file" "`echo $$file | sed -e 's/ /_/g'`"; done # join the space with "_"

shp/il_chicago_community_area.shp: zip/il_chicago_community_area.zip
	rm -rf $(basename $@)
	mkdir -p $(basename $@)
	unzip -d $(basename $@) $<
	for file in $(basename $@)/*; do chmod 644 $$file; mv $$file $(basename $@).$${file##*.}; done
	rmdir $(basename $@)
	touch $@

##############
#  Illinois  #
##############

# IL CBSA (note: CBSA can cross multiple states)
# There is no useful GEOID/FP to pick the state from CBSA
# In the name field
shp/il_cbsa.shp: shp/us_cbsa.shp
	mkdir -p $(basename $@)
	ogr2ogr -f 'ESRI Shapefile' -where "NAME like '%IL-%' OR NAME like '%IL' OR NAME like '%-IL%'" $@ $<
	rmdir $(basename $@)

# IL Counties
shp/il_counties.shp: shp/us_counties.shp
	mkdir -p $(basename $@)
	ogr2ogr -f 'ESRI Shapefile' -where "STATEFP = '17'" $@ $<
	rmdir $(basename $@)

# IL Congressional District
shp/il_congressional.shp:shp/us_congressional.shp
	mkdir -p $(basename $@)
	ogr2ogr -f 'ESRI Shapefile' -where "STATEFP = '17'" $@ $<
	rmdir $(basename $@)

# Intermediary step to make sure the community areas encodes correctly
# the original shapefile lacks a WGS84 CRS
shp/il_chicago_community_area.geojson:shp/il_chicago_community_area.shp
	mkdir -p $(basename $@)
	ogr2ogr -f GeoJSON -t_srs crs:84 $@ $<
	rmdir $(basename $@)

shp/il_tracts_2000.geojson:shp/il_tracts_2000/tracts_2000_projected.shp
	ogr2ogr -f GeoJSON -t_srs crs:84 $@ $<

##############
#  topojson  #
##############

topo/il_cbsa.json: shp/il_cbsa.shp
	mkdir -p $(dir $@)
	TOPOJSON -o $@ \
	--id-property=GEOID \
	-- $(filter %.shp,$^)
	cp $@ $(TARGET)

# Uses CBSA/county crosswalk CSB in bin/cbsa to give each county CBSA keys and names
topo/il_counties.json: shp/il_counties.shp
	mkdir -p $(dir $@)
	TOPOJSON -o $@ \
	--id-property=GEOID,fipscounty \
	-e il_cbsa.csv \
	-p cbsa=cbsa \
	-p cbsaname=cbsaname \
	-- $(filter %.shp,$^)
	cp $@ $(TARGET)

topo/il_tracts_2000.json: shp/il_tracts_2000.geojson
	mkdir -p $(dir $@)
	TOPOJSON -o $@ \
	--id-property=GISJOIN2 \
	-- $(filter %.geojson, $^)
	cp $@ $(TARGET)

topo/il_tracts_2010.json: shp/il_tracts_2010.shp
	mkdir -p $(dir $@)
	TOPOJSON -o $@ \
	--id-property=GEOID \
	-- $(filter %.shp,$^)
	cp $@ $(TARGET)

topo/il_places.json: shp/il_places.shp
	mkdir -p $(dir $@)
	TOPOJSON -o $@ \
	--id-property=GEOID \
	-- $(filter %.shp, $^)
	cp $@ $(TARGET)

# Uses CSVs in bin/legislative for representative and party information

topo/il_congressional.json: shp/il_congressional.shp
	mkdir -p $(dir $@)
	TOPOJSON -o $@ \
	--id-property=CD113FP,district \
	-e il_congressional.csv \
	-p dist=district \
	-p rep=congressperson \
	-p party=party \
	-- $(filter %.shp, $^)
	cp $@ $(TARGET)

topo/il_state_house.json: shp/il_legislative/PA_97-6_House_Districts.shp
	mkdir -p $(dir $@)
	TOPOJSON -o $@ \
	--id-property=District_1,district \
	-e il_house.csv \
	-p dist=district \
	-p rep=representative \
	-p party=party \
	-- $(filter %.shp, $^)
	cp $@ $(TARGET)

topo/il_state_senate.json: shp/il_legislative/PA_97-6_Senate_Districts.shp
	mkdir -p $(dir $@)
	TOPOJSON -o $@ \
	--id-property=District_1,district \
	-e il_senate.csv \
	-p dist=district \
	-p rep=senator \
	-p party=party \
	-- $(filter %.shp, $^)
	cp $@ $(TARGET)

topo/il_chicago_community_area.json: shp/il_chicago_community_area.geojson
	mkdir -p $(dir $@)
	TOPOJSON -o $@ \
	--id-property=AREA_NUM_1 \
	-p community=COMMUNITY \
	-- $(filter %.geojson, $^)
	cp $@ $(TARGET)


##############
#  numeric   #
##############

allinput: zip/input.zip
	unzip -d $(basename $@) $<
	mv $@/input .
	rm -rf $@

allcsv: allinput
	rm -rf ../app/data/maps
	rm -rf ../app/data/click
	python data-maker/builder.py
	mv output/maps ../app/data/maps
	mv output/click ../app/data/click