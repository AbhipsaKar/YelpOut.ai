/* FILE : map.js
*  Desc : functions related to map layers on the website 
*/
const STATES = 'https://raw.githubusercontent.com/kjhealy/us-county/master/data/geojson/gz_2010_us_040_00_500k.json'
const COUNTRIES = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson'
var state_name = ''; //State name in String format

//Mapping the state code to state name
var stateMap = new Map([
  ['CO', 'Colorado'],
  ['FL', 'Florida'],
  ['OR', 'Oregon'],
  ['GA', 'Georgia'],
  ['OH', 'Ohio'],
  ['TX', 'Texas'],
  ['MA', 'Massachusetts'],
  ['WA', 'Washington']]);

//Mapping the attributes from chart to database
var attrMap = new Map([
  ['delivery', 'RestaurantsDelivery'],
  ['take_out', 'RestaurantsTakeOut'],
  ['alcohol', 'Alcohol'],
  ['has_tv', 'HasTv'],
  ['happy_hour','HappyHour'],
  ['caters','Caters'],
  ['wheelchair_accessible','wheelchairAccessible'],
  ['credit_cards','BusinessAcceptsCreditCards'],
  ['wifi','Wifi']
])

var longitude =new Map([
  ['Colorado',38],
  ['Florida',28],
  ['Oregon',43],
  ['Georgia',32],
  ['Ohio',40],
  ['Texas',32],
  ['Massachusetts',42],
  ['Washington',47]
])

var latitude =new Map([
  ['Colorado',-105],
  ['Florida',-81],
  ['Oregon',-120],
  ['Georgia',-82],
  ['Ohio',-82],
  ['Texas',-99],
  ['Massachusetts',-72],
  ['Washington',-120]
])

//Properties of icon marker on map
const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 40, height: 120, mask: false }
};

//Set state name corresponding to state selected by user
function SetStateName(currentSelectState) {
  state_name = stateMap.get(currentSelectState);
  console.log("State name ", state_name);
}

/*  Draw the layers on map
*   and highlight the state 
*/
function showMap() {
  const basemap = new deck.GeoJsonLayer({
    id: 'base-map', //Map of the world
    data: COUNTRIES, //map of countries
    // Styles
    stroked: true,
    filled: true,
    lineWidthMinPixels: 1,
    opacity: 0.7,
    getLineColor: [252, 148, 3], //RGB 0 - 255
    getFillColor: [255, 255, 255, 250],
    interactive: true
  });

  const statemap = new deck.GeoJsonLayer({
    id: 'base-map-state', //every layer needs to have a unique ID
    data: STATES, //data can be passed as variable or added inline
    // Styles
    dataTransform: d => d.features.filter(f => f.properties.NAME == state_name),
    stroked: true,
    filled: true,
    lineWidthMinPixels: 1.0,
    opacity: 0.7,
    getLineColor: [10, 10, 10], //Fill line colour of selected state
    getFillColor: [71, 71, 71, 250], //Fill colour of selected state
    pickable: false,
    interactive: true

  });

  const deckgl = new deck.DeckGL({
    container: 'map', // the id of the div element
    //Set to random coordinates in US
    initialViewState: {
      latitude: 45,
      longitude: -99,
      zoom: 2.5,
      bearing: 0,
      pitch: 0
    },
    parameters: {
      //Canvas background color, it can be applied to DIV CSS as well
      clearColor: [0.84, 0.84, 0.89, 1.0] //RGB 0-1+ opacity (252, 196, 45, 0.836)
    },
    controller: true, //activate the mouse control

    layers: [

      //First layer
      basemap,
      //Second layer
      statemap,

    ],

    getTooltip: ({ object }) => object && {
      html:
        `
      ${object.name ? object.name : ''}<br/>
      ${object.city ? ('(' + object.city + ')') : ''}`,
      style: {
        backgroundColor: 'peach',
        fontSize: '1em',
        color: 'white',
      }
    }
  });
}

/*  show the markers of the 
*   resturant locations on state map.
*/
function showmarkers(info) {
  console.log("showmarkers");
  console.log(info);

  var attr = info.name;

  const basemap = new deck.GeoJsonLayer({
    id: 'base-map', //Map of the world
    data: COUNTRIES, //map of countries
    // Styles
    stroked: true,
    filled: true,
    lineWidthMinPixels: 1,
    opacity: 0.7,
    getLineColor: [252, 148, 3], //RGB 0 - 255
    getFillColor: [255, 255, 255, 250],
    interactive: true
  });

  const statemap = new deck.GeoJsonLayer({
    id: 'base-map-state', //every layer needs to have a unique ID
    data: STATES, //data can be passed as variable or added inline
    // Styles
    dataTransform: d => d.features.filter(f => f.properties.NAME == state_name),
    stroked: true,
    filled: true,
    lineWidthMinPixels: 1.0,
    opacity: 0.7,
    getLineColor: [10, 10, 10], //Fill line colour of selected state
    getFillColor: [71, 71, 71, 250], //Fill colour of selected state
    pickable: false,
    interactive: true

  });

  const iconlayer = new deck.IconLayer({
    id: 'iconlayer',
    data: 'http://dev.spatialdatacapture.org:8871/top-rated/' + getState() + '/' + attrMap.get(attr),
    pickable: true,
    // iconAtlas and iconMapping are required
    // getIcon: return a string
    iconAtlas: '../img/marker.png',
    iconMapping: ICON_MAPPING,
    getIcon: d => 'marker',
    sizeScale: 20,
    getPosition: d => [parseFloat(d.longitude), parseFloat(d.latitude)],
    getSize: d => 2,

  });

  const deckgl = new deck.DeckGL({
    container: 'map', // the id of the div element
    //Set to central coordinates in US
    initialViewState: {
      latitude: longitude.get(state_name),
      longitude: latitude.get(state_name),
      zoom: 5.5,
      bearing: 0,
      pitch: 0
    },
    parameters: {
      //Canvas background color, it can be applied to DIV CSS as well
      clearColor: [0.84, 0.84, 0.89, 1.0] //RGB 0-1+ opacity (252, 196, 45, 0.836)
    },
    controller: true, //activate the mouse control

    layers: [

      //First layer
      basemap,
      //Second layer
      statemap,
      //Third layer
      iconlayer

    ],
    //Show tooltip for restaurant name and city
    getTooltip: ({ object }) => object && {
      html:
        `
      ${object.name ? object.name : ''}<br/>
      ${object.city ? ('(' + object.city + ')') : ''}`,
      style: {
        backgroundColor: 'peach',
        fontSize: '1em',
        color: 'white',
      }
    }
  });

}

