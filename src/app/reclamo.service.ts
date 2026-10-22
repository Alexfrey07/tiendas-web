import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReclamoFila {
  id: number;
  fecha: string;
  factura: string;
  producto: string;
  sucursal: string;
  idSucursal: number;
  descripcion: string;
  reclamada: number;
  aprobada: number;
  resolucion: string | null;
  estado: string;
  reemplazo: string | null;
}

export interface GarantiaFila {
  id: number;
  factura: string;
  cliente: string;
  producto: string;
  inicio: string;
  fin: string;
  cubierta: number;
  reclamada: number;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class ReclamoService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/reclamos';

  listar(): Observable<ReclamoFila[]> {
    return this.http.get<ReclamoFila[]>(this.url);
  }

  garantias(): Observable<GarantiaFila[]> {
    return this.http.get<GarantiaFila[]>(`${this.url}/garantias`);
  }

  crear(datos: { idGarantia: number; idSucursal: number; descripcion: string; cantidad: number }): Observable<void> {
    return this.http.post<void>(this.url, datos);
  }

  enProceso(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/proceso`, {});
  }

  cerrar(id: number, datos: {
    tipoResolucion: string;
    cantidadAprobada: number;
    idProductoReemplazo: number | null;
  }): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/cerrar`, datos);
  }
}