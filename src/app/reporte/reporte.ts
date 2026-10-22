import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReporteService, ReporteDatos } from '../reporte.service';

@Component({
    selector: 'app-reporte',
    templateUrl: './reporte.html'
})
export class Reporte {
    private servicio = inject(ReporteService);
    private ruta = inject(ActivatedRoute);

    datos = signal<ReporteDatos | null>(null);
    mensaje = signal('');
    tipo = '';

    constructor() {
        this.ruta.paramMap.subscribe(p => {
            this.tipo = p.get('tipo') ?? '';
            this.datos.set(null);
            this.mensaje.set('');
            this.servicio.datos(this.tipo).subscribe({
                next: d => this.datos.set(d),
                error: e => this.mensaje.set(e?.error?.mensaje ?? 'No se pudo cargar el reporte')
            });
        });
    }

    formato(campo: string, v: any): string {
        if (v === null || v === undefined) return '';
        if (typeof v === 'number' && campo === 'total') {
            return 'Q ' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return String(v);
    }

    descargar(formato: 'excel' | 'pdf') {
        this.servicio.descargar(this.tipo, formato).subscribe({
            next: blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'reporte-' + this.tipo + (formato === 'excel' ? '.xlsx' : '.pdf');
                a.click();
                URL.revokeObjectURL(url);
            },
            error: () => this.mensaje.set('No se pudo generar el archivo')
        });
    }
}