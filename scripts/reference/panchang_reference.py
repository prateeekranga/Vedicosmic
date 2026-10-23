"""Independent panchang reference values for the engine tests (development only, never shipped).

Uses Skyfield (MIT) with NASA JPL's DE421 ephemeris, which share no code or theory with
Astronomy Engine, the library the site uses. Writes tests/golden/panchang-reference.json.

    python -m venv .venv && .venv/Scripts/pip install skyfield==1.53     (or .venv/bin/pip)
    .venv/Scripts/python scripts/reference/panchang_reference.py

Conventions (the same ones the engine and /how-we-calculate use):
- Sunrise and sunset: the Sun's upper limb on a sea-level horizon with standard refraction,
  i.e. the centre 0.8333 degrees below the horizon. WGS84 coordinates, elevation 0.
- Tithi: (Moon - Sun) apparent geocentric longitude in 12-degree steps; karana in 6-degree steps.
- Nakshatra and yoga: sidereal longitudes, i.e. apparent longitude minus nutation in longitude
  minus the mean Lahiri ayanamsa (the model checked against tests/golden/vectors.json).
- Each element is the one in force at sunrise; its end is the first change after sunrise.
"""
import json
import numpy as np
from pathlib import Path

from skyfield import almanac
from skyfield.api import load, wgs84
from skyfield.framelib import ecliptic_frame
from skyfield.nutationlib import iau2000a_radians
from skyfield.searchlib import find_discrete

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'tests' / 'golden' / 'panchang-reference.json'

CITIES = [
    ('Delhi', 28.6139, 77.2090, 'Asia/Kolkata'),
    ('Mumbai', 19.0760, 72.8777, 'Asia/Kolkata'),
    ('Kolkata', 22.5726, 88.3639, 'Asia/Kolkata'),
    ('Chennai', 13.0827, 80.2707, 'Asia/Kolkata'),
    ('Bengaluru', 12.9716, 77.5946, 'Asia/Kolkata'),
    ('Hyderabad', 17.3850, 78.4867, 'Asia/Kolkata'),
    ('Varanasi', 25.3176, 82.9739, 'Asia/Kolkata'),
    ('Jaipur', 26.9124, 75.7873, 'Asia/Kolkata'),
    ('Ahmedabad', 23.0225, 72.5714, 'Asia/Kolkata'),
    ('Guwahati', 26.1445, 91.7362, 'Asia/Kolkata'),
    ('Srinagar', 34.0837, 74.7973, 'Asia/Kolkata'),
    ('Thiruvananthapuram', 8.5241, 76.9366, 'Asia/Kolkata'),
    ('Sonipat', 28.9931, 77.0151, 'Asia/Kolkata'),
    ('Kathmandu', 27.7172, 85.3240, 'Asia/Kathmandu'),
    ('Dubai', 25.2048, 55.2708, 'Asia/Dubai'),
    ('Singapore', 1.3521, 103.8198, 'Asia/Singapore'),
    ('London', 51.5074, -0.1278, 'Europe/London'),
    ('New York', 40.7128, -74.0060, 'America/New_York'),
    ('Toronto', 43.6532, -79.3832, 'America/Toronto'),
    ('Sydney', -33.8688, 151.2093, 'Australia/Sydney'),
]
# One date a month, including both sides of the DST changes in London, New York and Sydney.
DATES = ['2026-01-14', '2026-02-17', '2026-03-29', '2026-04-05', '2026-05-12', '2026-06-21',
         '2026-07-30', '2026-08-26', '2026-09-23', '2026-10-25', '2026-11-08', '2026-12-31']

T0_JD = 2435553.5
AYANAMSA_AT_T0 = 23.245524743


def general_precession(t):
    return (5029.0966 * t + 1.11113 * t * t - 0.000006 * t ** 3) / 3600


def lahiri(jd_ut):
    c = lambda jd: (jd - 2451545.0) / 36525
    return AYANAMSA_AT_T0 + general_precession(c(jd_ut)) - general_precession(c(T0_JD))


