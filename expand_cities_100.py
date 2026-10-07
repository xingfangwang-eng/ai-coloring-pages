import json
import os

# 100 个全美高断电风险都市圈与县级市高密实体库
raw_cities = [
    # --- 佛罗里达州 (飓风走廊 & 沿海风暴潮) ---
    ("Miami", "Florida", "FL", "Miami-Dade County", "Category 3+ Hurricanes & Flooding", "Hurricane", "Florida Power & Light (FPL)", "1-800-4-OUTAGE", "14.8¢", "Hurricane Irma (2017), Hurricane Andrew (1992)", "humid_hurricane"),
    ("Tampa", "Florida", "FL", "Hillsborough County", "Gulf Storm Surges & Substation Flooding", "Hurricane", "Tampa Electric (TECO)", "1-877-588-1010", "15.6¢", "Hurricane Helene (2024), Hurricane Idalia (2023)", "surge_flood"),
    ("Orlando", "Florida", "FL", "Orange County", "Inland Tropical Storm Winds & Oak Snaps", "Tropical Storm", "Orlando Utilities Commission (OUC)", "407-423-9018", "14.2¢", "Hurricane Ian (2022), Hurricane Charley (2004)", "inland_wind"),
    ("Jacksonville", "Florida", "FL", "Duval County", "St. Johns River Floods & Nor'easter Winds", "Nor'easter", "JEA", "904-665-6000", "14.5¢", "Hurricane Matthew (2016)", "surge_flood"),
    ("Sarasota", "Florida", "FL", "Sarasota County", "Barrier Island Storm Surges", "Hurricane", "FPL", "1-800-4-OUTAGE", "14.8¢", "Hurricane Ian (2022), Hurricane Debby (2024)", "surge_flood"),
    ("Fort Myers", "Florida", "FL", "Lee County", "Direct Category 4 Landfall Surges", "Hurricane", "LCEC / FPL", "239-656-2300", "15.1¢", "Hurricane Ian (2022)", "surge_flood"),
    ("Cape Coral", "Florida", "FL", "Lee County", "Canal Backflow Inundation", "Hurricane", "LCEC", "239-656-2300", "15.1¢", "Hurricane Ian (2022)", "surge_flood"),
    ("Naples", "Florida", "FL", "Collier County", "Southwest Coast Extreme Storm Surges", "Hurricane", "FPL", "1-800-4-OUTAGE", "14.8¢", "Hurricane Irma (2017)", "surge_flood"),
    ("St. Petersburg", "Florida", "FL", "Pinellas County", "Peninsula Isolation & Substation Trips", "Hurricane", "Duke Energy Florida", "1-800-228-8485", "16.2¢", "Hurricane Helene (2024)", "surge_flood"),
    ("Clearwater", "Florida", "FL", "Pinellas County", "Coastal Barrier Floods & Salt Spray Corrosion", "Hurricane", "Duke Energy Florida", "1-800-228-8485", "16.2¢", "Hurricane Idalia (2023)", "surge_flood"),
    ("Pensacola", "Florida", "FL", "Escambia County", "Panhandle High-Velocity Landfalls", "Hurricane", "FPL", "1-800-4-OUTAGE", "14.8¢", "Hurricane Sally (2020), Hurricane Ivan (2004)", "humid_hurricane"),
    ("Tallahassee", "Florida", "FL", "Leon County", "Tornado Clusters & Severe Canopy Downings", "Severe Storm", "City of Tallahassee Utilities", "850-891-4968", "13.9¢", "May 2024 Tornado Outbreak, Hurricane Hermine", "inland_wind"),
    ("Gainesville", "Florida", "FL", "Alachua County", "North Central Oak Limb Line Drops", "Severe Storm", "Gainesville Regional Utilities (GRU)", "352-334-2871", "15.4¢", "Hurricane Irma Precedents", "inland_wind"),
    ("Daytona Beach", "Florida", "FL", "Volusia County", "Atlantic Beachfront Nor'easter Winds", "Nor'easter", "FPL", "1-800-4-OUTAGE", "14.8¢", "Hurricane Nicole (2022)", "surge_flood"),
    ("Port St. Lucie", "Florida", "FL", "St. Lucie County", "Treasure Coast Hurricane Impacts", "Hurricane", "FPL", "1-800-4-OUTAGE", "14.8¢", "Hurricane Frances & Jeanne (2004)", "humid_hurricane"),
    ("West Palm Beach", "Florida", "FL", "Palm Beach County", "Atlantic Hurricane Feeder Bands", "Hurricane", "FPL", "1-800-4-OUTAGE", "14.8¢", "Hurricane Dorian Precedents", "humid_hurricane"),
    ("Boca Raton", "Florida", "FL", "Palm Beach County", "Urban Grid Feeder Overloads", "Hurricane", "FPL", "1-800-4-OUTAGE", "14.8¢", "Hurricane Wilma (2005)", "humid_hurricane"),
    ("Key West", "Florida", "FL", "Monroe County", "Extreme Overseas Highway Isolation", "Hurricane", "Keys Energy Services", "305-295-1010", "17.4¢", "Hurricane Irma (2017)", "surge_flood"),
    ("Lakeland", "Florida", "FL", "Polk County", "Central Ridge Thunderstorm Microbursts", "Thunderstorm", "Lakeland Electric", "863-834-4248", "13.5¢", "2004 Triple Hurricane Landfalls", "inland_wind"),
    ("Bradenton", "Florida", "FL", "Manatee County", "Manatee River Inundation & Line Trips", "Hurricane", "FPL", "1-800-4-OUTAGE", "14.8¢", "Hurricane Debby (2024)", "surge_flood"),

    # --- 德克萨斯州 (ERCOT 独立电网/寒潮/飓风双杀) ---
    ("Houston", "Texas", "TX", "Harris County", "Gulf Hurricanes & ERCOT Grid Collapses", "Hurricane & Freeze", "CenterPoint Energy", "1-800-332-7143", "14.9¢", "Hurricane Beryl (2024), Winter Storm Uri (2021)", "texas_dual"),
    ("Dallas", "Texas", "TX", "Dallas County", "Sub-Zero Freezing Rain & Radial Ice Loading", "Winter Storm", "Oncor Electric Delivery", "1-888-313-4747", "14.1¢", "Winter Storm Mara (2023), Winter Storm Uri (2021)", "winter_freeze"),
    ("Austin", "Texas", "TX", "Travis County", "Central Texas Ice Freezes & Summer Demand Tripping", "Grid Strain", "Austin Energy", "512-322-9100", "13.8¢", "2023 Central Texas Ice Storm, 2021 Freeze", "winter_freeze"),
    ("San Antonio", "Texas", "TX", "Bexar County", "Extreme 100°F+ Heat Domes & Freeze Snaps", "Heat & Freeze", "CPS Energy", "210-353-4357", "13.2¢", "2023 Record Summer Heat Dome, Winter Storm Uri", "heat_grid"),
    ("Fort Worth", "Texas", "TX", "Tarrant County", "Spring Tornado Outbreaks & Severe Downbursts", "Tornado / Storm", "Oncor Electric Delivery", "1-888-313-4747", "14.1¢", "North Texas Tornado Outbreaks", "tornado_hail"),
    ("Arlington", "Texas", "TX", "Tarrant County", "Microburst Hail & Distribution Line Trips", "Severe Storm", "Oncor Electric Delivery", "1-888-313-4747", "14.1¢", "Spring Severe Thunderstorm Series", "tornado_hail"),
    ("Plano", "Texas", "TX", "Collin County", "North Suburban Tree Contact Freezes", "Winter Freeze", "Oncor Electric Delivery", "1-888-313-4747", "14.1¢", "Winter Storm Uri (2021)", "winter_freeze"),
    ("Garland", "Texas", "TX", "Dallas County", "Suburban Feeder Line Snaps & Ice Weight", "Winter Storm", "Garland Power & Light (GPL)", "972-205-3000", "13.6¢", "2021 Texas Grid Failure", "winter_freeze"),
    ("Irving", "Texas", "TX", "Dallas County", "Severe Spring Supercells & Flooding", "Severe Storm", "Oncor Electric Delivery", "1-888-313-4747", "14.1¢", "North Texas Spring Storm Events", "tornado_hail"),
    ("Corpus Christi", "Texas", "TX", "Nueces County", "Coastal Hurricane Eye Landfalls", "Hurricane", "AEP Texas", "1-877-373-4858", "14.4¢", "Hurricane Harvey (2017)", "surge_flood"),
    ("Beaumont", "Texas", "TX", "Jefferson County", "Extreme Tropical Rainfall Inundation", "Hurricane", "Entergy Texas", "1-800-968-8243", "13.3¢", "Hurricane Harvey (2017), Hurricane Laura", "humid_hurricane"),
    ("Galveston", "Texas", "TX", "Galveston County", "Island Isolation & Sea Wall Overwashes", "Hurricane", "CenterPoint Energy", "1-800-332-7143", "14.9¢", "Hurricane Ike (2008), Hurricane Beryl", "surge_flood"),
    ("Katy", "Texas", "TX", "Fort Bend County", "West Houston Post-Beryl Transmission Collapse", "Hurricane", "CenterPoint Energy", "1-800-332-7143", "14.9¢", "Hurricane Beryl (2024)", "texas_dual"),
    ("Sugar Land", "Texas", "TX", "Fort Bend County", "Suburban Tree Damage & Flooded Substations", "Hurricane", "CenterPoint Energy", "1-800-332-7143", "14.9¢", "Hurricane Beryl (2024)", "texas_dual"),
    ("The Woodlands", "Texas", "TX", "Montgomery County", "Heavy Pine Tree Downings on Utility Feeders", "Severe Storm", "Entergy Texas", "1-800-968-8243", "13.3¢", "Hurricane Beryl, 2024 Severe Storms", "inland_wind"),
    ("Waco", "Texas", "TX", "McLennan County", "Severe Spring Hail & Tornado Outbreaks", "Tornado / Storm", "Oncor Electric Delivery", "1-888-313-4747", "14.1¢", "Central Texas Severe Supercells", "tornado_hail"),
    ("Lubbock", "Texas", "TX", "Lubbock County", "High Plains Blizzard & Freezing Dust Outages", "Winter Blizzard", "Lubbock Power & Light", "806-775-2509", "13.7¢", "2020 Historic High Plains Ice Storm", "winter_freeze"),
    ("Amarillo", "Texas", "TX", "Potter County", "Panhandle -10°F Windchill Blizzards", "Blizzard", "Xcel Energy", "1-800-895-1999", "12.8¢", "Panhandle Winter Blizzards", "winter_freeze"),
    ("Laredo", "Texas", "TX", "Webb County", "Rio Grande 110°F Heat Dome Transformer Failures", "Heatwave", "AEP Texas", "1-877-373-4858", "14.4¢", "2023 South Texas Heat Wave", "heat_grid"),
    ("McAllen", "Texas", "TX", "Hidalgo County", "Rio Grande Valley Tropical Storm Deluges", "Tropical Storm", "AEP Texas", "1-877-373-4858", "14.4¢", "Hurricane Hanna (2020)", "humid_hurricane"),

    # --- 加利福尼亚州 (PSPS 计划限电/山火/大气河流) ---
    ("Los Angeles", "California", "CA", "Los Angeles County", "Santa Ana Wind PSPS & Wildfire Threats", "Wildfire / PSPS", "SoCal Edison (SCE) / LADWP", "1-800-611-1911", "32.4¢", "Woolsey Fire PSPS, Mountain Fire (2024)", "wildfire_psps"),
    ("San Diego", "California", "CA", "San Diego County", "Backcountry Fire Weather & Highest US Utility Rates", "PSPS Shutoff", "San Diego Gas & Electric (SDG&E)", "1-800-411-7343", "44.5¢", "Annual Fall PSPS Events", "wildfire_psps"),
    ("Sacramento", "California", "CA", "Sacramento County", "Winter Atmospheric Rivers & Valley Soil Saturation", "Atmospheric River", "SMUD / PG&E", "1-888-456-7683", "18.5¢", "2023 Atmospheric River Series", "surge_flood"),
    ("San Francisco", "California", "CA", "San Francisco County", "Urban Fog Corrosion & Seismic Grid Vulnerability", "Grid Strain", "PG&E", "1-800-743-5002", "36.2¢", "2023 Coastal Gale Outages", "wildfire_psps"),
    ("San Jose", "California", "CA", "Santa Clara County", "Silicon Valley Heat Flashes & Flex Alerts", "Rolling Blackout", "PG&E", "1-800-743-5002", "36.2¢", "2022 Record Heat Flex Alerts", "heat_grid"),
    ("Fresno", "California", "CA", "Fresno County", "Central Valley 110°F Heat Grid Drops", "Extreme Heat", "PG&E", "1-800-743-5002", "36.2¢", "2023 Central Valley Heat Dome", "heat_grid"),
    ("Riverside", "California", "CA", "Riverside County", "Inland Empire High-Wind PSPS Trips", "PSPS Shutoff", "SCE", "1-800-611-1911", "32.4¢", "Annual Santa Ana Wind Events", "wildfire_psps"),
    ("San Bernardino", "California", "CA", "San Bernardino County", "Cajon Pass High-Velocity Gale De-energizations", "PSPS Shutoff", "SCE", "1-800-611-1911", "32.4¢", "Bridge Fire PSPS Precedents", "wildfire_psps"),
    ("Bakersfield", "California", "CA", "Kern County", "Southern Valley Dust Wind Transformer Blows", "Severe Wind", "PG&E", "1-800-743-5002", "36.2¢", "Summer Agricultural Line Strains", "heat_grid"),
    ("Oakland", "California", "CA", "Alameda County", "East Bay Hills Critical Fire Weather Cuts", "PSPS Shutoff", "PG&E", "1-800-743-5002", "36.2¢", "Tunnel Fire Anniversary PSPS", "wildfire_psps"),
    ("Santa Rosa", "California", "CA", "Sonoma County", "Wine Country Diablo Wind Planned Blackouts", "PSPS Shutoff", "PG&E", "1-800-743-5002", "36.2¢", "Kincade Fire PSPS, Tubbs Fire", "wildfire_psps"),
    ("Anaheim", "California", "CA", "Orange County", "Canyon Fire Wind PSPS Events", "Wildfire / PSPS", "Anaheim Public Utilities / SCE", "714-765-3300", "22.8¢", "Santa Ana Wind Canyon Fires", "wildfire_psps"),
    ("Santa Ana", "California", "CA", "Orange County", "Wind Corridor Substation Load Trips", "PSPS Shutoff", "SCE", "1-800-611-1911", "32.4¢", "Fall Windstorm De-energizations", "wildfire_psps"),
    ("Irvine", "California", "CA", "Orange County", "Silverado Canyon Wildfire Evacuations", "Wildfire / PSPS", "SCE", "1-800-611-1911", "32.4¢", "Silverado Fire PSPS Events", "wildfire_psps"),
    ("Chula Vista", "California", "CA", "San Diego County", "South Bay Border Wildfire Wind Alerts", "PSPS Shutoff", "SDG&E", "1-800-411-7343", "44.5¢", "Annual Fall SDG&E PSPS Cuts", "wildfire_psps"),
    ("Stockton", "California", "CA", "San Joaquin County", "Delta Breeze Lightning & High Water Cuts", "Severe Storm", "PG&E", "1-800-743-5002", "36.2¢", "Winter Storm Series 2023", "surge_flood"),
    ("Modesto", "California", "CA", "Stanislaus County", "Valley Agricultural Transformer Melts", "Heatwave", "Modesto Irrigation District (MID)", "209-526-7373", "21.4¢", "Summer Heat Load Trips", "heat_grid"),
    ("Oxnard", "California", "CA", "Ventura County", "Ventura County Coastal PSPS & High Winds", "PSPS Shutoff", "SCE", "1-800-611-1911", "32.4¢", "Thomas Fire Precedents", "wildfire_psps"),
    ("Redding", "California", "CA", "Shasta County", "Northern Mountain Mega-Fire Grid Destruction", "Wildfire", "City of Redding Electric / PG&E", "530-245-7000", "19.8¢", "Carr Fire Historical Grid Losses", "wildfire_psps"),
    ("Chico", "California", "CA", "Butte County", "Camp Fire Corridor Extreme Wind Shutoffs", "PSPS Shutoff", "PG&E", "1-800-743-5002", "36.2¢", "Camp Fire & Park Fire (2024)", "wildfire_psps"),

    # --- 路易斯安那州 & 密西西比/阿拉巴马 (墨西哥湾风暴中心) ---
    ("New Orleans", "Louisiana", "LA", "Orleans Parish", "Catastrophic Hurricane Landfalls & Levee Pump Drops", "Major Hurricane", "Entergy New Orleans", "1-800-968-8243", "13.6¢", "Hurricane Ida (2021), Hurricane Katrina (2005)", "humid_hurricane"),
    ("Baton Rouge", "Louisiana", "LA", "East Baton Rouge Parish", "Inland Hurricane Inundation & Sump Drops", "Hurricane", "Entergy Louisiana", "1-800-968-8243", "12.8¢", "Hurricane Ida (2021)", "humid_hurricane"),
    ("Lafayette", "Louisiana", "LA", "Lafayette Parish", "Bayou Hurricane Surges & Lightning Blowouts", "Tropical Storm", "LUS", "337-291-5700", "12.4¢", "Hurricane Laura & Delta (2020)", "humid_hurricane"),
    ("Lake Charles", "Louisiana", "LA", "Calcasieu Parish", "Consecutive Category 4 Eye Strikes", "Major Hurricane", "Entergy Louisiana", "1-800-968-8243", "12.8¢", "Hurricane Laura (2020), Hurricane Delta", "humid_hurricane"),
    ("Shreveport", "Louisiana", "LA", "Caddo Parish", "North Louisiana Winter Ice & Spring Supercells", "Ice & Storm", "SWEPCO", "1-888-218-8672", "12.1¢", "2023 Summer Severe Storms", "winter_freeze"),
    ("Mobile", "Alabama", "AL", "Mobile County", "Mobile Bay Coastal Storm Surge Overtopping", "Hurricane", "Alabama Power", "1-800-888-2726", "15.3¢", "Hurricane Sally (2020)", "surge_flood"),
    ("Gulfport", "Mississippi", "MS", "Harrison County", "Mississippi Sound Catastrophic Surges", "Major Hurricane", "Mississippi Power", "1-800-532-1502", "14.2¢", "Hurricane Zeta (2020), Katrina", "surge_flood"),

    # --- 北卡罗来纳 / 南卡罗来纳 / 佐治亚 (东南沿海和大西洋) ---
    ("Raleigh", "North Carolina", "NC", "Wake County", "Piedmont Winter Glaze & Deluges", "Hurricane & Ice", "Duke Energy Progress", "1-800-419-6356", "13.9¢", "Hurricane Florence (2018), 2022 Winter Freezes", "winter_freeze"),
    ("Charlotte", "North Carolina", "NC", "Mecklenburg County", "Severe Thunderstorm Microbursts & Line Drops", "Severe Storm", "Duke Energy Carolinas", "1-800-769-3766", "13.9¢", "Summer Severe Microbursts", "inland_wind"),
    ("Wilmington", "North Carolina", "NC", "New Hanover County", "Cape Fear Direct Hurricane Strikes", "Hurricane", "Duke Energy Progress", "1-800-419-6356", "13.9¢", "Hurricane Florence (2018)", "surge_flood"),
    ("Asheville", "North Carolina", "NC", "Buncombe County", "Appalachian Tropical Flooding & Mountain Grid Washouts", "Flash Flood", "Duke Energy Carolinas", "1-800-769-3766", "13.9¢", "Hurricane Helene (2024)", "surge_flood"),
    ("Greensboro", "North Carolina", "NC", "Guilford County", "Triad Winter Freezing Rain Glazes", "Winter Ice", "Duke Energy Carolinas", "1-800-769-3766", "13.9¢", "2018 Winter Storm Diego", "winter_freeze"),
    ("Charleston", "South Carolina", "SC", "Charleston County", "Sunny Day King Tides & Storm Surges", "Coastal Flooding", "Dominion Energy SC", "1-888-333-4465", "14.6¢", "Tropical Storm Debby (2024), Hurricane Hugo", "surge_flood"),
    ("Columbia", "South Carolina", "SC", "Richland County", "Midlands Severe Heat & Historic River Basin Floods", "Flood / Storm", "Dominion Energy SC", "1-888-333-4465", "14.6¢", "2015 1000-Year Flood Event", "inland_wind"),
    ("Myrtle Beach", "South Carolina", "SC", "Horry County", "Grand Strand Coastal Beachfront Surges", "Hurricane", "Santee Cooper / Horry Electric", "1-888-769-7688", "13.8¢", "Hurricane Matthew (2016)", "surge_flood"),
    ("Atlanta", "Georgia", "GA", "Fulton County", "Freezing Rain on Mature Tree Canopy", "Ice & Wind", "Georgia Power", "1-888-891-0938", "14.7¢", "2014 'Snowmageddon' Ice Freeze", "inland_wind"),
    ("Savannah", "Georgia", "GA", "Chatham County", "Lowcountry Salt Marsh Storm Surges", "Hurricane", "Georgia Power", "1-888-891-0938", "14.7¢", "Hurricane Matthew, Hurricane Helene (2024)", "surge_flood"),
    ("Augusta", "Georgia", "GA", "Richmond County", "Severe Inland Hurricane Remnant Tree Drops", "High Winds", "Georgia Power", "1-888-891-0938", "14.7¢", "Hurricane Helene (2024)", "inland_wind"),

    # --- 亚利桑那 / 内华达 / 犹他 / 科罗拉多 (西南部与高海拔) ---
    ("Phoenix", "Arizona", "AZ", "Maricopa County", "115°F+ Heatwaves & Monsoon Haboob Dust Storms", "Extreme Heat", "APS / SRP", "1-855-688-2437", "15.8¢", "2023 Record 31-Day 110°F Heat Dome", "heat_grid"),
    ("Tucson", "Arizona", "AZ", "Pima County", "Summer Monsoon Lightning Strikes", "Monsoon Storm", "Tucson Electric Power (TEP)", "520-623-7711", "15.2¢", "Annual Summer Monsoon Series", "heat_grid"),
    ("Mesa", "Arizona", "AZ", "Maricopa County", "East Valley Desert Substation Thermal Trips", "Heatwave", "City of Mesa / SRP", "480-644-2262", "15.8¢", "July 2024 Desert Heatwave", "heat_grid"),
    ("Chandler", "Arizona", "AZ", "Maricopa County", "High Tech Corridor AC Grid Spikes", "Heatwave", "SRP", "602-236-8888", "15.8¢", "Summer Demand Peak Days", "heat_grid"),
    ("Scottsdale", "Arizona", "AZ", "Maricopa County", "Desert Wash Flash Floods & High Heat", "Heatwave", "APS", "1-855-688-2437", "15.8¢", "Sonoran Summer Heat Dome", "heat_grid"),
    ("Las Vegas", "Nevada", "NV", "Clark County", "Record 120°F Heatwaves & Condo Grid Overloads", "Extreme Heat", "NV Energy", "702-402-2900", "15.1¢", "July 2024 All-Time 120°F Record", "heat_grid"),
    ("Henderson", "Nevada", "NV", "Clark County", "Suburban Heat Feeder Meltdowns", "Extreme Heat", "NV Energy", "702-402-2900", "15.1¢", "Mojave Heat Wave Outages", "heat_grid"),
    ("Reno", "Nevada", "NV", "Washoe County", "Sierra Nevada Mountain Blizzard Drops", "Blizzard", "NV Energy", "775-834-4444", "15.1¢", "2023 Record Sierra Snowstorms", "winter_freeze"),
    ("Denver", "Colorado", "CO", "Denver County", "Spring Cement-Snow Blizzards & Line Snaps", "Heavy Snow", "Xcel Energy Colorado", "1-800-895-1999", "14.9¢", "March 2021 Historic Blizzard", "winter_freeze"),
    ("Colorado Springs", "Colorado", "CO", "El Paso County", "Pikes Peak Cold Gale Line Snaps", "Blizzard / Wind", "Colorado Springs Utilities", "719-448-4800", "14.2¢", "Bomb Cyclone Precedents", "winter_freeze"),
    ("Aurora", "Colorado", "CO", "Arapahoe County", "Eastern Plains High Wind Ice Freezes", "Winter Storm", "Xcel Energy", "1-800-895-1999", "14.9¢", "High Plains Spring Blizzards", "winter_freeze"),
    ("Salt Lake City", "Utah", "UT", "Salt Lake County", "Wasatch Front Winter Inversion Ice & Canyon Winds", "Canyon Wind / Ice", "Rocky Mountain Power", "1-877-508-5088", "12.3¢", "Historic Wasatch Windstorms", "winter_freeze"),
    ("Provo", "Utah", "UT", "Utah County", "Mountain Shadow Freezing Ice Storms", "Winter Ice", "Provo Power", "801-852-6000", "11.8¢", "Utah Valley Winter Glazes", "winter_freeze"),

    # --- 中西部与五大湖极寒带 (极地涡旋 Polar Vortex) ---
    ("Minneapolis", "Minnesota", "MN", "Hennepin County", "-25°F Polar Vortex Freezes & Pipe Bursts", "Polar Vortex", "Xcel Energy", "1-800-895-1999", "15.4¢", "2019 Polar Vortex (-28°F Actual)", "winter_freeze"),
    ("St. Paul", "Minnesota", "MN", "Ramsey County", "Sub-Zero Transformer Freezes & Deep Snow", "Polar Vortex", "Xcel Energy", "1-800-895-1999", "15.4¢", "2019 Historic Arctic Outbreak", "winter_freeze"),
    ("Chicago", "Illinois", "IL", "Cook County", "Lake Effect Blizzards & Gale-Force Lake Front Cuts", "Blizzard", "ComEd", "1-800-334-7661", "16.8¢", "2019 Polar Vortex (-23°F), Lake Storms", "winter_freeze"),
    ("Naperville", "Illinois", "IL", "DuPage County", "Suburban Ice Storm Line Fractures", "Winter Storm", "City of Naperville Electric", "630-420-6187", "14.5¢", "Northern Illinois Winter Ice Events", "winter_freeze"),
    ("Detroit", "Michigan", "MI", "Wayne County", "Aging Grid Infrastructure & Winter Ice Loads", "Winter Ice", "DTE Energy", "1-800-477-4747", "18.2¢", "2023 Ice Storm (800k+ Outages)", "winter_freeze"),
    ("Grand Rapids", "Michigan", "MI", "Kent County", "Lake Michigan Heavy Wet Snow Downings", "Snowstorm", "Consumers Energy", "1-800-477-5050", "17.9¢", "Lake Effect Snow Emergency Series", "winter_freeze"),
    ("Cleveland", "Ohio", "OH", "Cuyahoga County", "Lake Erie Winter Gales & August 2024 Tornado Outbreak", "Storm & Ice", "FirstEnergy / CEI", "1-888-544-4877", "15.9¢", "August 2024 Tornadoes & Lake Blizzards", "winter_freeze"),
    ("Columbus", "Ohio", "OH", "Franklin County", "Summer Derecho High Winds & Winter Glazes", "Derecho / Ice", "AEP Ohio", "1-877-237-2886", "15.5¢", "2022 Summer Derecho Outage Event", "inland_wind"),
    ("Cincinnati", "Ohio", "OH", "Hamilton County", "Ohio River Ice Storm Canopy Collapses", "Winter Ice", "Duke Energy Ohio", "1-800-543-5599", "15.1¢", "Ohio Valley Winter Storms", "winter_freeze"),
    ("Indianapolis", "Indiana", "IN", "Marion County", "Hoosier Ice Storms & Rolling Brownouts", "Ice Storm", "AES Indiana", "317-261-8111", "16.1¢", "Central Indiana Winter Ice Series", "winter_freeze"),
    ("Milwaukee", "Wisconsin", "WI", "Milwaukee County", "Sub-Zero Lake Michigan Blizzards", "Polar Vortex", "We Energies", "1-800-662-4797", "17.2¢", "2019 Extreme Polar Vortex", "winter_freeze"),

    # --- 东北部大西洋风暴走廊 (Nor'easter) ---
    ("Buffalo", "New York", "NY", "Erie County", "Historic Lake Effect Heavy Snow Loads (6+ Feet)", "Lake Effect Blizzard", "National Grid", "1-800-867-5222", "21.5¢", "Christmas Blizzard 2022, 2024 Snowstorms", "winter_freeze"),
    ("Rochester", "New York", "NY", "Monroe County", "Lake Ontario Wind Gale Line Snaps", "Blizzard", "RG&E", "1-800-743-1701", "20.8¢", "Upstate Historic Ice Storms", "winter_freeze"),
    ("Boston", "Massachusetts", "MA", "Suffolk County", "Coastal Bombogenesis Nor'easters & Flooding", "Nor'easter", "Eversource / National Grid", "1-800-592-2000", "29.8¢", "2022 Blizzard of 2022, Winter Gales", "surge_flood"),
    ("Worcester", "Massachusetts", "MA", "Worcester County", "Central Mass Heavy Snow Ice Snaps", "Winter Storm", "National Grid", "1-800-867-5222", "29.8¢", "Nor'easter Heavy Wet Snows", "winter_freeze"),
    ("Providence", "Rhode Island", "RI", "Providence County", "Narragansett Bay Gale Floods & High Electric Rates", "Nor'easter", "Rhode Island Energy", "1-855-743-1101", "31.2¢", "Coastal Nor'easter Events", "surge_flood"),
    ("Hartford", "Connecticut", "CT", "Hartford County", "Appalachian Foothill Ice Accumulations", "Ice Storm", "Eversource", "1-800-286-2000", "31.8¢", "Historic October Nor'easter Storms", "winter_freeze"),
    ("New Haven", "Connecticut", "CT", "New Haven County", "Long Island Sound Surge Blowouts", "Nor'easter", "United Illuminating (UI)", "1-800-722-5584", "32.1¢", "Tropical Storm Isaias (2020)", "surge_flood"),
    ("Philadelphia", "Pennsylvania", "PA", "Philadelphia County", "Delaware Valley High Wind Ice Rain", "Winter Storm", "PECO", "1-800-841-4141", "18.2¢", "Winter Storm Jonas Precedents", "winter_freeze"),
    ("Pittsburgh", "Pennsylvania", "PA", "Allegheny County", "Appalachian River Basin Ice Dam Outages", "Winter Storm", "Duquesne Light", "1-888-393-7000", "17.4¢", "Western PA Winter Ice Storms", "winter_freeze"),
    ("Newark", "New Jersey", "NJ", "Essex County", "Coastal Megalopolis Superstorm Grid Failures", "Nor'easter", "PSE&G", "1-800-436-7734", "19.5¢", "Superstorm Sandy Precedents", "surge_flood")
]

