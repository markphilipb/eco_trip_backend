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

const getDirections = (origin, destination, res) => {
  var newOrigin = origin.split(" ").join("+");
  var newDest = destination.split(" ").join("+");
  const client = new Client();
  //      destination: { lat: 41.43206, lng: -81.38992 }, "24+Sussex+Drive+Ottawa+ON"
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
      //console.log(resp);
      ret = resp;
      // res.send(resp);
    })
    .catch(function (error) {
      console.log(error);
    });

  return ret;
};

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
      //console.log(resp);
      ret = resp;
      // res.send(resp);
    })
    .catch(function (error) {
      console.log(error);
    });

  return ret;
};

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
      //console.log(resp);
      ret = resp;
      //res.send(response);
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
