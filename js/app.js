
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

class Location {
    constructor(store) {
        this.title = store.title;
        this.yelp_code = store.yelp_code;
        this.marker = new google.maps.Marker({
            position: store.location,
            map: map,
            animation: google.maps.Animation.DROP,
        });
        this.marker.addListener('click', () => {
            // the "arrow" function creates a scopeless anonymous function,
            // kind of like function() {}
            // the benefit is that it is scopeless, so you don't need
            // var self = this
            this.showInfo();
        })
    }
    
        getYelpInfo() {
        function nonce_generate() {
            return (Math.floor(Math.random() * 1e12).toString());
        }

        var parameters = {
            oauth_consumer_key: 'qutEa0DTMawXiFmnOEb41Q',
            oauth_token: 'vFRwvEtznjhipFwSjXdr7LsEFfArGE0q',
            oauth_nonce: nonce_generate(),
            oauth_timestamp: Math.floor(Date.now() / 1000),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_version: '1.0',
            callback: 'cb'
        };

        var encodedSignature = oauthSignature.generate('GET', this.yelp_code, parameters, 'ysgxjLNiWjvRXqlbAjfqv2oL5Fg', 'XU8NxJ_vlejrThWh4nf22hS9tVA');
        parameters.oauth_signature = encodedSignature;

        $.ajax({
            url: this.yelp_code,
            data: parameters,
            cache: true,
            dataType: 'jsonp',
            timeout: 1000
        }).done((results) => {
            this.result = results;
            this.phone = results.phone;
            this.rating = results.rating_img_url;
            this.review_count = results.review_count;
            this.review = results.snippet_text;
            this.contentString = '<h2 id="firstHeading" class="firstHeading">' + this.title + '</h2>' + '<h3 id="rating" class="rating">Rating:</h3>' + '<img src=' + this.rating + '>' + '<h3 id="reviews" class="reviews">Reviews:</h3>' + '<div id="bodyContent">' + this.review + '<br>' + '<h3 id="review_count" class="review_count">Review Count:</h3>' + '<div id="bodyContent">' + this.review_count + '<br>'+ '<h3 id="phone" class="phone">Phone:</h3>' + '<div id="bodyContent">' + this.phone + '<br>' + '<br>' + 'Information provided by Yelp' + '</div>';
            //Incase API Call fails
        }).fail(() => {
            this.contentString = 'Yelp API Failed'
        }).always(() => {
            infowindow.setContent(this.contentString);
            infowindow.open(map, this.marker);
            this.bounce();
        });
    }

    bounce() {
        this.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => {
            this.marker.setAnimation(null);
        }, 1400)
    }

    showInfo() {
        this.getYelpInfo();
    }
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
        maxWidth: 500
    });

    var modelLength = model.pizzaStore.length;
    
    //Binds knockout bindings to ViewModel
    var vm = new viewModel();
    ko.applyBindings(vm);
}

//Below is the viewModel data
var viewModel = function() {

    var self = this;
    self.filterText = ko.observable('');
    self.pizzaStore = ko.observableArray();
    model.pizzaStore.forEach(function(store) {
      var s = new Location(store);
      self.pizzaStore.push(s);
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