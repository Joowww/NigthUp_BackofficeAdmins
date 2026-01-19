import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { IBusiness } from '../models/business';

export interface BusinessResponse {
    businesses: IBusiness[];
    pagination: {
        skip: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
}

@Injectable({
    providedIn: 'root'
})
export class BusinessService {
    private apiUrl = `${environment.apiUrl}/business`;

    constructor(private http: HttpClient) { }

    getAllBusinesses(skip: number = 0, limit: number = 10): Observable<BusinessResponse> {
        const params = new HttpParams()
            .set('skip', skip.toString())
            .set('limit', limit.toString());

        return this.http.get<any>(this.apiUrl, { params });
    }

    getAllBusinessesWithInactive(skip: number = 0, limit: number = 10): Observable<BusinessResponse> {
        const params = new HttpParams()
            .set('skip', skip.toString())
            .set('limit', limit.toString());

        return this.http.get<any>(this.apiUrl, { params });
    }

    getBusinessById(id: string): Observable<IBusiness> {
        return this.http.get<IBusiness>(`${this.apiUrl}/${id}`);
    }

    createBusiness(business: Partial<IBusiness>): Observable<IBusiness> {
        return this.http.post<IBusiness>(this.apiUrl, business);
    }

    updateBusiness(id: string, business: Partial<IBusiness>): Observable<IBusiness> {
        return this.http.patch<IBusiness>(`${this.apiUrl}/${id}`, business);
    }

    deleteBusiness(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    assignManager(userId: string, businessId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/assign-manager`, { userId, businessId });
    }

    getBusinessStats(): Observable<any> {
        return this.http.get(`${this.apiUrl}/stats`);
    }
}
