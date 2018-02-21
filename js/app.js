var map;
var markers = [];
/* defining foursquare data details */
const fsUrl = "https://api.foursquare.com/v2/venues/";
const fsClient_id = "020SLV0LCNDZDGDCI2WM5MIP2WMPNELFKTYNB1DELF3RAP4K";
const fsClient_secret = "JRHWQ3WRTRWE2PCUZSLHLC2ZBBD5GI51RHGUP5SJ5UZE0K30";
const fsVersion = new Date().toISOString().split('T')[0].replace(/-/g, '');

function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.3515321, lng: -122.0065343},
        zoom: 12
    });
    /* displaying the information on the marker */
    infowindow = new google.maps.InfoWindow();
    map.addListener('click', function(){
        infowindow.close();
    });
    /* for adding marker to the places */
    for(var i = 0; i < places.length; i++){
        Addmarker(places[i]);        
    }
}
/* Addmarker by getting place location details */
var Addmarker = function(place){
    var marker = new google.maps.Marker({
        position: place.location,
        map: map, 
        animation: google.maps.Animation.DROP
    });
/* markers array */
    markers.push({
        location: place.location,
        marker: marker,
    });

    google.maps.event.addListener(marker, 'click', function(){
        stopAnimation();
        startAnimation(place);
        showInfoWindow(place);
    });
};
/* shows the information of the marker */
var showInfoWindow = function(place) {
    const m = markers.find(item => item.location === place.location);
    let info = '<span class="salon-name">' + place.name + '</span>';
    if (place.image) info += '<img src=' + place.image + ' />';
    infowindow.setContent(info);
    infowindow.open(map, m.marker);
};
/* display all markers */
var displayAllMarkers = function() {
    markers.forEach(item => item.marker.setMap(map));
};
/* hide all markers */
var hideAllMarkers = function() {
    markers.forEach(item => item.marker.setMap(null));
};
/* display selected marker */
var displayMarker = function(place) {
    markers.forEach(item => {if (item.location === place.location) item.marker.setMap(map);});
};
/* starts animation */
var startAnimation = function(place){
    markers.forEach(item => {if (item.location === place.location) item.marker.setAnimation(google.maps.Animation.BOUNCE);});
};
/* stops animation */
var stopAnimation = function(place){
    markers.forEach(item => item.marker.setAnimation(null));
};
/* handling error for map and foursquare data */
var mapError = function() {
    document.getElementById('map-error').style.display = 'block';
    document.getElementById('map-error').innerHTML = 'Failed to load maps.';
};

var fsError = function() {
    document.getElementById('fs-error').style.display = 'block';
    document.getElementById('fs-error').innerHTML = 'Failed to load foursquare data.';
};

var model = function(){
    var self = this;    
    this.salons = ko.observableArray(places);
    this.filter = ko.observable();
    /* filters the places when searched */
    this.filteredsalons = ko.computed(function(){
        f = self.filter();
        if (!f) {
            displayAllMarkers();
            return places;
        } else {
            hideAllMarkers();
            return ko.utils.arrayFilter(places, function(place) {
                if (place.name.toLowerCase().indexOf(f) >= 0) {
                    displayMarker(place);
                    return place;
                }
            });
        }
    });
    this.showPlace = function(place){
        stopAnimation();
        startAnimation(place);
        showInfoWindow(place);
        
    };
    /* get location data from foursquare using ajax */
    this.fsdata = ko.computed(function(){
        self.salons().forEach(function(place){
            var fsdataUrl = fsUrl + place.place_id + '/?' + 'client_id=' + fsClient_id + '&client_secret=' + fsClient_secret + '&v=' + fsVersion;
            $.ajax({
                url: fsdataUrl,
                dataType: 'json',
                async: true
            }).done(function(data){
                place.image = data.response.venue.bestPhoto.prefix + "160x100" + data.response.venue.bestPhoto.suffix;
            }).fail(function(data){
                fsError();
            });            
        });
        
    });
};

ko.applyBindings(model);
