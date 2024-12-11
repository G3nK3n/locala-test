import React, { useRef, useEffect, useState } from "react";
import mapboxgl, {GeoJSONFeature} from "mapbox-gl";
import { Feature, FeatureCollection } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";


export const App: React.FC = () => {
  const mapRef = useRef<mapboxgl.Map | null>(null); // Used a useRef for the mapRef, to keep a reference to the map instance without recreating it on every render.
  const mapContainerRef = useRef<HTMLDivElement>(null); // This refers to the map container div
  const [queryRender, setQueryRedner] = useState<GeoJSONFeature[] | undefined>([]); //Sets the queryRender as type GeoJSONFeature, since its returns an array of feature objects
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | undefined>(undefined); //Sets the Geojasondata as FeatureCollection, since that is the type (from file itself)
  const [clickedLink, setClickedLink] = useState<Feature | undefined>(undefined)

  const worker = new Worker("/filterPointsWorker.js") //Could get the filterPointsWorker path in public because of static URL access. If outside public folder, it is not accessible via static URL(Blob)

  //Had to to use fetch because I placed the 'points.geojson' file in public folder
  useEffect(() => {
    fetch('/points.geojson')
    .then((response) => response.json())
    .then((data) => {
      setGeoJsonData(data)
    });
    
  }, [])

  //This useEffect will set up the map, as well as calling the worker to filter the points from the data file
  useEffect(() => {

    mapboxgl.accessToken = 'pk.eyJ1IjoibGVvbi1zaWxkYW5vIiwiYSI6ImNtNGEyNzQ5ZDAzYmMycXNlMWJkZXdrMHYifQ.0oYgZpwnkEsc_r1XGlXCYw';
    if (mapContainerRef.current) {
      // Initialize the Mapbox map
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current, // This passes the container element to the div (see the return)
        style: "mapbox://styles/mapbox/standard-satellite", // Example map style from https://docs.mapbox.com/api/maps/styles/
        center: [2.349014 ,48.864716], // Coordinates for paris with coordinates[lng, lat]
        zoom: 9, // Example zoom level
      });
    }

    
    if (geoJsonData) {
      //This make sures that the the worker only receives the message when the map is ready, removing the 'style loading' error
      mapRef.current?.on('load', () => {
        worker.postMessage(geoJsonData); // Send the data to the worker
      })

    } else {
      console.log("GeoJSON data is not loaded yet");
    }
    
    if (mapRef.current) {
      
        if (geoJsonData && geoJsonData.features) {
          
          //The worker returns the data after filtering
          worker.onmessage = (e) => {
            const {filteredPoints} = e.data;
  
            // Adding filtered points to the map
            mapRef.current?.addSource('filtered-points', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: filteredPoints, // Use the filtered points here
                // features: geoJsonData.features //This is for step#2
              },
            });
  
            //The style of the circle on the map
            mapRef.current?.addLayer({
              id: 'filtered-layer',
              type: 'circle',
              source: 'filtered-points',
              paint: {
                'circle-radius': 6,
                'circle-color': 'blue',
              },
            });
          };
        }
      
    }
    
    
    

    return () => {
      // Clean up the map instance on unmount
      mapRef.current?.remove();
    };
  }, [geoJsonData]);

  //This useEffect will highlight the point in the map when clicked on the list
  useEffect(() => {
    if(mapRef.current) {
      if(clickedLink) {
        const clickedPopup = new mapboxgl.Popup({'focusAfterOpen': true})
        
        if(clickedLink.geometry.type === 'Point') {
          console.log(clickedLink.geometry)
          clickedPopup.setLngLat([clickedLink.geometry.coordinates[0], clickedLink.geometry.coordinates[1]])
          clickedPopup.setHTML(clickedLink.properties?.name)
          clickedPopup.addTo(mapRef.current)
        }
      }
    }
    
  }, [clickedLink])

  //This will create the list once the button is clicked
  const showVisiblePointsData = () => {
    const thePoints = mapRef.current?.queryRenderedFeatures({layers: ['filtered-layer']})
    setQueryRedner(thePoints)
    console.log('The data: ', thePoints)
  }

  return (
    <>
      <button onClick={showVisiblePointsData} style={{position: 'absolute', zIndex: '1', marginTop: '10px', marginLeft: '10px'}}>Afficher les points visibles</button>
      <div
        id="map-container"
        ref={mapContainerRef}
        style={{ height: "50vh", width: "100%" }} // From tutorial, made height to be able to show the map
      />
      <div style={{textAlign: 'center', marginTop: '40px'}}>
        <h1>The list</h1>
        {queryRender ? (
          //Renders a list of points after queryRender
          queryRender.map((features, index) => (
            <div key={index} style={{display: 'inline-block', padding: '20px', border: '1px solid'}}>
              <p 
                onClick={() => {
                  setClickedLink(features)
                }}
                style={{ cursor: 'pointer'}}
                >
                  <b>Name: <u><i>{features.properties?.name}</i></u></b>
              </p>
              <p style={{fontSize: '14px'}}><b>Coordinates:</b> {features.geometry.type === 'Point' ? ('[' + features.geometry.coordinates[0] + " , " + features.geometry.coordinates[1] + ']') : ""}</p>
            </div>
          ))
        )
        : <h2>Nothing</h2>}
      </div>
    </>
  );
};
