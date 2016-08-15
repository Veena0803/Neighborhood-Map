
var infowindow;
var map;

//Model data containing pizza stores nearby & Yelp URL for the same with their lat,lng
var model = {
    pizzaStore: [{
        title: 'Pizza Hut',
        yelp_code: "https://api.yelp.com/v2/business/pizza-hut-warwick",
        location: {
            lat: 41.6959720,
            lng: -71.5012130
        },
    }, {
        title: 'Cobblestones Wood Fired Pizza',
        yelp_code: "https://api.yelp.com/v2/business/cobblestones-wood-fired-pizza-east-greenwich",
        location: {
            lat: 41.6421260,
            lng: -71.4674510
        },
    }, {
        title: 'Pizza Heaven',
        yelp_code: "https://api.yelp.com/v2/business/pizza-heaven-east-greenwich",
        location: {
            lat: 41.6270070,
            lng: -71.4921640
        },
    }, {
        title: 'Providence Coal Fired Pizza',
        yelp_code: "https://api.yelp.com/v2/business/providence-coal-fired-pizza-north-kingstown",
        location: {
            lat: 41.6302570,
            lng: -71.4645930
        },
    }, {
        title: "Papa Gino’s Pizzeria",
        yelp_code: "https://api.yelp.com/v2/business/papa-ginos-pizzeria-west-warwick",
        location: {
            lat: 41.6740020,
            lng: -71.5002910
        },
    }, {
        title: 'Palazzo’s Pizza',
        yelp_code: "https://api.yelp.com/v2/business/palazzos-pizza-warwick-2",
        location: {
            lat: 41.7025700,
            lng: -71.4303460
        },
    }, {
        title: 'Cowesett Pizza',
        yelp_code: "https://api.yelp.com/v2/business/cowesett-pizza-west-warwick",
        location: {
            lat: 41.6852000,
            lng: -71.5041920
        },
    }, {
        title: 'The Ripe Tomato',
        yelp_code: "https://api.yelp.com/v2/business/the-ripe-tomato-warwick",
        location: {
            lat: 41.6990090,
            lng: -71.4604330
        },
    }, {
        title: 'Pag’s Pizza',
        yelp_code: "https://api.yelp.com/v2/business/pags-pizza-west-warwick",
        location: {
            lat: 41.6841060,
            lng: -71.5062610
        },
    }, {
        title: 'Piezoni’s',
        yelp_code: "https://api.yelp.com/v2/business/piezonis-east-greenwich",
        location: {
            lat: 41.6610720,
            lng: -71.4957150
        },
    }]
};

//API Call with OAuth signature reqired to access Yelp
var oAuthCall = function(i) {

    function nonce_generate() {
        return (Math.floor(Math.random() * 1e12).toString());
    }

    var yelp_URL = model.pizzaStore[i].yelp_code;

    var parameters = {
        oauth_consumer_key: 'qutEa0DTMawXiFmnOEb41Q',
        oauth_token: 'vFRwvEtznjhipFwSjXdr7LsEFfArGE0q',
        oauth_nonce: nonce_generate(),
        oauth_timestamp: Math.floor(Date.now() / 1000),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0',
        callback: 'cb'
    };

    var encodedSignature = oauthSignature.generate('GET', yelp_URL, parameters, 'ysgxjLNiWjvRXqlbAjfqv2oL5Fg', 'XU8NxJ_vlejrThWh4nf22hS9tVA');
    parameters.oauth_signature = encodedSignature;
    var infoWindowData = {
        url: yelp_URL,
        data: parameters,
        cache: true,
        dataType: 'jsonp',
        success: function(results) {
            //Binds API results to model data
            model.pizzaStore[i].result = results;
            model.pizzaStore[i].phone = results.phone;
            model.pizzaStore[i].rating = results.rating_img_url;
            model.pizzaStore[i].review_count = results.review_count;
            model.pizzaStore[i].review = results.snippet_text;
        },
        error: function() {
            //Error call when API fails
            error();
        }
    };

    // Send AJAX query via jQuery library.
    $.ajax(infoWindowData);
};

// Pop up to indicate in case the API call fails
function error(){
  window.alert("The API callback has failed, please try again");
}

//Google Maps implementation
function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
              lat: 41.6723130,
              lng: -71.4969100
        },
        zoom: 12,
        mapTypeControl: false
    });
    
    //Sets the maximum width of the infowindow
    infowindow = new google.maps.InfoWindow({
        maxWidth: 350
    });
    
    //Yelp API call
    for (var i = 0; i < model.pizzaStore.length; i++) {
        oAuthCall(i);
    }
    
    //Binds knockout bindings to ViewModel
    var vm = new viewModel();
    ko.applyBindings(vm);
}

//Below is the viewModel data
var viewModel = function() {

    var self = this;
    self.filterText = ko.observable('');
    self.pizzaStore = ko.observableArray(model.pizzaStore);
    self.pizzaStore().forEach(function(store) {

        //Creates markers for each object in the self.pizzaStore observable array
        var marker = new google.maps.Marker({
            position: store.location,
            title: store.title,
            map: map,
            animation: google.maps.Animation.DROP,
        });

        //Assigns the marker info to store.marker
        store.marker = marker;

        var googleEvent = google.maps.event;

        //Sets the markers and title info on map using a closure
        googleEvent.addListener(marker, 'click', (function(marker, map, infowindow) {
            return function() {
                //Sets the content of the individual infowindows
                var contentString = '<h2 id="firstHeading" class="firstHeading">' + store.title + '</h2>' + '<h3 id="rating" class="rating">Rating:</h3>' + '<img src=' + store.rating + '>' + '<h3 id="reviews" class="reviews">Reviews:</h3>' + '<div id="bodyContent">' + store.review + '<br>' + '<h3 id="review_count" class="review_count">Review Count:</h3>' + '<div id="bodyContent">' + store.review_count + '<br>'+ '<h3 id="phone" class="phone">Phone:</h3>' + '<div id="bodyContent">' + store.phone + '<br>' + '<br>' + 'Information provided by Yelp' + '</div>';
                infowindow.setContent(contentString);
                infowindow.open(map, marker);

                //Animates google marker when clicked
                if (marker.getAnimation() !== null) {
                    marker.setAnimation(null);
                } else {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    stopAnimation(marker);
                }
            };
        })(marker, map, infowindow));

        //Animates the markers for a specified time
        function stopAnimation(marker) {
            setTimeout(function() {
                marker.setAnimation(null);
            }, 1000);
        }
    });

    //Provides the search functionality
    self.search = ko.computed(function() {
        var filterText = self.filterText().toLowerCase();
        if (!filterText) {
            //Uses a foreach function to set all markers as visible
            self.pizzaStore().forEach(function(store) {
                if (store.hasOwnProperty('marker')) {
                    store.marker.setVisible(true);
                }
            });
            return self.pizzaStore();
        } else {
            return ko.utils.arrayFilter(self.pizzaStore(), function(store) {
                //Searches through the store data and sets the markers that are visible that are applicable
                var match = store.title.toLowerCase().indexOf(filterText) !== -1;
                store.marker.setVisible(match);
                self.closeInfoWindow();
                return match;
            });
        }
    });

    //When user clicks on title in side-view, this will trigger the marker for that pizza store
    self.showMarker = function(store) {
        google.maps.event.trigger(store.marker, 'click');
    };
    
    //When user uses search box, infowindow closes
    self.closeInfoWindow = function() {
        infowindow.close();
    };
};