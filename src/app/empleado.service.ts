import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmpleadoDto {
  id: number | null;
  idSucursal: number | null;
  idPuesto: number | null;
  nombres: string;
  apellidos: string;
  dpi: string;
  nit: string;
  salario: number;
  fechaNacimiento: string | null;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class EmpleadoService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/empleados';

  listar(): Observable<EmpleadoDto[]> {
    return this.http.get<EmpleadoDto[]>(this.url);
  }

  guardar(e: EmpleadoDto): Observable<EmpleadoDto> {
    return e.id
      ? this.http.put<EmpleadoDto>(`${this.url}/${e.id}`, e)
      : this.http.post<EmpleadoDto>(this.url, e);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}