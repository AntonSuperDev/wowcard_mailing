import { Injectable } from "@nestjs/common";

@Injectable()
export class AccuzipCalculateDistanceService {
    private static readonly earthRadiusInMiles = 3959;

    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
    
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(this.toRadians(lat1)) *
            Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
        const distance = AccuzipCalculateDistanceService.earthRadiusInMiles * c;
        return distance;
    };
    
    private toRadians(degrees: number): number {
        return (degrees * Math.PI) / 180;
    };
}