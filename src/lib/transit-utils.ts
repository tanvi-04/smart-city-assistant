import { ArrivalPrediction } from "./cta-api";

export interface ForecastResult {
    summary: string;
    optimalWindow?: string;
    vibe: "Clear" | "Crowded" | "Delayed" | "Optimal";
}

export function generateForecast(arrivals: ArrivalPrediction[], alerts: any[]): ForecastResult {
    if (arrivals.length === 0) {
        return { summary: "No upcoming arrivals found. High service uncertainty.", vibe: "Delayed" };
    }

    // Sort by arrival time
    const sorted = [...arrivals].sort((a, b) =>
        new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime()
    );

    const now = new Date();
    const waitTimes = sorted.map(a => {
        const arrTime = new Date(a.arrivalTime);
        const diffMs = arrTime.getTime() - now.getTime();
        return Math.round(diffMs / 60000); // Minutes
    }).filter(t => t >= 0);

    const majorAlerts = alerts.filter(a => a.SeverityScore > 60);

    if (majorAlerts.length > 0) {
        return {
            summary: `Major service alerts detected: ${majorAlerts[0].Headline}. Expect significant congestion and irregular headways.`,
            vibe: "Delayed"
        };
    }

    // Analyze Gaps (simplified logic)
    // If the gap between vehicle A and B is > 15 mins, vehicle B will likely be packed.
    // If vehicle C is only 2-4 mins behind B, vehicle C is the "Optimal" choice.

    for (let i = 1; i < waitTimes.length; i++) {
        const gap = waitTimes[i] - waitTimes[i - 1];
        if (gap < 5 && waitTimes[i - 1] > 10) {
            return {
                summary: `AI detects a 'Vehicle Bunching' pattern. The ${sorted[i - 1].route} to ${sorted[i - 1].destination} in ${waitTimes[i - 1]}m will be crowded.`,
                optimalWindow: `Board the following ${sorted[i].route} in ${waitTimes[i]}m for a seated ride.`,
                vibe: "Optimal"
            };
        }
    }

    // Default: Just show the next one
    const nextWait = waitTimes[0];
    if (nextWait < 5) {
        return {
            summary: `Immediate departure recommended. Next ${sorted[0].route} arrives in ${nextWait}m.`,
            vibe: "Clear"
        };
    }

    return {
        summary: `Stable service patterns. Next ${sorted[0].route} in ${nextWait}m. No significant bunching detected.`,
        vibe: "Clear"
    };
}
