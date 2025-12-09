// Configuration
const CONFIG = {
   GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzV6OTsUlNu-tQRUIImwmBZBsFuy6crIAZizyy5fNONikJQukwTcCFT9bEHYTMZT1gk/exec',
    HOME_BASE: 'Vilkaviškis, Lithuania',
    HOME_BASE_COORDS: [54.6517, 23.0355]
};

// Global variables
let map, marker, selectedLocation = null;
let pastConcertMarkers = [];
let routeLine = null;
let homeMarker = null;
let autocompleteTimeout = null;
let currentSearchRequest = null;
let searchCache = new Map();
let miniMap = null;
let distanceLabel = null;

// Top 50+ Lithuanian cities with regions (always show city name, not districts)
const majorLithuanianCities = [
    {name: 'Vilnius', region: 'Vilniaus apskritis', lat: 54.6872, lng: 25.2797},
    {name: 'Kaunas', region: 'Kauno apskritis', lat: 54.8985, lng: 23.9036},
    {name: 'Klaipėda', region: 'Klaipėdos apskritis', lat: 55.7033, lng: 21.1443},
    {name: 'Šiauliai', region: 'Šiaulių apskritis', lat: 55.9349, lng: 23.3136},
    {name: 'Panevėžys', region: 'Panevėžio apskritis', lat: 55.7348, lng: 24.3575},
    {name: 'Alytus', region: 'Alytaus apskritis', lat: 54.3963, lng: 24.0458},
    {name: 'Marijampolė', region: 'Marijampolės apskritis', lat: 54.5593, lng: 23.3540},
    {name: 'Mažeikiai', region: 'Telšių apskritis', lat: 56.3094, lng: 22.3414},
    {name: 'Jonava', region: 'Kauno apskritis', lat: 55.0722, lng: 24.2797},
    {name: 'Utena', region: 'Utenos apskritis', lat: 55.4978, lng: 25.5997},
    {name: 'Kėdainiai', region: 'Kauno apskritis', lat: 55.2894, lng: 23.9747},
    {name: 'Telšiai', region: 'Telšių apskritis', lat: 55.9814, lng: 22.2472},
    {name: 'Tauragė', region: 'Tauragės apskritis', lat: 55.2508, lng: 22.2906},
    {name: 'Ukmergė', region: 'Vilniaus apskritis', lat: 55.2467, lng: 24.7561},
    {name: 'Visaginas', region: 'Utenos apskritis', lat: 55.5939, lng: 26.4425},
    {name: 'Plungė', region: 'Telšių apskritis', lat: 55.9117, lng: 21.8453},
    {name: 'Kretinga', region: 'Klaipėdos apskritis', lat: 55.8894, lng: 21.2442},
    {name: 'Palanga', region: 'Klaipėdos apskritis', lat: 55.9175, lng: 21.0678},
    {name: 'Radviliškis', region: 'Šiaulių apskritis', lat: 55.8111, lng: 23.5458},
    {name: 'Druskininkai', region: 'Alytaus apskritis', lat: 54.0186, lng: 23.9722},
    {name: 'Rokiškis', region: 'Panevėžio apskritis', lat: 55.9636, lng: 25.5881},
    {name: 'Biržai', region: 'Panevėžio apskritis', lat: 56.2014, lng: 24.7564},
    {name: 'Gargždai', region: 'Klaipėdos apskritis', lat: 55.7167, lng: 21.4000},
    {name: 'Kuršėnai', region: 'Šiaulių apskritis', lat: 56.0053, lng: 22.9306},
    {name: 'Elektrėnai', region: 'Vilniaus apskritis', lat: 54.7836, lng: 24.6711},
    {name: 'Jurbarkas', region: 'Tauragės apskritis', lat: 55.0783, lng: 22.7658},
    {name: 'Vilkaviškis', region: 'Marijampolės apskritis', lat: 54.6517, lng: 23.0355},
    {name: 'Raseiniai', region: 'Kauno apskritis', lat: 55.3758, lng: 23.1153},
    {name: 'Anykščiai', region: 'Utenos apskritis', lat: 55.5267, lng: 25.1036},
    {name: 'Lentvaris', region: 'Vilniaus apskritis', lat: 54.6439, lng: 25.0528},
    {name: 'Prienai', region: 'Kauno apskritis', lat: 54.6336, lng: 23.9489},
    {name: 'Joniškis', region: 'Šiaulių apskritis', lat: 56.2397, lng: 23.6161},
    {name: 'Kelmė', region: 'Šiaulių apskritis', lat: 55.6303, lng: 22.9311},
    {name: 'Varėna', region: 'Alytaus apskritis', lat: 54.2200, lng: 24.5772},
    {name: 'Kaišiadorys', region: 'Kauno apskritis', lat: 54.8619, lng: 24.4525},
    {name: 'Pasvalys', region: 'Panevėžio apskritis', lat: 56.0586, lng: 24.3989},
    {name: 'Kupiškis', region: 'Panevėžio apskritis', lat: 55.8422, lng: 24.9761},
    {name: 'Zarasai', region: 'Utenos apskritis', lat: 55.7311, lng: 26.2464},
    {name: 'Skuodas', region: 'Klaipėdos apskritis', lat: 56.2692, lng: 21.5244},
    {name: 'Širvintos', region: 'Vilniaus apskritis', lat: 55.0461, lng: 24.9547},
    {name: 'Molėtai', region: 'Utenos apskritis', lat: 55.2289, lng: 25.4178},
    {name: 'Šakiai', region: 'Marijampolės apskritis', lat: 54.9553, lng: 23.0458},
    {name: 'Šalčininkai', region: 'Vilniaus apskritis', lat: 54.3097, lng: 25.3856},
    {name: 'Naujoji Akmenė', region: 'Šiaulių apskritis', lat: 56.3167, lng: 22.9000},
    {name: 'Šilutė', region: 'Klaipėdos apskritis', lat: 55.3503, lng: 21.4661},
    {name: 'Rietavas', region: 'Telšių apskritis', lat: 55.7239, lng: 21.9319},
    {name: 'Švenčionys', region: 'Vilniaus apskritis', lat: 55.1336, lng: 26.1569},
    {name: 'Pakruojis', region: 'Šiaulių apskritis', lat: 56.0742, lng: 23.9383},
    {name: 'Ignalina', region: 'Utenos apskritis', lat: 55.3453, lng: 26.1672},
    {name: 'Šilalė', region: 'Tauragės apskritis', lat: 55.4917, lng: 22.1881},
    {name: 'Pagėgiai', region: 'Tauragės apskritis', lat: 55.1353, lng: 21.9064},
    {name: 'Kazlų Rūda', region: 'Marijampolės apskritis', lat: 54.7492, lng: 23.4903},
    {name: 'Trakai', region: 'Vilniaus apskritis', lat: 54.6378, lng: 24.9347}
];

