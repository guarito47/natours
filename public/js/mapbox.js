

//to recover data from the html #map is our element with the locations as string
// where data-locations = dataset.locations
//#map(data-locations=`${JSON.stringify(tour.locations)}`)
//then we pass to object usinf JSON.parse
//this 2 commented lines  will move to index.js that is the file to retrive data from the frontend 
//const locations = JSON.parse(document.getElementById('map').dataset.locations);
//console.log(locations);

export const displayMap= (locations)=>{
  mapboxgl.accessToken = 'pk.eyJ1IjoiZ3Vhcml0bzQ3IiwiYSI6ImNtY21sN3RxdDBreHAyaW9kMzU0dnR6cGgifQ.JnT02vbcmu7Ygb_DdCnbHA';
  const map = new mapboxgl.Map({
    container: 'map', // here will put the mapbox in container called 'map' in our html
    //  in our case tour.pug has this '#map(data-locations.....'
    style: 'mapbox://styles/guarito47/cmcmsm2sy00en01s002ov4q3j', // style URL
    scrollZoom: false
    //center: [-74.5, 40], // starting position [lng, lat]
    //zoom: 9, // starting zoom
  });

  const bounds= new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    //creating the marker 
    const el= document.createElement('div');
    el.className= 'marker';//the image of the green pin
  //adding the marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'//means that the edge/arrow part is where we defined a point/location
    }).setLngLat(loc.coordinates)
      .addTo(map);

    //adding the popup

    new mapboxgl.Popup({
      offset:30
    }).setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
  //extend the map to include the current location
    bounds.extend(loc.coordinates);
  });

  //is the method that executes the zooming and  the moving
  map.fitBounds(bounds, {
      padding:{
        top:200,
        bottom:150,
        left:100,
        right:100
      }
  });
};

