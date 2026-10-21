import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MunicipioDto {
  id: number | null;
  idDepartamento: number | null;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class MunicipioService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/municipios';

  listar(): Observable<MunicipioDto[]> {
    return this.http.get<MunicipioDto[]>(this.url);
  }

  guardar(m: MunicipioDto): Observable<MunicipioDto> {
    return m.id
      ? this.http.put<MunicipioDto>(`${this.url}/${m.id}`, m)
      : this.http.post<MunicipioDto>(this.url, m);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}