// Lithuanian keyboard layout mappings
const keyboardMap = {
    '1': 'ą', '2': 'č', '3': 'ę', '4': 'ė', '5': 'į',
    '6': 'š', '7': 'ų', '8': 'ū',
    '!': 'Ą', '@': 'Č', '#': 'Ę', '$': 'Ė', '%': 'Į',
    '^': 'Š', '&': 'Ų', '*': 'Ū'
};

// Character normalization for search
const charNormalizationMap = {
    'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i',
    'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z',
    'Ą': 'A', 'Č': 'C', 'Ę': 'E', 'Ė': 'E', 'Į': 'I',
    'Š': 'S', 'Ų': 'U', 'Ū': 'U', 'Ž': 'Z'
};

// Random success messages
const successMessages = [
    '✅ Galime!',
    '✅ Puiku!',
    '✅ Turime vietą!',
    '✅ Šis laikas laisvas!'
];

// Bilingual database for Polish and Latvian cities
const bilingualCities = [
    {lt: 'Seinai', pl: 'Sejny', lat: 54.1096, lng: 23.1496, country: 'pl'},
    {lt: 'Suvalkai', pl: 'Suwałki', lat: 54.1115, lng: 22.9308, country: 'pl'},
    {lt: 'Punskas', pl: 'Puńsk', lat: 54.2500, lng: 23.1833, country: 'pl'},
    {lt: 'Augustavas', pl: 'Augustów', lat: 53.8433, lng: 22.9800, country: 'pl'},
    {lt: 'Elkas', pl: 'Ełk', lat: 53.8275, lng: 22.3608, country: 'pl'},
    {lt: 'Gižyckas', pl: 'Giżycko', lat: 54.0394, lng: 21.7664, country: 'pl'},
    {lt: 'Baltstogė', pl: 'Białystok', lat: 53.1325, lng: 23.1688, country: 'pl'},
    {lv: 'Rīga', lt: 'Ryga', lat: 56.9496, lng: 24.1052, country: 'lv'},
    {lv: 'Daugavpils', lt: 'Daugpilis', lat: 55.8747, lng: 26.5362, country: 'lv'},
    {lv: 'Liepāja', lt: 'Liepoja', lat: 56.5046, lng: 21.0110, country: 'lv'},
    {lv: 'Jelgava', lt: 'Jelgava', lat: 56.6500, lng: 23.7294, country: 'lv'},
    {lv: 'Jūrmala', lt: 'Jurmala', lat: 56.9680, lng: 23.7703, country: 'lv'},
    {lv: 'Ventspils', lt: 'Ventspilis', lat: 57.3949, lng: 21.5648, country: 'lv'},
    {lv: 'Rēzekne', lt: 'Rezekne', lat: 56.5104, lng: 27.3330, country: 'lv'},
    {lv: 'Valmiera', lt: 'Valmiera', lat: 57.5381, lng: 25.4264, country: 'lv'},
    {lv: 'Jēkabpils', lt: 'Jekabpilis', lat: 56.4991, lng: 25.8778, country: 'lv'},
    {lv: 'Ogre', lt: 'Ogre', lat: 56.8162, lng: 24.6042, country: 'lv'}
];