ts = load.timescale()
eph = load('de421.bsp')
earth, sun, moon = eph['earth'], eph['sun'], eph['moon']


def longitudes(t):
    """Apparent geocentric true-of-date ecliptic longitudes of Sun and Moon, in degrees."""
    e = earth.at(t)
    s = e.observe(sun).apparent().frame_latlon(ecliptic_frame)[1].degrees
    m = e.observe(moon).apparent().frame_latlon(ecliptic_frame)[1].degrees
    return s, m


def sidereal_offset(t):
    """Nutation in longitude plus mean Lahiri ayanamsa, in degrees."""
    dpsi, _ = iau2000a_radians(t)
    return np.degrees(dpsi) + lahiri(t.ut1)


def tithi_angle(t):
    s, m = longitudes(t)
    return (m - s) % 360


def nakshatra_angle(t):
    _, m = longitudes(t)
    return (m - sidereal_offset(t)) % 360


def yoga_angle(t):
    s, m = longitudes(t)
    return (s + m - 2 * sidereal_offset(t)) % 360


def stepper(angle, step):
    def f(t):
        return (angle(t) // step).astype(int)
    f.step_days = 0.04
    return f


ELEMENTS = {
    'tithi': stepper(tithi_angle, 12.0),
    'karana': stepper(tithi_angle, 6.0),
    'nakshatra': stepper(nakshatra_angle, 360 / 27),
    'yoga': stepper(yoga_angle, 360 / 27),
}


def iso(t):
    return t.utc_strftime('%Y-%m-%dT%H:%M:%SZ')


def first_event(f, t0, t1):
    times, values = find_discrete(t0, t1, f)
    return times[0], int(values[0])


cases = []
for name, lat, lon, zone in CITIES:
    place = earth + wgs84.latlon(lat, lon)
    for date in DATES:
        y, mo, d = map(int, date.split('-'))
        # Search a window around the local date; longitude/15 h converts local noon to UT.
        noon = 12 - lon / 15
        t_start = ts.utc(y, mo, d, noon - 14)
        t_end = ts.utc(y, mo, d, noon + 14)
        rises, _ = almanac.find_risings(place, sun, t_start, t_end, horizon_degrees=-0.8333)
        sets, _ = almanac.find_settings(place, sun, t_start, t_end, horizon_degrees=-0.8333)
        sunrise = min(rises, key=lambda t: abs(t.tt - ts.utc(y, mo, d, 6 - lon / 15).tt))
        sunset = min(sets, key=lambda t: abs(t.tt - ts.utc(y, mo, d, 18 - lon / 15).tt))
        case = {'city': name, 'latitude': lat, 'longitude': lon, 'timezone': zone, 'date': date,
                'sunrise': iso(sunrise), 'sunset': iso(sunset)}
        later = ts.tt_jd(sunrise.tt + 2.5)
        for key, f in ELEMENTS.items():
            index = int(f(sunrise))
            end, _ = first_event(f, sunrise, later)
            case[key] = {'index_at_sunrise': index, 'ends': iso(end)}
        cases.append(case)
    print(name, 'done')

OUT.write_text(json.dumps({
    'meta': {
        'generator': 'scripts/reference/panchang_reference.py',
        'tool': 'Skyfield 1.53 with JPL DE421 (development only, not shipped)',
        'conventions': 'Sunrise/sunset: upper limb, standard refraction (centre at -0.8333 deg), sea level. '
                       'Tithi/karana from apparent Moon - Sun; nakshatra/yoga sidereal with mean Lahiri. '
                       'Indexes: tithi 0-29, karana 0-59 (half-tithis), nakshatra 0-26, yoga 0-26. '
                       'Element in force at sunrise; "ends" is its first change after sunrise. Times are UTC.',
        'tolerances': {'sunrise_sunset_minutes': 1, 'end_time_minutes': 2},
    },
    'cases': cases,
}, indent=1) + '\n', encoding='utf-8')
print('wrote', OUT, len(cases), 'cases')
