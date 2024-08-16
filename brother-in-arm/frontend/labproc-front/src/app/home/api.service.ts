import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompileResponse } from './compile-response';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:8000';
  constructor(private http: HttpClient) {}
  getTextResponse(): Observable<string> {
    return this.http.get(this.apiUrl, { responseType: 'text' });
  }
  sendCompile(code: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        Accept: '*/*',
      }),
    };
    let fd = new FormData();
    fd.append('code', code);
    const response = this.http.post(
      `${this.apiUrl}/run/compile`,
      fd,
      httpOptions
    );
    console.log(response);
    return response;
  }
}
