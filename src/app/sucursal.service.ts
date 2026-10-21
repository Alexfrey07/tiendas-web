import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SucursalDto {
  id: number | null;
  idMunicipio: number | null;
  nombre: string;
  esCabecera: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class SucursalService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/sucursales';

  listar(): Observable<SucursalDto[]> {
    return this.http.get<SucursalDto[]>(this.url);
  }

  guardar(s: SucursalDto): Observable<SucursalDto> {
    return s.id
      ? this.http.put<SucursalDto>(`${this.url}/${s.id}`, s)
      : this.http.post<SucursalDto>(this.url, s);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}