mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: museum.geometry.coordinates, // starting position [lng, lat]
    zoom: 13// starting zoom
});

map.addControl(new mapboxgl.NavigationControl());
const marker = new mapboxgl.Marker()
    .setLngLat(museum.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 30 })
            .setHTML(
                `<h2>${museum.title}</h2>`
            )
    )
    .addTo(map);