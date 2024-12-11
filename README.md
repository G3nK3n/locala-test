**React Technical Test (Mapbox, Web Workers, TypeScript)**

My attempt on building an interactive map application with Mapbox, web workers, and TypeScript.

Instructions
- Initialize the project:
  - ✅ Successfully added Mapbox to your project and centered the map on Paris.
- Display the map:
  - ✅ Displayed points using the provided GeoJSON data (Currently in comment for now).
- Interaction:
  - ✅ Added the "Afficher les points visibles" button and implemented functionality to list visible points using queryRenderedFeatures.
- Web Workers:
  - ✅ Successfully used a web worker to filter points with latitude greater than 48.8534 before adding them to the map.

Bonus: 
  - ✅ Highlighting points on the map when clicking their name in the list.
  - ❌ Unit test not completed

**Challenges that I have faced**
- First challenge was to fetch the points.geojson data. At first I have tried to import normaly, but it does not recognize the .geojson type. So I did reasearch and saw that you can fetch it if you can move it to the public folder (https://stackoverflow.com/questions/68927525/how-to-fetch-public-folder-json-file-into-react-component).
- Second challenged faced was getting the coordinates from the features after using the queryRenderedFeatures function. When I saw the console, I did see the _geometry property, but I could not access it. After researching in google, I learned that the type GeoJSONFeature doesn’t automatically recognize specific geometry types, such as Point. To access the coordinates, I had to first check the geometry type (ex: Point) before attempting to retrieve the coordinates. Of course, I could have use the 'any' type, but that would break the TypeScript rule. (https://stackoverflow.com/questions/55621480/cant-access-coordinates-member-of-geojson-feature-collection)
- The third challenge that I have faced was getting the path of the worker file. I had an issue where my worker file was not listening and doing the logic in the file. That is when I realized that it is not retrieving the worker file. After some research, I have learned that I could get the path in the public folder because of static URL. If outside the public folder, I needed to access it using another methods, like Blob (never used it). So I just moved the file to the public folder and create a new instance of the worker file like this: const worker = new Worker("/filterPointsWorker.js"). This then worked and the worker file worked perfectly and managed to filter the points from the data file. (https://stackoverflow.com/questions/61332848/js-cannot-load-web-worker-module-unless-the-worker-js-is-under-public/71602396)
