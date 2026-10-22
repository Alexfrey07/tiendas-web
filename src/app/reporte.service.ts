import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Columna {
    campo: string;
    titulo: string;
}

export interface ReporteDatos {
    titulo: string;
    columnas: Columna[];
    filas: Record<string, any>[];
}

export interface Punto {
    etiqueta: string;
    valor: number;
}

export interface DashboardDatos {
    kpis: {
        totalVentas: number;
        facturas: number;
        notasCredito: number;
        stockBajo: number;
        reclamosAbiertos: number;
    };
    ventasSucursal: Punto[];
    ventasCategoria: Punto[];
    topProductos: Punto[];
    reclamos: Punto[];
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
    private http = inject(HttpClient);
    private url = 'http://localhost:8080/api/reportes';

    datos(tipo: string): Observable<ReporteDatos> {
        return this.http.get<ReporteDatos>(`${this.url}/${tipo}`);
    }

    descargar(tipo: string, formato: 'excel' | 'pdf'): Observable<Blob> {
        return this.http.get(`${this.url}/${tipo}/${formato}`, { responseType: 'blob' });
    }

    dashboard(): Observable<DashboardDatos> {
        return this.http.get<DashboardDatos>(`${this.url}/dashboard`);
    }
}