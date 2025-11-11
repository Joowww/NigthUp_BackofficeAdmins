import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Tag, TagStats, TagsResponse } from '../models/tag';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private apiUrl = `${environment.apiUrl}/tag`;

  constructor(private http: HttpClient) {}

  createTag(tag: Partial<Tag>): Observable<Tag> {
    return this.http.post<Tag>(this.apiUrl, tag);
  }

  getTags(skip: number = 0, limit: number = 10, search?: string): Observable<TagsResponse> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<TagsResponse>(this.apiUrl, { params });
  }

  getTagsWithInactive(skip: number = 0, limit: number = 10): Observable<TagsResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<TagsResponse>(`${this.apiUrl}/all/inactive-included`, { params });
  }

  getTagById(id: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.apiUrl}/${id}`);
  }

  updateTag(id: string, tag: Partial<Tag>): Observable<Tag> {
    return this.http.patch<Tag>(`${this.apiUrl}/${id}`, tag);
  }

  disableTag(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/disable`, {});
  }

  reactivateTag(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/reactivate`, {});
  }

  deleteTag(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getTagStats(): Observable<TagStats> {
    return this.http.get<TagStats>(`${this.apiUrl}/stats`);
  }
}