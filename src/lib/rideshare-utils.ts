export interface UberEstimate {
    tier: string;
    price: string;
    eta: string;
}

export interface FareResult {
    estimates: UberEstimate[];
    surgeMultiplier: number;
    distanceMiles: number;
}

const LANDMARKS: Record<string, { lat: number; lng: number }> = {
    "Union Station": { lat: 41.8787, lng: -87.6403 },
    "Navy Pier": { lat: 41.8917, lng: -87.6043 },
    "Millennium Park": { lat: 41.8827, lng: -87.6226 },
    "Wicker Park": { lat: 41.9103, lng: -87.6765 },
    "O'Hare": { lat: 41.9742, lng: -87.9073 },
    "Midway": { lat: 41.7868, lng: -87.7522 },
    "Clark/Lake": { lat: 41.8857, lng: -87.6308 },
    "UIC-Halsted": { lat: 41.8755, lng: -87.6472 },
    "Wrigley Field": { lat: 41.9484, lng: -87.6553 },
};

function calculateDistance(loc1: string, loc2: string): number {
    const p1 = LANDMARKS[loc1] || LANDMARKS["Union Station"];
    const p2 = LANDMARKS[loc2] || LANDMARKS["Millennium Park"];

    // Haversine formula (approx)
    const R = 3958.8; // Miles
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLng = (p2.lng - p1.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 1.2 * 10) / 10; // 1.2x for road distance vs straight line
}

export function estimateUberFare(from: string, to: string): FareResult {
    const distance = calculateDistance(from, to);
    const now = new Date();
    const hour = now.getHours();

    let surge = 1.0;
    if ((hour >= 8 && hour <= 10) || (hour >= 16 && hour <= 19)) {
        surge = 1.8; // Rush hour
    } else if (hour >= 22 || hour <= 2) {
        surge = 1.4; // Night surge
    }

    const baseRates = {
        "UberX": { base: 2.5, perMile: 1.5, perMin: 0.3 },
        "UberXL": { base: 4.5, perMile: 2.8, perMin: 0.5 },
        "Premier": { base: 8.0, perMile: 4.0, perMin: 0.8 },
    };

    const avgSpeed = distance > 10 ? 40 : 15; // MPH
    const durationMin = (distance / avgSpeed) * 60;

    const estimates = Object.entries(baseRates).map(([tier, rate]) => {
        const rawPrice = (rate.base + (distance * rate.perMile) + (durationMin * rate.perMin)) * surge;
        return {
            tier,
            price: `$${rawPrice.toFixed(2)}`,
            eta: `${Math.round(durationMin + 3)} min` // 3 min pickup
        };
    });

    return {
        estimates,
        surgeMultiplier: surge,
        distanceMiles: distance
    };
}
