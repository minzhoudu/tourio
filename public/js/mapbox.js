export const displayMap = (locations) => {
    mapboxgl.accessToken = "pk.eyJ1IjoibWluemhvdWR1IiwiYSI6ImNsZnU2cWJ3ZDAzbHczam53cjg3aGNwZWMifQ.X2YvpRRqywrRuGQ4k8EcyA";
    var map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/minzhoudu/clfub6dpj006101mzub0h2hz8",
        scrollZoom: false,
        // center: [-118.113491, 34.111745],
        // zoom: 6,
        // interactive: false,
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((loc) => {
        //Create marker
        const el = document.createElement("div");
        el.className = "marker";

        //Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: "bottom", //to set the bottom part of the pin img to the location
        })
            .setLngLat(loc.coordinates)
            .addTo(map);

        //Add popup
        new mapboxgl.Popup({ offset: 30 }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);

        //Extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 100,
            left: 100,
            right: 100,
        },
    });

    const nav = new mapboxgl.NavigationControl();
    map.addControl(nav, "top-right");
};
