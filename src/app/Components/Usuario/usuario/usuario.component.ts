import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../models/Usuario';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})

export class UsuarioComponent implements OnInit{
  usuario: Usuario | null = null;
  datosUsuario = {
    id: undefined as number | undefined,
    fotoPerfil: 'assets/usuario.png',
    nombre: '',
    apellidos: '',
    cargo: '',
    empresa: '',
    guardia: '',
    equipoAutorizado: '',
    correo: '',
    firma: '',
    contraseña: ''
  };
  mostrarFirmaGrande: boolean = false;
  editando = false;
  formularioUsuario: FormGroup;
  mostrarContrasena = false;
  mensajeExito = false;
  constructor(private fb: FormBuilder, private usuarioService: UsuarioService) {
    this.formularioUsuario = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      apellidos: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      cargo: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      empresa: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      guardia: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      equipoAutorizado: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      correo: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/)]]
    });
  }

  ngOnInit(): void {
    this.cargarPerfil();
  }

  obtenerError(controlName: string): string {
    const control = this.formularioUsuario.get(controlName);

    if (control?.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (control?.hasError('pattern')) {
      if (['nombre', 'apellidos', 'cargo', 'empresa', 'guardia', 'equipoAutorizado'].includes(controlName)) {
        return 'Solo se permiten letras y espacios.';
      }
      if (controlName === 'contraseña') {
        return 'Debe contener al menos 6 caracteres, una mayúscula, una minúscula y un número.';
      }
    }

    if (controlName === 'correo' && control?.hasError('email')) {
      return 'El correo debe tener un formato válido (ej. usuario@dominio.com).';
    }

    return '';
  }

  Edicion() {
    this.formularioUsuario.patchValue({
      nombre: this.datosUsuario.nombre,
      apellidos: this.datosUsuario.apellidos,
      cargo: this.datosUsuario.cargo,
      empresa: this.datosUsuario.empresa,
      guardia: this.datosUsuario.guardia,
      equipoAutorizado: this.datosUsuario.equipoAutorizado,
      correo: this.datosUsuario.correo,
      contraseña: '' // No pasar la contraseña por seguridad
    });

    this.editando = !this.editando;
  }

  guardarCambios() {
    if (this.formularioUsuario.valid) {
      
      
  
      // Actualizar los datos sin perder otros atributos
      Object.assign(this.datosUsuario, this.formularioUsuario.value);
      
      this.mensajeExito = true;
      setTimeout(() => this.mensajeExito = false, 3000);
      this.Edicion();
    }else {
      this.formularioUsuario.markAllAsTouched(); // Resalta errores si el formulario es inválido
      
    }
}

toggleContrasena() {
  this.mostrarContrasena = !this.mostrarContrasena;
}

cambiarFirma() {
  

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.onchange = (event: any) => {
    const file = event.target.files[0];

    if (file) {
      // **Enviar la imagen al servidor**
      const formData = new FormData();
      formData.append('firma', file);

      this.usuarioService.actualizarFirma(this.datosUsuario.id ?? 0, formData).subscribe({
        next: (response) => {
          

          // **Volver a cargar los datos del usuario para obtener la firma actualizada**
          this.cargarPerfil();
        },
        error: (err) => {
          console.error("Error al actualizar la firma:", err);
        }
      });
    }
  };

  input.click();
}



eliminarFirma() {
  // Lógica para eliminar la firma
  
  const imgFirma = document.querySelector('.firma') as HTMLImageElement;
  if (imgFirma) {
      imgFirma.src = ''; // Elimina la imagen
  }
}
cargarPerfil(): void {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (data: Usuario) => {
        this.datosUsuario = {
          id: data.id,
          fotoPerfil: data.firma ? data.firma : 'assets/usuario.png', // Si tiene firma, se usa como foto
          nombre: data.nombres || '',
          apellidos: data.apellidos || '',
          cargo: data.cargo || '',
          empresa: data.empresa || '',
          guardia: data.guardia || '',
          equipoAutorizado: data.autorizado_equipo || '',
          correo: data.correo || '',
          firma: data.firma || '',
          contraseña: data.password || '',
        };
      },
      error: (err) => {
        console.error('Error al obtener perfil:', err);
      }
    });
  }
}


