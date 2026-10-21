import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Categorias } from './categorias/categorias';
import { Departamentos } from './departamentos/departamentos';
import { Puestos } from './puestos/puestos';
import { Proveedores } from './proveedores/proveedores';
import { Horarios } from './horarios/horarios';
import { Municipios } from './municipios/municipios';
import { Sucursales } from './sucursales/sucursales';
import { Productos } from './productos/productos';
import { Clientes } from './clientes/clientes';
import { Empleados } from './empleados/empleados';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'categorias', component: Categorias, canActivate: [authGuard] },
  { path: 'departamentos', component: Departamentos, canActivate: [authGuard] },
  { path: 'puestos', component: Puestos, canActivate: [authGuard] },
  { path: 'proveedores', component: Proveedores, canActivate: [authGuard] },
  { path: 'horarios', component: Horarios, canActivate: [authGuard] },
  { path: 'municipios', component: Municipios, canActivate: [authGuard] },
  { path: 'sucursales', component: Sucursales, canActivate: [authGuard] },
  { path: 'productos', component: Productos, canActivate: [authGuard] },
  { path: 'clientes', component: Clientes, canActivate: [authGuard] },
  { path: 'empleados', component: Empleados, canActivate: [authGuard] },
  { path: '', redirectTo: 'categorias', pathMatch: 'full' },
  { path: '**', redirectTo: 'categorias' }
];