def build_archetype_data(archetype, city, state, threat, utility, historical):
    if archetype == "humid_hurricane":
        analysis = f"In {city}, tropical storm systems push ambient humidity past 90% while ambient temperatures remain in the upper 80s post-storm. Prolonged {utility} feeder outages rapidly trigger mold growth and food rot within 18 hours. Running a dual-hose portable air conditioner requires absorbing massive compressor starting inrushes of 1800W+, while high-efficiency LiFePO4 battery chemistry is mandatory to avoid thermal swelling in damp garage environments. Benchmark historical precedents: {historical}."
        top_name, top_asin, top_reason = "EcoFlow DELTA 2 Max (2048Wh)", "B0C77J1S1N", "2400W AC pure sine output handles high-inrush portable AC compressors and full-size kitchen refrigerators simultaneously without safety trip-offs."
        budget_name, budget_asin, budget_reason = "Jackery Explorer 1000 v2 (1070Wh)", "B0D1GBG6Y5", "Fast 1-hour AC wall recharge allows rapid topping-off before mandatory evacuation orders take effect across coastal lowlands."
        cap = "2000Wh+ (LFP Baseline)"
    elif archetype == "surge_flood":
        analysis = f"{city} features shallow coastal or riverine geography where storm surges frequently inundate street-level transformers and underground vaults. Because {utility} restoration crews cannot enter flooded neighborhoods until waters recede, backup systems must power continuous 1/3 HP or 1/2 HP drainage sump pumps (surging up to 2500W). Units with elevated wheeled chassis protect sensitive battery circuitry from standing floodwater. Benchmark precedents: {historical}."
        top_name, top_asin, top_reason = "Anker SOLIX F2000 (2048Wh)", "B0BX9T1K94", "Industrial-grade elevated chassis with built-in wheels protects internal components from damp, flood-prone utility room floors."
        budget_name, budget_asin, budget_reason = "Bluetti AC180 (1152Wh)", "B0C1SQZ5K3", "1800W continuous inverter handles heavy starting surges on submersible sump pumps to keep crawlspaces and basements dry."
        cap = "1500Wh - 2000Wh"
    elif archetype == "texas_dual":
        analysis = f"{city} faces the harshest dual-threat grid vulnerability in North America due to isolation on the standalone ERCOT transmission grid. From tropical storms knocking down coastal transmission towers to winter polar air freezing uninsulated gas wellheads, {utility} customers endure multi-day outages where personal off-grid solar generation is the only reliable lifeline. Benchmark precedents: {historical}."
        top_name, top_asin, top_reason = "EcoFlow DELTA 2 Max (2048Wh)", "B0C77J1S1N", "Expandable up to 6144Wh with extra battery modules, providing true multi-day autonomy during extended independent grid collapses."
        budget_name, budget_asin, budget_reason = "Jackery Explorer 1000 v2 (1070Wh)", "B0D1GBG6Y5", "100% emission-free and safe for indoor apartment closets where gasoline-powered generators are strictly prohibited by local fire codes."
        cap = "2000Wh+ (Expandable)"
    elif archetype == "winter_freeze":
        analysis = f"In {city}, severe freezing rain and polar vortex drops coat overhead distribution wires in heavy radial glaze, causing massive tree branch failures. Standard lithium-ion batteries degrade if charged below 32°F (0°C); advanced battery management systems with low-temperature pre-heating safeguards are essential. Powering low-wattage 60W heated electric blankets is vastly more efficient than running whole-room 1500W space heaters. Precedents: {historical}."
        top_name, top_asin, top_reason = "Anker SOLIX F2000 (2048Wh)", "B0BX9T1K94", "Advanced low-temperature thermal management ensures safe power delivery and recharge in freezing, uninsulated winter garages."
        budget_name, budget_asin, budget_reason = "Bluetti AC180 (1152Wh)", "B0C1SQZ5K3", "Powers multiple 12V and 120V heated mattress pads all night, keeping family bedrooms warm through sub-zero rolling blackouts."
        cap = "1500Wh+ (Cold-Rated LFP)"
    elif archetype == "wildfire_psps":
        analysis = f"During dry, high-velocity Santa Ana or Diablo wind events in {city}, utilities initiate Public Safety Power Shutoffs (PSPS) to eliminate wildfire spark risks, leaving neighborhoods dark for 24 to 72 hours. Strict California emissions regulations strictly ban fossil-fuel generators on residential balconies and urban townhomes. Paired high-efficiency MPPT solar charging is essential to harness intense daytime California sunshine. Precedents: {historical}."
        top_name, top_asin, top_reason = "Anker SOLIX F2000 (2048Wh)", "B0BX9T1K94", "100% CARB-compliant, clean, silent operation legal for condo balconies where gas generators incur severe municipal fines."
        budget_name, budget_asin, budget_reason = "Jackery Explorer 1000 v2 (1070Wh)", "B0D1GBG6Y5", "Pairs effortlessly with portable 200W solar panels to achieve 100% recharge in under 6 hours of bright California sun."
        cap = "1000Wh - 2000Wh"
    elif archetype == "heat_grid":
        analysis = f"In {city}, summer temperatures regularly exceed 100°F (38°C) to 115°F, driving residential air-conditioning electrical loads past the thermal breaking point of local neighborhood distribution transformers. In extreme heat, losing food preservation or medical insulin refrigeration is a critical emergency. Advanced thermal dissipation fans are required to avoid thermal throttling shutdowns. Precedents: {historical}."
        top_name, top_asin, top_reason = "Anker SOLIX F2000 (2048Wh)", "B0BX9T1K94", "Heavy-duty industrial cooling fans maintain safe discharge and charging even when ambient garage temperatures top 105°F."
        budget_name, budget_asin, budget_reason = "Bluetti AC180 (1152Wh)", "B0C1SQZ5K3", "Runs high-velocity box fans and personal misting coolers for over 15 hours continuously to prevent dangerous indoor heat exhaustion."
        cap = "2000Wh+ (Thermal Dissipation)"
    elif archetype == "tornado_hail":
        analysis = f"{city} sits in active tornadic thunderstorm corridors where spring supercells generate straight-line winds over 70 mph and heavy hail, severing above-ground utility infrastructure in minutes. Emergency backup systems must deliver high surge capacity to operate storm cellar sump pumps to prevent shelter inundation during torrential downpours. Precedents: {historical}."
        top_name, top_asin, top_reason = "EcoFlow DELTA 2 Max (2048Wh)", "B0C77J1S1N", "Instantaneous 4800W surge ceiling easily kicks over heavy basement sump pumps during tornadic downpours without tripping."
        budget_name, budget_asin, budget_reason = "Bluetti AC180 (1152Wh)", "B0C1SQZ5K3", "Rugged shock-resistant unibody construction survives rough transport into storm cellars and underground shelters."
        cap = "1500Wh+"
    else:
        analysis = f"Known for dense residential tree canopies, {city} frequently suffers localized feeder fractures when tropical storm wind gusts down mature trees across suburban power lines. {utility} restoration access is regularly blocked by road debris for 48 to 72 hours, requiring silent indoor power to sustain communication networks and medical devices. Precedents: {historical}."
        top_name, top_asin, top_reason = "EcoFlow DELTA 2 Max (2048Wh)", "B0C77J1S1N", "Ultra-quiet 30dB operation allows comfortable indoor operation right next to master bedroom medical CPAPs and home workstations."
        budget_name, budget_asin, budget_reason = "Jackery Explorer 1000 v2 (1070Wh)", "B0D1GBG6Y5", "Compact push-button form factor provides instant emergency power for Wi-Fi routers, lighting, and small appliances without complex setup."
        cap = "1000Wh - 2000Wh"

    return analysis, top_name, top_asin, top_reason, budget_name, budget_asin, budget_reason, cap

