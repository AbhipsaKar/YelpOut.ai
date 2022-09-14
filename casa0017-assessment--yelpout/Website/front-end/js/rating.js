/* FILE : rating.js
*  Desc : functions related to rating and chart on the website 
*/
var currentSelectState = ''; //State selected by user
var dataset = new Map();    //Map object to hold JSON returned from backend
var featureArray = new Array(9).fill(0); //Attribute selection array 

$(document).ready(function () {

    // initialization of home screen
    HomeInit();
});

/*  Update new state of each
 *  attribute in global array.
 */
function switchFeature(position,value) {
    console.log("switchFeature");
    
    if(value)
        featureArray[position] = 1 ;    //Switch is ON
    else
        featureArray[position] = 0;     //Switch is OFF

    console.log(featureArray);

    resetRating();  //Refresh rating
}

/*  Reset rating when 
 *  attribute list is changed
 */
function resetRating()
{
    $("#ratingtext").hide("slow");
    showRating();
    setTimeout(function(){ $("#ratingtext").show("slow"); },1500);

}
/*  Pick the values of each attribute
 *  when there is change in their switch state.
 */
function pickSelectedAttributes() {
    console.log("pickSelectedAttributes");
    var HappyHour = document.getElementById("HappyHour");
    var WiFi = document.getElementById("Wi-Fi");
    var BusinessAcceptCreditCards = document.getElementById("BusinessAcceptCreditCards");
    var WheelchairAccessible = document.getElementById("WheelchairAccessible");
    var RestaurantsTakeOut = document.getElementById("RestaurantsTakeOut");
    var Caters = document.getElementById("Caters");
    var RestaurantsDelivery = document.getElementById("RestaurantsDelivery");
    var Alcohol = document.getElementById("Alcohol");
    var HasTV = document.getElementById("HasTV");

    
    HappyHour.addEventListener("click", function () { switchFeature(4,HappyHour.value) });
    WiFi.addEventListener("click", function () { switchFeature(0,WiFi.value) });
    BusinessAcceptCreditCards.addEventListener("click", function () { switchFeature(1,BusinessAcceptCreditCards.value)});
    WheelchairAccessible.addEventListener("click", function () { switchFeature(2,WheelchairAccessible.value)});
    RestaurantsTakeOut.addEventListener("click", function () { switchFeature(7,RestaurantsTakeOut.value) });
    Caters.addEventListener("click", function () { switchFeature(3,Caters.value) });
    RestaurantsDelivery.addEventListener("click", function () { switchFeature(8,RestaurantsDelivery.value) });
    Alcohol.addEventListener("click", function () { switchFeature(6,Alcohol.value) });
    HasTV.addEventListener("click", function () { switchFeature(5,HasTV.value) });
}
/*  Show star rating in stars
*   and percentage.
*/
function showRating() {
    // Show star rating
    const CONVERSION_RATING = 20; //Set conversion rating from rating to percent
    console.log("ShowRating : ");
    console.log(featureArray);
    var url = "http://dev.spatialdatacapture.org:8871/weights/" + currentSelectState;
    var rating = 0;
    $.getJSON(url, function (data) {
        var loop = 0;
        $.each(data[0], function (key, val) {
            console.log("Key is ",key);
            console.log("val is ",featureArray[loop])
            if (key == "state") {
                //Ignore the value
            }
            else if (key == "intercept") {
                rating += val; //Add the intercept
            }
            else {
                if (featureArray[loop]) {
                    rating += val;

                }
                loop++; //Add the intercept and increment the loop
            }
            console.log("Rating is ",rating);
        });
        if (rating < 1) {
            rating = 1;
        }
        if (rating > 5) {
            rating = 5;
        }

        rating = rating.toFixed(1);
        var innerWidth = rating * CONVERSION_RATING;
        $(".stars-inner").animate({ "width": (innerWidth + "%") }, 4000, function () { $("#ratingtext").html(rating); }); //Animate the filling of the star rating
    });
}

