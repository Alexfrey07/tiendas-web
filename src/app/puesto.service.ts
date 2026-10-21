import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PuestoDto {
  id: number | null;
  nombre: string;
  descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class PuestoService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/puestos';

  listar(): Observable<PuestoDto[]> {
    return this.http.get<PuestoDto[]>(this.url);
  }

  guardar(p: PuestoDto): Observable<PuestoDto> {
    return p.id
      ? this.http.put<PuestoDto>(`${this.url}/${p.id}`, p)
      : this.http.post<PuestoDto>(this.url, p);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}