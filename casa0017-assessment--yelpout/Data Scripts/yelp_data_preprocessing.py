# -*- coding: utf-8 -*-
"""
Created on Tue Oct 26 16:25:55 2021

@author: Cade
"""

import pandas as pd 

## load datasets
data_url = 'archive/yelp_academic_dataset_business.json'

df = pd.read_json(data_url, lines=True)

df = df.drop(columns=['postal_code', 'is_open', 'hours'])

#df = df.join(pd.get_dummies(df.categories))

df = df[df['attributes'].notnull()]

df = df[df['attributes'] != '']
df = df[df['attributes'] != None]

df = df[df['address'] != '']

df = df[df['categories'].notnull()]

df = df[df['categories'].str.find('Restaurants') != -1]

# df['categories'] = df['categories'].apply(lambda x : x.split(',')[0])

df = df.reset_index(drop = True)

attributes = ['WiFi', 'BusinessAcceptsCreditsCards', 'WheelchairAccessible', 'Cater', \
              'HappyHour', 'HasTV', 'Alcohol', 'RestaurantsTakeOut', 'RestaurantsDelivery']
    

#%%    
for i in attributes:
    df[i] = 0
    
for i in attributes:
    att = i
    for j in range(len(df)):
        if (i in df['attributes'][j]):  
            ans = df['attributes'][j][i]
            if (ans == False or ans =='False' or ans == 'None'):
                df[i][j] = 0
            else:
                df[i][j] = 1
        else:
            df[i][j] = 0
                
 
df.to_csv("yelpout_restaurants_clean.csv", index = False)
