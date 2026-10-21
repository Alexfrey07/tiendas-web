import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HorarioDto {
  id: number | null;
  nombreHorario: string;
  horaEntrada: string;
  horaSalida: string;
}

@Injectable({ providedIn: 'root' })
export class HorarioService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/horarios';

  listar(): Observable<HorarioDto[]> {
    return this.http.get<HorarioDto[]>(this.url);
  }

  guardar(h: HorarioDto): Observable<HorarioDto> {
    return h.id
      ? this.http.put<HorarioDto>(`${this.url}/${h.id}`, h)
      : this.http.post<HorarioDto>(this.url, h);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}