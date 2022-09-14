# chooseAttributesScript.R
#
# This script is used to statistically analyse how much impact each of 9 restaurant attributes have on a restaurant's star rating.
# The 9 attributes were chosen due to their relatively easily remediable nature -- a restaurateur would thus likely be able to act
# on recommendations garnered from the model's outputs.
#
# August Weinbren, 2021

library(jsonlite)
library(dplyr)
library(tibble)

# Change this path
yelp <- stream_in(file("/Users/augustw/Google_Drive/code/casa/casa0017/casa0017-assessment--yelpout/yelp_dataset/yelp_academic_dataset_business.json"))
# Change this state if you wish
working_state <- 'WA'

#####

attributes <- yelp['attributes']
attributes['attributes.WiFi']
yelp_flat <- flatten(yelp)

yelp_tbl <- as_tibble(yelp_flat)
yelp_tbl <- yelp_tbl %>% filter(grepl("Restaurant",categories))
yelp_tbl <- yelp_tbl %>% filter(state == working_state)

yelp_tbl %>% mutate(categories = as.character(categories)) %>% select(categories)
yelp_tbl_filtered <- yelp_tbl %>% select("stars",starts_with("attributes"),)
yelp_tbl_filtered_attributes <- yelp_tbl_filtered %>% select(contains("Wifi"),
                                                  contains("CreditCards"),contains("WheelchairAccessible"),contains("Caters"),
                                                  contains("RestaurantReservations"),
                                                  contains("HappyHour"),contains("HasTV"),contains("Alcohol"),contains("TakeOut"),contains("Delivery"))
text_to_ones <- yelp_tbl_filtered_attributes %>% replace(!is.na(.), 1)
na_to_zeroes <- text_to_ones %>% replace(is.na(.), 0)
as_numbers <- na_to_zeroes %>% mutate_all(funs(as.numeric(as.factor(.))))
yelp_stars <- yelp_tbl_filtered %>% select("stars")
yelp_recombined <- as_numbers %>% add_column(yelp_stars, .before=TRUE)
full_fit = lm(yelp_stars$stars~., data=yelp_recombined)
full_fit
