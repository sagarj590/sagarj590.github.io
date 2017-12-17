// First we need an array of models.
var model = [
  {
    name: "Starbucks",
		lat: 18.5308,
		lng: 73.8475,
		show: true,
		selected: false,
		venueid: "5290642411d2d81221df8c80"
  },
  {
    name: "Incognito",
		lat: 18.5789,
		lng: 73.7707,
		show: true,
		selected: false,
		venueid: "54cf72e0498ed86c57eb5e56"
  },
  {
    name: "Hard Rock Cafe",
		lat: 18.53,
		lng: 73.8940,
		show: true,
		selected: false,
		venueid: "4b8406ccf964a520f11b31e3"
  },
  {
    name: "Barbeque Nation",
		lat: 18.5523,
		lng: 73.9016,
		show: true,
		selected: false,
		venueid: "4b66bcedf964a5202b292be3"
  },
  {
    name: "Vaishali Cafe",
		lat: 18.5529,
		lng: 73.8516,
		show: true,
		selected: false,
		venueid: "4c14d78ba9c220a15e1c589d"
  },
  {
    name: "Pachami Veg Restaurant",
		lat: 18.4718,
		lng: 73.8761,
		show: true,
		selected: false,
		venueid: "4d454d6bbf61a1cd53fb11ac"
  },
];

// View Model
var viewModel = function() {
  var self = this;
  self.errorDisplay = ko.observable('');

// Set markers and foursquare venue-id's for models list and only the selected marker and
// will open it's respective infoWindow.
  self.mapList = [];
  model.forEach(function(marker){
    self.mapList.push(new google.maps.Marker({
      position: {lat: marker.lat, lng: marker.lng},
      map: map,
      name: marker.name,
      show: ko.observable(marker.show),  
      selected: ko.observable(marker.selected),
      venueid: marker.venueid, 
      animation: google.maps.Animation.DROP
    }));
  });

  // Set the mapList length.
  self.mapListLength = self.mapList.length;

  // Set current map as first map.
  self.currentMapItem = self.mapList[0];

  // Animation that makes the marker bounce and stop after 5sec.
  self.makeBounce = function(marker){
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ marker.setAnimation(null);}, 500);
  };

  // Function to add API information to each marker and setting up Foursquare credentials.
  self.addApiInfo = function(passedMapMarker){
      $.ajax({
        url: "https://api.foursquare.com/v2/venues/" + passedMapMarker.venueid +'?client_id=KDAY3HWAHCH2XCRGG3DJHWEYGVALZUT0IT2NCFQGVPMRJOEL&client_secret=O2WEWFENJBQKUFR12PFJLMUV520XYOS5BZQBIOLQWOY1TA0J&v=20171412',
        dataType: "json",
        success: function(data){
          // Stores the results that shows likes and ratings.
          var result = data.response.venue;

          // Add likes and ratings to marker.
          passedMapMarker.likes = result.hasOwnProperty('likes') ? result.likes.summary: "";
          passedMapMarker.rating = result.hasOwnProperty('rating') ? result.rating: "";
        },
        // Else display error in receiving Foursquare data.
        error: function(e) {
          self.errorDisplay("Error while displaying Foursquare data. Please try again.");
        }
      });
  };

// Loop through the Map List and add Marker event listener on clicking and markers show Foursquare API information.
  for (var i=0; i < self.mapListLength; i++){
    (function(passedMapMarker){
		
//add API information to each mapMarker.
			self.addApiInfo(passedMapMarker);
			
//add the event listener to every mapMarker.
			passedMapMarker.addListener('click', function(){
				
//set this mapMarker to the "selected" state
				self.setSelected(passedMapMarker);
			});
		})(self.mapList[i]);
  }

  // Create a filter for filtering text.
  self.filterText = ko.observable('');


  // Apply the filter.
  self.applyFilter = function() {

    var currentFilter = self.filterText();
    infowindow.close();

// This filters the list for user search by typing name of the place.
    if (currentFilter.length === 0) {
			self.setAllShow(true);
		} else {
			for (var i = 0; i < self.mapListLength; i++) {
				if (self.mapList[i].name.toLowerCase().indexOf(currentFilter.toLowerCase()) > -1) {
					self.mapList[i].show(true);
					self.mapList[i].setVisible(true);
				} else {
					self.mapList[i].show(false);
					self.mapList[i].setVisible(false);
				}
			}
    }
    infowindow.close();
  };

// This makes all of the markers visible to us.
  self.setAllShow = function(showVar) {
    for (var i = 0; i < self.mapListLength; i++) {
      self.mapList[i].show(showVar);
      self.mapList[i].setVisible(showVar);
    }
  };

  self.setAllUnselected = function() {
		for (var i = 0; i < self.mapListLength; i++) {
			self.mapList[i].selected(false);
		}
	};

  self.setSelected = function(location) {
		self.setAllUnselected();
        location.selected(true);

        self.currentMapItem = location;
// Function that displays 'likes' using Foursquare data. 
        formattedLikes = function() {
        	if (self.currentMapItem.likes === "" || self.currentMapItem.likes === undefined) {
        		return "No likes to display";
        	} else {
        		return "Location has " + self.currentMapItem.likes;
        	}
        };
// Function that displays 'ratings' using Foursquare data.
        formattedRating = function() {
        	if (self.currentMapItem.rating === "" || self.currentMapItem.rating === undefined) {
        		return "No ratings to display.";
        	} else {
        		return "This place is rated " + self.currentMapItem.rating;
        	}
        };

// Info Window displaying Foursquare data.
        var formattedInfoWindow = "<h5>" + self.currentMapItem.name + "</h5>" + "<div>" + formattedLikes() + "</div>" + "<div>" + formattedRating() + "</div>";

		infowindow.setContent(formattedInfoWindow);

        infowindow.open(map, location);
        self.makeBounce(location);
	};
};

// Google Map error handling function
googleError = function() {
  alert("There was an error while loading Google Maps!")
};
