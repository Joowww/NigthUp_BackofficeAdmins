import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { IBusiness } from '../models/business';

export interface BusinessesResponse {
  businesses: IBusiness[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private apiUrl = `${environment.apiUrl}/business`;

  constructor(private http: HttpClient) {}

  /** 🔹 Crear un nuevo negocio */
  createBusiness(business: Partial<IBusiness>): Observable<IBusiness> {
    return this.http.post<IBusiness>(this.apiUrl, business);
  }

  /** 🔹 Obtener todos los negocios activos */
  getAllBusinesses(skip: number = 0, limit: number = 10): Observable<BusinessesResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<BusinessesResponse>(`${this.apiUrl}/active`, { params });
  }

  /** 🔹 Obtener todos los negocios (incluye inactivos) */
  getAllBusinessesWithInactive(skip: number = 0, limit: number = 10): Observable<BusinessesResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<BusinessesResponse>(`${this.apiUrl}/all`, { params });
  }

  /** 🔹 Obtener negocio por ID */
  getBusinessById(id: string): Observable<IBusiness> {
    return this.http.get<IBusiness>(`${this.apiUrl}/${id}`);
  }

  /** 🔹 Desactivar negocio */
  disableBusiness(id: string): Observable<IBusiness> {
    return this.http.put<IBusiness>(`${this.apiUrl}/${id}/disable`, {});
  }

  /** 🔹 Reactivar negocio */
  reactivateBusiness(id: string): Observable<IBusiness> {
    return this.http.put<IBusiness>(`${this.apiUrl}/${id}/reactivate`, {});
  }

  /** 🔹 Eliminar negocio completamente */
  deleteBusiness(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /** 🔹 Añadir un manager al negocio */
  addManagerToBusiness(businessId: string, managerId: string): Observable<IBusiness> {
    return this.http.put<IBusiness>(`${this.apiUrl}/${businessId}/manager/add`, { managerId });
  }

  /** 🔹 Quitar un manager del negocio */
  removeManagerFromBusiness(businessId: string, managerId: string): Observable<IBusiness> {
    return this.http.put<IBusiness>(`${this.apiUrl}/${businessId}/manager/remove`, { managerId });
  }

  /** 🔹 Añadir evento al negocio */
  addEventToBusiness(businessId: string, eventId: string): Observable<IBusiness> {
    return this.http.put<IBusiness>(`${this.apiUrl}/${businessId}/event/add`, { eventId });
  }

  /** 🔹 Quitar evento del negocio */
  removeEventFromBusiness(businessId: string, eventId: string): Observable<IBusiness> {
    return this.http.put<IBusiness>(`${this.apiUrl}/${businessId}/event/remove`, { eventId });
  }

  /** 🔹 Actualizar información del negocio */
  updateBusiness(id: string, data: Partial<IBusiness>): Observable<IBusiness> {
    return this.http.put<IBusiness>(`${this.apiUrl}/${id}`, data);
  }
}