// Quick zoom locations - REMOVED per user request
// const quickZoomLocations = [];

// Helper functions
function getRandomSuccessMessage() {
    return successMessages[Math.floor(Math.random() * successMessages.length)];
}

function normalizeSearchQuery(query) {
    let normalized = query;
    
    for (let [key, value] of Object.entries(keyboardMap)) {
        normalized = normalized.split(key).join(value);
    }
    
    let fuzzy = normalized;
    for (let [key, value] of Object.entries(charNormalizationMap)) {
        fuzzy = fuzzy.split(key).join(value);
    }
    
    return { original: normalized, fuzzy: fuzzy.toLowerCase() };
}

function isMajorCity(lat, lng) {
    const threshold = 0.1;
    for (let city of majorLithuanianCities) {
        const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2));
        if (distance < threshold) {
            return city.name;
        }
    }
    return null;
}

function smartRoundPrice(price) {
    let rounded = Math.round(price);
    const lastDigit = rounded % 10;
    
    if (lastDigit >= 1 && lastDigit <= 4) {
        rounded = rounded - lastDigit;
    } else if (lastDigit >= 6 && lastDigit <= 8) {
        rounded = rounded - lastDigit + 5;
    }
    
    return rounded;
}

function sanitizeInput(input) {
    return input.replace(/[<>\"\']/g, '');
}

// Map initialization
function initMap() {
    try {
        // Quick zoom buttons removed per user request
        const buttonsContainer = document.getElementById('quickZoomButtons');
        if (buttonsContainer) {
            buttonsContainer.style.display = 'none'; // Hide the container
        }

        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('Map element not found');
            return;
        }

        map = L.map('map').setView([55.1694, 23.8813], 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        const homeIcon = L.divIcon({
            html: '<div style="font-size: 24px;">🏠</div>',
            className: 'home-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        homeMarker = L.marker(CONFIG.HOME_BASE_COORDS, { icon: homeIcon }).addTo(map);
        homeMarker.bindPopup('<strong>Baze: Vilkaviškis</strong>');

        marker = L.marker([55.1694, 23.8813], { draggable: true });

        map.on('click', function(e) {
            checkLocationCountry(e.latlng, function(isValid) {
                if (!isValid) {
                    alert('⚠️ Galite pasirinkti tik Lietuvos, Latvijos arba Lenkijos (Podlaskio ir Warmijos-Mazūrų vaivadijos) vietą.');
                    return;
                }
                
                checkIfWater(e.latlng, function(isWater) {
                    if (isWater) {
                        alert('⚠️ Negalima pasirinkti vandens telkinio. Prašome pasirinkti sausumos vietą.');
                        return;
                    }
                    setLocation(e.latlng, null);
                    reverseGeocode(e.latlng);
                });
            });
        });

        marker.on('dragend', function(e) {
            const position = marker.getLatLng();
            checkLocationCountry(position, function(isValid) {
                if (!isValid) {
                    alert('⚠️ Galite pasirinkti tik Lietuvos, Latvijos arba Lenkijos (Podlaskio ir Warmijos-Mazūrų vaivadijos) vietą.');
                    marker.setLatLng(selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : CONFIG.HOME_BASE_COORDS);
                    return;
                }
                
                checkIfWater(position, function(isWater) {
                    if (isWater) {
                        alert('⚠️ Negalima pasirinkti vandens telkinio. Prašome pasirinkti sausumos vietą.');
                        marker.setLatLng(selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : CONFIG.HOME_BASE_COORDS);
                        return;
                    }
                    reverseGeocode(position);
                });
            });
        });

        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', handleSearchInput);
            searchInput.addEventListener('focus', handleSearchInput);
        }

        document.addEventListener('click', function(e) {
            if (!e.target.closest('#search') && !e.target.closest('#autocompleteDropdown')) {
                document.getElementById('autocompleteDropdown').style.display = 'none';
            }
        });

        loadPastConcerts();
        createMinimap();
        
        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error in initMap:', error);
        throw error;
    }
}

function createMinimap() {
    const minimapContainer = document.createElement('div');
    minimapContainer.className = 'minimap-container';
    minimapContainer.id = 'minimapContainer';
    document.getElementById('map').appendChild(minimapContainer);

    miniMap = L.map('minimapContainer', {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false
    }).setView([55.1694, 23.8813], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 8
    }).addTo(miniMap);

    const viewRect = L.rectangle([[0, 0], [0, 0]], {
        color: '#FF0000',
        weight: 2,
        fillOpacity: 0.1
    }).addTo(miniMap);

    map.on('move zoom', function() {
        const bounds = map.getBounds();
        viewRect.setBounds(bounds);
        miniMap.setView(map.getCenter(), 6);
    });
}

function quickZoom(lat, lng, zoom) {
    map.setView([lat, lng], zoom);
}

function setLocation(latlng, address) {
    selectedLocation = {
        lat: latlng.lat,
        lng: latlng.lng,
        address: address
    };
    
    marker.setLatLng(latlng).addTo(map);
    map.setView(latlng, 12);
    
    document.getElementById('selectedLat').value = latlng.lat;
    document.getElementById('selectedLng').value = latlng.lng;
    
    if (address) {
        document.getElementById('selectedAddress').value = address;
        document.getElementById('search').value = address.split(',')[0];
    }

    updateRouteOnMap(latlng);
}

async function updateRouteOnMap(destinationLatLng) {
    if (routeLine) {
        map.removeLayer(routeLine);
    }
    
    if (distanceLabel) {
        map.removeLayer(distanceLabel);
    }

    const startCoords = CONFIG.HOME_BASE_COORDS;

    try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${destinationLatLng.lng},${destinationLatLng.lat}?overview=full&geometries=geojson`);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            const distanceKm = (data.routes[0].distance / 1000).toFixed(0);
            
            routeLine = L.polyline(coords, {
                color: '#FF0000',
                weight: 12,
                opacity: 0.8
            }).addTo(map);

            // Add distance label in the middle of the route
            const midPointIndex = Math.floor(coords.length / 2);
            const midPoint = coords[midPointIndex];
            
            const distanceIcon = L.divIcon({
                html: `<div style="background: white; padding: 8px 12px; border-radius: 8px; font-weight: bold; color: #333; box-shadow: 0 2px 8px rgba(0,0,0,0.3); white-space: nowrap;">${distanceKm}km</div>`,
                className: 'distance-label',
                iconSize: [80, 30],
                iconAnchor: [40, 15]
            });
            
            distanceLabel = L.marker(midPoint, { icon: distanceIcon }).addTo(map);

            const bounds = L.latLngBounds([startCoords, [destinationLatLng.lat, destinationLatLng.lng]]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    } catch (error) {
        console.error('Error drawing route:', error);
        routeLine = L.polyline([startCoords, [destinationLatLng.lat, destinationLatLng.lng]], {
            color: '#FF0000',
            weight: 12,
            opacity: 0.8
        }).addTo(map);
    }
}

// Search functionality
function handleSearchInput(e) {
    const query = e.target.value.trim();
    clearTimeout(autocompleteTimeout);

    if (query.length < 2) {
        document.getElementById('autocompleteDropdown').style.display = 'none';
        return;
    }

    const dropdown = document.getElementById('autocompleteDropdown');
    dropdown.innerHTML = '<div class="autocomplete-item" style="text-align: center; color: #FFD700;">⏳ Ieškoma...</div>';
    dropdown.style.display = 'block';

    if (currentSearchRequest) {
        currentSearchRequest.abort();
    }

    autocompleteTimeout = setTimeout(async () => {
        const normalized = normalizeSearchQuery(query);
        const cacheKey = normalized.fuzzy;
        
        if (searchCache.has(cacheKey)) {
            showAutocomplete(searchCache.get(cacheKey));
            return;
        }

        // Search in major Lithuanian cities first (local database)
        const majorCityResults = majorLithuanianCities.filter(city => {
            const cityNorm = normalizeSearchQuery(city.name).fuzzy;
            return cityNorm.includes(normalized.fuzzy);
        }).map(city => ({
            name: city.name + ', ' + city.region,
            fullName: city.name + ', ' + city.region + ', Lietuva',
            lat: city.lat,
            lon: city.lng,
            isLocal: true
        }));

        // Search in bilingual database
        const localResults = bilingualCities.filter(city => {
            const searchStr = normalized.fuzzy;
            const ltNorm = normalizeSearchQuery(city.lt || '').fuzzy;
            const plNorm = city.pl ? normalizeSearchQuery(city.pl).fuzzy : '';
            const lvNorm = city.lv ? normalizeSearchQuery(city.lv).fuzzy : '';
            return ltNorm.includes(searchStr) || plNorm.includes(searchStr) || lvNorm.includes(searchStr);
        }).map(city => ({
            name: city.lt + (city.pl ? ` / ${city.pl}` : city.lv ? ` / ${city.lv}` : ''),
            fullName: city.lt + ', ' + (city.country === 'pl' ? 'Lenkija' : 'Latvija'),
            lat: city.lat,
            lon: city.lng,
            isLocal: true
        }));

        try {
            currentSearchRequest = new AbortController();
            
            // Search for the original query
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(normalized.original)}&countrycodes=lt,pl,lv&limit=100&addressdetails=1`,
                { signal: currentSearchRequest.signal }
            );
            const results = await response.json();
            
            // ALSO search for compound variations (Senoji X, Naujoji X, etc.)
            const compoundPrefixes = ['Senoji', 'Naujoji', 'Senieji', 'Nauji', 'Didieji', 'Mažieji'];
            let compoundResults = [];
            
            // Only do compound searches if query is 3+ characters
            if (normalized.original.length >= 3) {
                for (const prefix of compoundPrefixes) {
                    try {
                        const compoundQuery = `${prefix} ${normalized.original}`;
                        const compoundResponse = await fetch(
                            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(compoundQuery)}&countrycodes=lt,pl,lv&limit=20&addressdetails=1`,
                            { signal: currentSearchRequest.signal }
                        );
                        const compoundData = await compoundResponse.json();
                        compoundResults = compoundResults.concat(compoundData);
                    } catch (err) {
                        // Ignore errors in compound searches
                        console.log('Compound search error for', prefix, err);
                    }
                }
            }
            
            // Combine all results and remove duplicates
            const allResults = [...results, ...compoundResults];
            const uniqueResults = allResults.filter((result, index, self) => 
                index === self.findIndex(r => r.place_id === result.place_id)
            );
            
            const apiPlaces = uniqueResults
                .filter(place => {
                    const countryCode = place.address?.country_code || '';
                    
                    if (countryCode === 'lt' || countryCode === 'lv') {
                        // OK
                    } else if (countryCode === 'pl') {
                        const state = place.address.state || '';
                        if (!state.includes('Podlaskie') && !state.includes('Warmian-Masurian') && 
                            !state.includes('Podlaskie Voivodeship') && !state.includes('Warmińsko-Mazurskie')) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                    
                    // MUCH MORE PERMISSIVE - accept almost anything that looks like a settlement
                    const placeType = place.type || '';
                    const placeClass = place.class || '';
                    
                    // Only block obviously non-settlement things
                    if (placeClass === 'highway' || placeClass === 'waterway' || placeClass === 'railway') {
                        return false;
                    }
                    
                    // Block large administrative regions (country/state level)
                    if (placeClass === 'boundary' && placeType === 'administrative') {
                        const adminLevel = place.address?.admin_level;
                        if (adminLevel && parseInt(adminLevel) <= 4) {
                            return false;
                        }
                    }
                    
                    // Accept everything else
                    return true;
                })
                .map(place => {
                    const name = place.address?.village || 
                               place.address?.town || 
                               place.address?.city ||
                               place.address?.hamlet ||
                               place.address?.neighbourhood ||
                               place.address?.suburb ||
                               place.address?.locality ||
                               place.display_name.split(',')[0];
                    
                    let municipality = place.address?.municipality || place.address?.county || '';
                    municipality = municipality.replace(/\s+(Eldership|Municipality|County|District|Savivaldybė|Rajonas|seniūnija|apskritis|raj\.)$/i, '');
                    
                    const displayName = municipality ? `${name}, ${municipality}` : name;
                    
                    // Calculate match priority for sorting
                    const nameLower = name.toLowerCase();
                    const queryLower = normalized.fuzzy;
                    
                    // Check if name matches parent region (MAIN settlement rule)
                    const municipalityLower = municipality.toLowerCase();
                    const nameWithoutPrefix = name.replace(/^(Naujoji|Senoji|Senieji|Nauji|Didieji|Mažieji|Didžioji|Mažoji)\s+/i, '').toLowerCase();
                    const municipalityBase = municipality.replace(/^(Naujosios|Senosios|Senųjų|Naujųjų|Didžiųjų|Mažųjų)\s+/i, '').toLowerCase();
                    
                    const isMainSettlement = nameWithoutPrefix === municipalityBase || 
                                           nameLower === municipalityLower ||
                                           municipalityLower.includes(nameWithoutPrefix + 'o') || // genitive case
                                           municipalityLower.includes(nameWithoutPrefix + 'ų'); // genitive plural
                    
                    // Check for exact match (but exclude compound words when searching base name)
                    const isExactMatch = nameLower === queryLower;
                    const isCompoundWord = /^(naujoji|senoji|senieji|nauji|didieji|mazieji|didzioji|mazoji)\s+/i.test(name);
                    const baseNameMatches = nameWithoutPrefix === queryLower;
                    
                    // If searching for "Akmenė" and result is "Naujoji Akmenė", don't treat as exact
                    const isTrueExactMatch = isExactMatch && (!isCompoundWord || baseNameMatches);
                    
                    let priority = 4; // default: other
                    
                    if (isMainSettlement && isTrueExactMatch) {
                        priority = -1; // SUPER priority: main settlement + exact match
                    } else if (isTrueExactMatch) {
                        priority = 0; // exact match
                    } else if (isMainSettlement && nameLower.startsWith(queryLower)) {
                        priority = 0.5; // main settlement + starts with
                    } else if (isMainSettlement && baseNameMatches) {
                        priority = 0.7; // main settlement + base name matches
                    } else if (nameLower.startsWith(queryLower)) {
                        priority = 1; // starts with
                    } else if (baseNameMatches) {
                        priority = 1.5; // base name matches (e.g., "Akmenė" in "Naujoji Akmenė", "Varėna" in "Senoji Varėna")
                    } else if (nameWithoutPrefix.startsWith(queryLower)) {
                        priority = 1.7; // base name starts with query
                    } else if (nameLower.includes(queryLower)) {
                        priority = 2; // contains
                    } else if (nameWithoutPrefix.includes(queryLower)) {
                        priority = 2.5; // base name contains query
                    }
                    
                    return {
                        name: displayName,
                        fullName: place.display_name,
                        lat: place.lat,
                        lon: place.lon,
                        isLocal: false,
                        priority: priority,
                        rawName: name,
                        isMainSettlement: isMainSettlement
                    };
                });

            // Combine: major cities first, then bilingual, then API results
            // Sort by: isLocal (star) first, then by priority (exact → starts → contains), then alphabetically
            const allPlaces = [...majorCityResults, ...localResults, ...apiPlaces]
                .sort((a, b) => {
                    // Local results (with stars) always first
                    if (a.isLocal && !b.isLocal) return -1;
                    if (!a.isLocal && b.isLocal) return 1;
                    
                    // Then sort by priority (exact match first)
                    if (a.priority !== b.priority) {
                        return a.priority - b.priority;
                    }
                    
                    // Then alphabetically
                    return a.name.localeCompare(b.name, 'lt');
                })
                .filter((place, index, self) => 
                    // Remove duplicates by name
                    index === self.findIndex(p => p.name === place.name)
                )
                .slice(0, 10); // Increased from 5 to 10
            
            searchCache.set(cacheKey, allPlaces);
            if (searchCache.size > 50) {
                const firstKey = searchCache.keys().next().value;
                searchCache.delete(firstKey);
            }
            
            showAutocomplete(allPlaces);
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Autocomplete error:', error);
                dropdown.innerHTML = '<div class="autocomplete-item" style="color: #ff6b6b;">Klaida ieškant</div>';
            }
        }
    }, 150);
}

function showAutocomplete(places) {
    const dropdown = document.getElementById('autocompleteDropdown');
    
    if (places.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    dropdown.innerHTML = places.map((place, index) => {
        const placeData = JSON.stringify(place).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const icon = place.isLocal ? '⭐ ' : '';
        return `<div class="autocomplete-item" data-index="${index}" data-place='${placeData}'>${icon}${place.name}</div>`;
    }).join('');
    
    dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', function() {
            const placeData = JSON.parse(this.getAttribute('data-place'));
            selectPlace(placeData);
        });
    });
    
    dropdown.style.display = 'block';
}

async function selectPlace(place) {
    document.getElementById('search').value = place.name.replace('⭐ ', '');
    document.getElementById('autocompleteDropdown').style.display = 'none';
    
    const latlng = L.latLng(place.lat, place.lon);
    
    checkIfWater(latlng, function(isWater) {
        if (isWater) {
            alert('⚠️ Pasirinkta vieta yra vandenyje. Prašome pasirinkti sausumos vietą.');
            document.getElementById('search').value = '';
            return;
        }
        setLocation(latlng, place.fullName);
        map.setView(latlng, 13);
    });
}

// Geocoding functions
function checkIfWater(latlng, callback) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18`)
        .then(response => response.json())
        .then(data => {
            const isWater = data.address && (
                data.address.water ||
                data.address.bay ||
                data.address.sea ||
                data.address.ocean ||
                data.address.lake ||
                data.address.river ||
                (data.type && (data.type === 'water' || data.type === 'waterway'))
            );
            callback(isWater);
        })
        .catch(() => callback(false));
}

function checkLocationCountry(latlng, callback) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`)
        .then(response => response.json())
        .then(data => {
            const countryCode = data.address?.country_code || '';
            
            if (countryCode === 'lt' || countryCode === 'lv') {
                callback(true, countryCode);
            } else if (countryCode === 'pl') {
                const state = data.address?.state || '';
                const isAllowed = state.includes('Podlaskie') || 
                                state.includes('Warmian-Masurian') || 
                                state.includes('Podlaskie Voivodeship') || 
                                state.includes('Warmińsko-Mazurskie');
                callback(isAllowed, countryCode);
            } else {
                callback(false, countryCode);
            }
        })
        .catch(() => callback(false, 'unknown'));
}

async function reverseGeocode(latlng) {
    try {
        const cityName = isMajorCity(latlng.lat, latlng.lng);
        if (cityName) {
            selectedLocation.address = cityName + ', Lietuva';
            document.getElementById('selectedAddress').value = cityName + ', Lietuva';
            document.getElementById('search').value = cityName;
            return;
        }

        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1&zoom=18`);
        const data = await response.json();
        
        if (data.display_name) {
            let placeName = data.address?.village || 
                           data.address?.hamlet || 
                           data.address?.neighbourhood ||
                           data.address?.suburb ||
                           data.address?.town || 
                           data.address?.city ||
                           data.address?.municipality ||
                           data.display_name.split(',')[0];
            
            placeName = placeName.replace(/\s+(Eldership|Municipality|County|District)$/i, '');
            
            selectedLocation.address = data.display_name;
            document.getElementById('selectedAddress').value = data.display_name;
            document.getElementById('search').value = placeName;
        }
    } catch (error) {
        console.error('Reverse geocode error:', error);
    }
}