cities_100 = []

for city, state, code, county, threat, rtype, utility, phone, rate, storms, archetype in raw_cities:
    # 彻底修复空格为连字符（避免多单词州名生成空格 slug）
    clean_state = state.lower().replace(' ', '-')
    clean_city = city.lower().replace(' ', '-').replace('.', '')
    slug = f"{clean_state}-{clean_city}"

    analysis, top_name, top_asin, top_reason, budget_name, budget_asin, budget_reason, cap = build_archetype_data(
        archetype, city, state, threat, utility, storms
    )
    
    cities_100.append({
        "slug": slug,
        "cityName": city,
        "stateName": state,
        "stateCode": code,
        "countyName": county,
        "primaryThreat": threat,
        "riskType": rtype,
        "riskLevel": "High Vulnerability",
        "recommendedCapacity": cap,
        "localUtility": utility,
        "utilityPhone": phone,
        "avgKwhRate": rate,
        "historicalStorms": storms,
        "localAnalysis": analysis,
        "topPickName": top_name,
        "topPickClass": "Whole-Home Priority Pick",
        "topPickAsin": top_asin,
        "topPickReason": top_reason,
        "budgetPickName": budget_name,
        "budgetPickClass": "Portable Emergency Pick",
        "budgetPickAsin": budget_asin,
        "budgetPickReason": budget_reason
    })

base_dir = os.path.dirname(__file__)
output_dir = os.path.join(base_dir, "src", "data")
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "cities.json")

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(cities_100, f, indent=2, ensure_ascii=False)

print(f"[✓] 成功生成 {len(cities_100)} 个全美高危都市圈深度实体数据库（彻底打破同质化与空格Bug）至: {output_path}")