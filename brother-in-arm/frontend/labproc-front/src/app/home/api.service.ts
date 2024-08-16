import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class ApiService {
  private apiUrl = 'http://127.0.0.1:8000';
  constructor(private http: HttpClient) { }
  getTextResponse(): Observable<string> {
    return this.http.get(this.apiUrl, {responseType: 'text'});
  }
}
