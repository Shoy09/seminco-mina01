import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth-service.service';

@Component({
  selector: 'app-login',
  standalone: true, // Marca el componente como standalone
  imports: [FormsModule, CommonModule], // Importa los módulos necesarios
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  showPassword: boolean = false;
  codigo_dni: string = ''; 
  password: string = ''; 
  errorMessage: string = ''; // Para mostrar mensajes de error

  constructor(
    private readonly router: Router,
    private authService: AuthService,
    private _toastr: ToastrService // Inyecta ToastrService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (!this.codigo_dni || !this.password) {
      this.errorMessage = 'Por favor, ingresa todos los campos.';
      this._toastr.warning(this.errorMessage, 'Advertencia'); // Muestra una notificación de advertencia
      return;
    }

    this._toastr.info('Iniciando sesión...', 'Por favor espera'); // Muestra una notificación de espera

    this.authService.login(this.codigo_dni, this.password).subscribe(
      (response) => {
        if (response.token) {
          this.authService.setToken(response.token); // Guarda el token en localStorage
          this.router.navigate(['/Dashboard']); // Redirige al dashboard
          this._toastr.success('Sesión iniciada con éxito', 'Bienvenido'); // Muestra una notificación de éxito
        } else {
          this.errorMessage = 'Error en la autenticación. Token no recibido.';
          this._toastr.error(this.errorMessage, 'Error'); // Muestra una notificación de error
        }
      },
      (error) => {
        console.error('Error en el login', error);
        this.errorMessage = 'Credenciales incorrectas o problema con el servidor.';
        this._toastr.error(this.errorMessage, 'Error de autenticación'); // Muestra una notificación de error
      }
    );
  }
}