async function loadPastConcerts() {
    try {
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL + '?action=getPastConcerts');
        const data = await response.json();
        
        if (data.cities) {
            displayPastConcertMarkers(data.cities);
        }
    } catch (error) {
        console.error('Error loading past concerts:', error);
    }
}

async function displayPastConcertMarkers(cities) {
    for (const city of cities) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ', Lithuania')}&limit=1`);
            const data = await response.json();
            
            if (data.length > 0) {
                const cityMarker = L.circleMarker([data[0].lat, data[0].lon], {
                    radius: 6,
                    fillColor: '#9370DB',
                    fillOpacity: 0.7,
                    color: '#FFD700',
                    weight: 2
                }).addTo(map);

                cityMarker.bindPopup(`<strong>${city}</strong>`);
                pastConcertMarkers.push(cityMarker);
            }
        } catch (error) {
            console.error('Error geocoding city:', city, error);
        }
    }
}

// Form submission
document.getElementById('bookingForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!selectedLocation || !selectedLocation.address) {
        alert('Prašome pasirinkti vietą žemėlapyje');
        return;
    }

    const formData = {
        name: sanitizeInput(document.getElementById('name').value),
        date: document.getElementById('date').value,
        timeSlot: document.getElementById('timeSlot').value,
        address: sanitizeInput(selectedLocation.address),
        lat: selectedLocation.lat,
        lng: selectedLocation.lng
    };

    if (!formData.name || !formData.date || !formData.timeSlot) {
        alert('Prašome užpildyti visus laukus');
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.date);
    if (selectedDate < today) {
        alert('Negalima pasirinkti praeities datos');
        return;
    }

    document.getElementById('loading').style.display = 'block';
    document.getElementById('resultBox').classList.remove('show');
    document.getElementById('checkBtn').disabled = true;

    try {
        const url = new URL(CONFIG.GOOGLE_SCRIPT_URL);
        url.searchParams.append('action', 'checkAvailability');
        Object.keys(formData).forEach(key => {
            url.searchParams.append(key, formData[key]);
        });

        const response = await fetch(url.toString());
        const result = await response.json();
        displayResult(result, formData);
    } catch (error) {
        document.getElementById('resultBox').innerHTML = `
            <div class="error">
                <h3>❌ Klaida</h3>
                <p>Nepavyko prisijungti prie serverio. Patikrinkite ar tinkamai sukonfigūravote Google Apps Script.</p>
                <p style="font-size: 0.9em; margin-top: 10px;">Klaida: ${error.message}</p>
            </div>
        `;
        document.getElementById('resultBox').classList.add('show');
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('checkBtn').disabled = false;
    }
});

function displayResult(result, formData) {
    const resultBox = document.getElementById('resultBox');
    
    if (result.available) {
        const roundedPrice = smartRoundPrice(result.totalPrice);
        const successMsg = getRandomSuccessMessage();
        
        // Check if location is in Curonian Spit and add fees
        const isCuronianSpit = formData.address && formData.address.toLowerCase().includes('kuršių nerija');
        let finalPrice = roundedPrice;
        let curonianSpitNote = '';
        
        if (isCuronianSpit) {
            const ferryFee = 23.20;
            const selectedDate = new Date(formData.date);
            const month = selectedDate.getMonth() + 1; // 1-12
            const day = selectedDate.getDate();
            
            // June 20 - August 20 = 50 EUR, otherwise 10 EUR
            let entranceFee = 10;
            if ((month === 6 && day >= 20) || month === 7 || (month === 8 && day <= 20)) {
                entranceFee = 50;
            }
            
            finalPrice = roundedPrice + ferryFee + entranceFee;
            finalPrice = smartRoundPrice(finalPrice);
            
            curonianSpitNote = `
                <div class="note" style="background: rgba(100, 200, 255, 0.15); border-left-color: #00bfff;">
                    <strong>⛴️ Kuršių nerija:</strong><br>
                    Kaina įskaičiuoja kelto mokestį (23.20 €) ir įvažiavimo mokestį (${entranceFee} €)
                </div>
            `;
        }
        
        let warningHtml = '';
        if (result.lastSlot) {
            warningHtml = `
                <div class="warning-last-slot">
                    ‼️ Jūsų pasirinktą dieną liko paskutinė galimybė<br>
                    <strong>nepramiegok</strong> 😉
                </div>
            `;
        }

        resultBox.innerHTML = `
            <h2 style="color: #90EE90; text-align: center;">${successMsg}</h2>
            ${warningHtml}
            <div class="price">~${finalPrice} €</div>
            ${curonianSpitNote}
            <div class="note">
                <strong>⚠️ Svarbu:</strong><br>
                Jums rodoma tik PRELIMINARI kaina. Tikrą kainą sužinosite, kai atlikėja susisieks su Jumis telefonu ir suderinsite detales. Ar sutinkate?
            </div>
            <div class="contact-form">
                <div class="form-group">
                    <label for="phone">Telefono numeris *</label>
                    <input type="tel" id="phone" placeholder="+370..." required pattern="\\+?[0-9]{8,15}" maxlength="20">
                </div>
                <div class="form-group">
                    <label for="email">El. paštas (neprivaloma)</label>
                    <input type="email" id="email" placeholder="jusu@email.lt" maxlength="100">
                </div>
                <button onclick="confirmBooking(${JSON.stringify(formData).replace(/"/g, '&quot;')}, ${finalPrice})">
                    Suderinkim! 🎸
                </button>
            </div>
        `;
    } else {
        let alternativesHtml = '<div class="alternatives"><h3>📅 Siūlomi alternatyvūs laikai:</h3>';
        
        result.alternatives.forEach((alt, index) => {
            alternativesHtml += `
                <div class="alt-option" onclick="selectAlternative('${alt.date}', '${alt.timeSlot}')">
                    <strong>${index + 1}.</strong> ${alt.date} | ${alt.timeSlot}
                </div>
            `;
        });
        
        alternativesHtml += `
            <div class="alt-option" onclick="document.getElementById('date').focus()">
                <strong>3.</strong> Pasirinkti kitą datą
            </div>
        </div>`;

        resultBox.innerHTML = `
            <h2 style="color: #ff5733; text-align: center;">❌ Užimta</h2>
            <p style="text-align: center; margin: 20px 0;">Pasirinktas laikas jau užimtas.</p>
            ${alternativesHtml}
        `;
    }
    
    resultBox.classList.add('show');
}

function selectAlternative(date, timeSlot) {
    document.getElementById('date').value = date;
    document.getElementById('timeSlot').value = timeSlot;
    document.getElementById('resultBox').classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function confirmBooking(formData, price) {
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    if (!phone) {
        alert('Prašome įvesti telefono numerį');
        return;
    }

    const phoneRegex = /^\+?[0-9]{8,15}$/;
    if (!phoneRegex.test(phone)) {
        alert('Neteisingas telefono numerio formatas');
        return;
    }

    if (email && !email.includes('@')) {
        alert('Neteisingas el. pašto formatas');
        return;
    }

    const bookingData = {
        ...formData,
        phone: sanitizeInput(phone),
        email: sanitizeInput(email),
        price: price
    };

    try {
        const url = new URL(CONFIG.GOOGLE_SCRIPT_URL);
        url.searchParams.append('action', 'submitBooking');
        Object.keys(bookingData).forEach(key => {
            url.searchParams.append(key, bookingData[key]);
        });

        const response = await fetch(url.toString());
        const result = await response.json();

        if (result.success) {
            document.getElementById('resultBox').innerHTML = `
                <div class="success-message">
                    <h2>🎉 Puiku!</h2>
                    <p style="margin: 20px 0; font-size: 1.2em;">Jūsų užklausa priimta!</p>
                    <p>Atlikėja susisieks su Jumis artimiausiu metu numeriu <strong>${phone}</strong></p>
                    <button onclick="location.reload()" style="margin-top: 20px;">
                        Naujas užklausimas
                    </button>
                </div>
            `;
        }
    } catch (error) {
        alert('Klaida išsaugant duomenis: ' + error.message);
    }
}

// Initialize on page load
window.onload = function() {
    try {
        initMap();
        
        // Set minimum date to 7 days from now
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 7);
        document.getElementById('date').min = minDate.toISOString().split('T')[0];
        
        document.getElementById('date').addEventListener('click', function() {
            if (this.showPicker) {
                this.showPicker();
            }
        });
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Klaida inicializuojant žemėlapį. Prašome perkrauti puslapį.');
    }

};
