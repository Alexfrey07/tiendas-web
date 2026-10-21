import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProveedorDto {
  id: number | null;
  nit: string;
  razonSocial: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/proveedores';

  listar(): Observable<ProveedorDto[]> {
    return this.http.get<ProveedorDto[]>(this.url);
  }

  guardar(p: ProveedorDto): Observable<ProveedorDto> {
    return p.id
      ? this.http.put<ProveedorDto>(`${this.url}/${p.id}`, p)
      : this.http.post<ProveedorDto>(this.url, p);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}