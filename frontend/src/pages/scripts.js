let mapOptions={
    center:[10.759765, 106.681605],
    zoom:10
}

let map = new L.map('map',mapOptions);
let layer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
map.addLayer(layer)
let marker = new L.Marker([10.762622, 106.660172]);
let marker2 = new L.Marker([15, 106.660172]);

marker.addTo(map);
marker2.addTo(map);