require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
var axios = require("axios");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

const port = process.env.PORT || 8082;

const { Client } = require("@googlemaps/google-maps-services-js");


/**
 * @param  {string} origin
 * @param  {string} destination
 * @param  {} res
 * getDirections will take origin and destination and respond with directions data from mapbox directions api call
 */
const getDirections = (origin, destination, res) => {
  var newOrigin = origin.split(" ").join("+");
  var newDest = destination.split(" ").join("+");
  const client = new Client();
  client
    .directions({
      params: {
        origin: origin,
        destination: destination,
        key: process.env.GOOGLE_DIRECTIONS_KEY,
      },
    })
    .then(({ data }) => {
      console.log("backend", data);
      res.send(data);
    })
    .catch((e) => {
      console.log(e);
    });
};


/**
 * @param  {string} origin
 * @param  {} res
 *
 * getOriginGeocode takes the address as a string and makes an call to 
 * mapbox geocode api for long and lat coordinates of that location.
 * The response long and lat coords will be passed as origin to {@link getDirections}
 */
const getOriginGeocode = async (origin, res) => {
  var newOrigin = origin.split("+").join("%20");
  var urlreq =
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
    newOrigin +
    ".json?" +
    "access_token=" +
    process.env.MAP_BOX_GEOCODE_KEY;
  var ret = null;
  var data = await axios
    .get(urlreq)
    .then(function (response) {
      var resp = response.data;
      ret = resp;
    })
    .catch(function (error) {
      console.log(error);
    });

  return ret;
};


/**
 * @param  {string} dest
 * @param  {} res
 *
 * getDestGeocode takes the address as a string and makes an call to 
 * mapbox geocode api for long and lat coordinates of that location.
 * The response long and lat coords will be passed as origin to {@link getDirections}
 */
const getDestGeocode = async (dest, res) => {
  var newDest = dest.split("+").join("%20");
  var urlreq =
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
    newDest +
    ".json?" +
    "limit=1&" +
    "access_token=" +
    process.env.MAP_BOX_GEOCODE_KEY;
  var ret = null;
  var data = await axios
    .get(urlreq)
    .then(function (response) {
      var resp = response.data;
      ret = resp;
    })
    .catch(function (error) {
      console.log(error);
    });

  return ret;
};


/**
 * @param  {string} origin
 * @param  {string} dest
 * @param  {} res
 * 
 * getMapDirections returns the directions object from mapbox directions api
 */
const getMapDirections = async (origin, dest, res) => {
  originCords = origin[0] + "," + origin[1];
  destCords = dest[0] + "," + dest[1];
  var urlreq =
    "https://api.mapbox.com/directions/v5/mapbox/driving/" +
    originCords +
    ";" +
    destCords +
    "?geometries=geojson&annotations=speed&steps=true&access_token=" +
    process.env.MAP_BOX_GEOCODE_KEY;
  var ret = null;
  var data = await axios
    .get(urlreq)
    .then(function (response) {
      var resp = response;
      ret = resp;
    })
    .catch(function (error) {
      console.log(error);
    });

  return ret;
};

//setTimeout(() => {
app.get("/submit/:origin/:destination", async function (req, res) {
  //var test = getDirections(req.params.origin, req.params.destination, res);
  var origin = await getOriginGeocode(req.params.origin, res);
  var dest = await getDestGeocode(req.params.destination, res);
  //console.log("dest", dest.features[0].geometry.coordinates);
  var originCord = origin.features[0].geometry.coordinates;
  var destCord = dest.features[0].geometry.coordinates;
  var directionsResult = await getMapDirections(originCord, destCord, res);
  //console.log("directions", directionsResult);
  res.send(directionsResult.data);
});

//}, 200);

app.listen(port, () => console.log(`Server running on port ${port}`));
