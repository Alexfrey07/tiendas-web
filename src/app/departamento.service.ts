import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DepartamentoDto {
  id: number | null;
  nombre: string;
  cabecera: string;
}

@Injectable({ providedIn: 'root' })
export class DepartamentoService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/departamentos';

  listar(): Observable<DepartamentoDto[]> {
    return this.http.get<DepartamentoDto[]>(this.url);
  }

  guardar(d: DepartamentoDto): Observable<DepartamentoDto> {
    return d.id
      ? this.http.put<DepartamentoDto>(`${this.url}/${d.id}`, d)
      : this.http.post<DepartamentoDto>(this.url, d);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}