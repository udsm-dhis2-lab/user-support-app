import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { validationRulesPages } from './pages';
import {
  entryValidationRulesRequestComponents,
  validationRulesRequestComponents,
} from './components';
import { ValidationRulesRequestRoutingModule } from './validation-rules-routing.module';

@NgModule({
  declarations: [...validationRulesRequestComponents, ...validationRulesPages],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ValidationRulesRequestRoutingModule,
  ],
  entryComponents: [...entryValidationRulesRequestComponents],
})
export class ValidationRulesRequestModule {}
