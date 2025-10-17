import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BusinessService } from '../../services/business.service';
import { IBusiness } from '../../models/business';

@Component({
  selector: 'app-business',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.css']
})
export class BusinessComponent implements OnInit {
  businessForm!: FormGroup;
  successMessage = '';
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private businessService: BusinessService
  ) {}

  ngOnInit(): void {
    this.businessForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: [''],
      phone: ['', [Validators.pattern('^[0-9]{9,15}$')]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /** ✅ Registrar un nuevo negocio */
  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.businessForm.invalid) {
      this.errorMessage = 'Por favor, completa correctamente los campos requeridos.';
      return;
    }

    this.isSubmitting = true;
    const newBusiness: Partial<IBusiness> = {
      ...this.businessForm.value,
      active: true
    };

    this.businessService.createBusiness(newBusiness).subscribe({
      next: (business) => {
        this.successMessage = `Negocio "${business.name}" registrado correctamente.`;
        this.businessForm.reset();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Hubo un error al registrar el negocio.';
        this.isSubmitting = false;
      }
    });
  }

  /** 🔹 Accesos rápidos para validaciones */
  get f() {
    return this.businessForm.controls;
  }
}
