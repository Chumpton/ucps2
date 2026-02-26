/**
 * Simplified Ephemeris Engine for UCPS
 * Based on orbital elements relative to J2000
 * Accuracy: ~1-2 degrees (sufficient for visual charts)
 */
const Ephemeris = {
    // Normalize angle to 0-360
    norm: (angle) => {
        angle = angle % 360;
        return angle < 0 ? angle + 360 : angle;
    },

    // Sine/Cos in degrees
    sin: (d) => Math.sin(d * Math.PI / 180),
    cos: (d) => Math.cos(d * Math.PI / 180),
    tan: (d) => Math.tan(d * Math.PI / 180),
    asin: (x) => Math.asin(x) * 180 / Math.PI,
    atan: (x) => Math.atan(x) * 180 / Math.PI,
    atan2: (y, x) => Math.atan2(y, x) * 180 / Math.PI,

    // Calculate Julian Date
    getJD: (date) => {
        return (date.getTime() / 86400000) + 2440587.5;
    },

    // Compute positions
    calculate: function (date, lat = 0, lng = 0) { // lat/lng for Ascendant
        const jd = this.getJD(date);
        const d = jd - 2451545.0; // Days from J2000

        // Periodic elements (simplified) for major planets
        // Returns Ecliptic Longitude
        const planets = {};

        // --- SUN ---
        // Mean longitude
        const L = this.norm(280.466 + 0.98564736 * d);
        // Mean anomaly
        const g = this.norm(357.529 + 0.98560028 * d);
        // Ecliptic longitude
        const sunLng = this.norm(L + (1.915 * this.sin(g)) + (0.020 * this.sin(2 * g)));
        planets.Sun = sunLng;

        // --- MOON ---
        // Mean longitude
        const Lm = this.norm(218.316 + 13.176396 * d);
        // Mean anomaly
        const Mm = this.norm(134.963 + 13.064993 * d);
        // Mean distance
        const F = this.norm(93.272 + 13.229350 * d);
        // Longitude with major perturbations
        const moonLng = this.norm(Lm + 6.289 * this.sin(Mm)
            - 1.274 * this.sin(Mm - 2 * d)
            + 0.658 * this.sin(2 * d)
            - 0.185 * this.sin(F)
            - 0.114 * this.sin(2 * F));
        planets.Moon = moonLng;

        // --- PLANETS (Keplerian) ---
        // N = Longitude of ascending node
        // i = Inclination
        // w = Argument of perihelion
        // a = Semi-major axis
        // e = Eccentricity
        // M = Mean anomaly

        const calcPlanet = (N0, N1, i0, i1, w0, w1, a0, a1, e0, e1, M0, M1) => {
            const N = N0 + N1 * d;
            const i = i0 + i1 * d;
            const w = w0 + w1 * d;
            const a = a0 + a1 * d;
            const e = e0 + e1 * d;
            const M = this.norm(M0 + M1 * d);

            // Eccentric Anomaly (E) - solve Kepler eq M = E - e*sin(E)
            let E = M + (180 / Math.PI) * e * this.sin(M) * (1 + e * this.cos(M));
            // Iteration for better E
            for (let j = 0; j < 3; j++) {
                const E_rad = E * Math.PI / 180;
                const dM = M - (E - (180 / Math.PI) * e * Math.sin(E_rad));
                const dE = dM / (1 - e * Math.cos(E_rad));
                E += dE;
            }

            // True Anomaly (v)
            // xv = r * cos(v) = a * (cos(E) - e)
            // yv = r * sin(v) = a * sqrt(1-e*e) * sin(E)
            const xv = a * (this.cos(E) - e);
            const yv = a * Math.sqrt(1 - e * e) * this.sin(E);
            const v = this.atan2(yv, xv);
            const r = Math.sqrt(xv * xv + yv * yv);

            // Heliocentric coordinates
            const xh = r * (this.cos(N) * this.cos(v + w) - this.sin(N) * this.sin(v + w) * this.cos(i));
            const yh = r * (this.sin(N) * this.cos(v + w) + this.cos(N) * this.sin(v + w) * this.cos(i));
            // const zh = r * (this.sin(v+w) * this.sin(i));

            // Convert to Geocentric (simplified - assume Earth at SunLng+180)
            // Real conversion requires Earth coords.
            // Earth Heliocentric:
            // R ~ 1.0
            // L_earth = sunLng + 180
            const Re = 1.0;
            const Le = sunLng + 180;
            const xe = Re * this.cos(Le);
            const ye = Re * this.sin(Le);

            const xg = xh - xe;
            const yg = yh - ye;

            return this.norm(this.atan2(yg, xg));
        };

        // Elements J2000
        planets.Mercury = calcPlanet(48.331, 3.24587E-5, 7.005, 5.0E-8, 29.124, 1.01444E-5, 0.387098, 0, 0.20563, 2.5E-9, 168.656, 4.0923344);
        planets.Venus = calcPlanet(76.680, 2.46590E-5, 3.395, 2.7E-8, 54.884, 1.38374E-5, 0.723332, 0, 0.00677, -4.9E-9, 48.005, 1.6021302);
        planets.Mars = calcPlanet(49.558, 2.11081E-5, 1.850, -6.5E-10, 286.502, 2.92961E-5, 1.523679, 0, 0.09340, 9.0E-10, 18.602, 0.5240208);
        planets.Jupiter = calcPlanet(100.464, 2.76854E-5, 1.303, -1.6E-8, 273.867, 1.6E-7, 5.2044, 0, 0.04890, 0, 20.020, 0.083056); // Simplified
        planets.Saturn = calcPlanet(113.666, 2.3898E-5, 2.485, 1.9E-9, 339.391, 3.0E-7, 9.582, 0, 0.0565, 0, 317.021, 0.033371);

        // Outer Planets (Approximate)
        planets.Uranus = this.norm(313.23 + 0.0117312 * d); // Very simplified mean motion
        planets.Neptune = this.norm(304.88 + 0.00598106 * d);
        planets.Pluto = this.norm(238.92 + 0.0039755 * d);

        // --- ASCENDANT ---
        // Requires Sidereal Time
        // GMST (Greenwich Mean Sidereal Time)
        const GMST0 = 280.46061837 + 360.98564736629 * d;
        const GMST = this.norm(GMST0);
        // LMST (Local Mean Sidereal Time) = GMST + Longitude
        const LMST = this.norm(GMST + lng);

        // Ascendant Formula: atan2(cos(RAMC), -sin(RAMC)*cos(eps) - tan(lat)*sin(eps))
        // Where RAMC = LMST
        // Eps (Obliquity) ~ 23.44
        const eps = 23.44;

        // Note: Standard formula often produces quadrant ambiguity.
        // Asc = atan2(y, x)
        // y = cos(LMST)
        // x = -sin(LMST) * cos(eps) - tan(lat) * sin(eps)
        const yAsc = this.cos(LMST);
        const xAsc = -this.sin(LMST) * this.cos(eps) - this.tan(lat) * this.sin(eps);
        const asc = this.norm(this.atan2(yAsc, xAsc));

        planets.Ascendant = asc;

        return planets;
    }
};

window.Ephemeris = Ephemeris;