/* Returns the currently selected state */
function getState()
{
    console.log("Get state ",currentSelectState)
    return currentSelectState;
}

/*
* Draws the chart of attributes for the selected state
*/
function chart() {
    var url = "http://dev.spatialdatacapture.org:8871/weights/" + currentSelectState;
    console.log("Show chart",currentSelectState);
    var feature = new Map();
    $.getJSON(url, function (data) {
        $.each(data[0], function (key, val) {
            if (key != "intercept" && key != "state") {
                dataset.set(key, val);
            }

        });

        var myChartEchart = echarts.init(document.getElementById("Ratingchart"));

        myChartEchart.on("click", function (info) {

            showmarkers(info);

        });

        var labelRight = {
            position: 'right'
        };
        option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {  //properties of the chart container
                left: 170,
                width: 280,
                height: 200,

            },
            xAxis: {    //Set properties of the x axis: attribute weights
                type: 'value',
                position: 'top',
                nameTextStyle: {
                    //fontWeight : 'lighter',
                    align: 'center',
                    textBorderType: 'dotted',
                    color: 'rgba(71, 71, 71, 0.2)'
                },
                axisLine: { onZero: true },
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: 'rgba(71, 71, 71, 0.2)'
                    }
                }
            },
            yAxis: {    //Set properties of the y axis: attributes
                type: 'category',
                axisLine: { show: false },
                axisLabel: { show: true },
                axisTick: { show: false },
                splitLine: { show: false },
                axisPointer: { show: true },
                nameTextStyle: {
                    fontWeight: '20px',
                    textBorderType: 'dotted',
                    color: 'rgba(0, 0, 250, 0.2)'
                },
                data: Array.from(dataset.keys()),

            },
            series: [   //Set properties of the bar chart
                {
                    name: 'Weight predictor',
                    type: 'bar',
                    stack: '',
                    label: {        //Set properties of the bar labels
                        show: false,
                        fontSize: 6,
                        formatter: '{c}',
                    },
                    barWidth: 12, //Width of the bars
                    animation: true,
                    animationDuration: 3000, //Animate the bars
                    data: Array.from(dataset.values()),
                    itemStyle: {  //Set properties of individual bars
                        color: d => d.data > 0 ? 'rgb(33, 153, 33)' : 'brown',
                        opaState: 0.8,
                    },


                }
            ]
        };
        myChartEchart.setOption(option);

    });
}

/* Maximise the map and minimise the chart
 * when user clicks on the map.
 */
function changeFocusToMap() {
    console.log("Shifting focus from chart to map");
    $(".maximise").hide("slow", function () {
        $("#Rating").animate({ "width": "35%" }, 1000)
        $("#map").animate({ "left": "30px", "width": "95%" }, 1000)
            ;
    });

}
/* Maximise the charts when clicking
 * on the chart.
 */
function changeFocusToChart() {
    console.log("Shifting focus from map to chart");
    /* var max_size = (getComputedStyle(document.querySelector('body'))).getPropertyValue('--rating-chart-size'); */
    //console.log(max_size);
    var size = "40%";
    $("#Rating").animate({ "width": size }, 1000, function () {
        $(".maximise").show("slow")
        $("#map").animate({ "left": "280px", "width": "36%" }, 1000)
    });
}

/*  When the state selected on the home page
 *  the map and rating containers are displayed.
 */
function clickStateForSelect(State) {
    console.log("Click %s for select", State);
    currentSelectState = State;
    SetStateName(currentSelectState);
    console.log("current select State is ", currentSelectState);
    $(".showHome").hide("slow", function () {
        $("#groupContainer").show("slow", function () {
            $("#map").show();
            $("#Rating").show();
            $("#Selection").show();
            //show map background
            showMap();
            //Pick the values of selected attributes
            pickSelectedAttributes();
            //Show the rating based on attributes
            showRating();
            chart();
            
        });
    });
}

/* Function to hide other containers while displaying the home screen */
function HomeInit() {
    $("#map").hide();
    $("#Rating").hide();
    $("#Selection").hide();
    $(".showHome").show();
}
