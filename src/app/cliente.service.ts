import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClienteDto {
  id: number | null;
  nombres: string;
  apellidos: string;
  nit: string;
  dpi: string;
  esConsumidorFinal: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/clientes';

  listar(): Observable<ClienteDto[]> {
    return this.http.get<ClienteDto[]>(this.url);
  }

  guardar(c: ClienteDto): Observable<ClienteDto> {
    return c.id
      ? this.http.put<ClienteDto>(`${this.url}/${c.id}`, c)
      : this.http.post<ClienteDto>(this.url, c);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}