import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { Field } from '../../models/field.model';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent {
  @Input() field: Field<string>;
  @Input() isReport: boolean;
  @Input() value: any;
  @Input() form: FormGroup;
  @Input() isCheckBoxButton: boolean;
  @Input() fieldClass: string;
  @Input() shouldDisable: boolean;
  members$: Observable<any[]> = of([{ id: 'searching', display: 'Search' }]);

  constructor() {}

  @Output() fieldUpdate: EventEmitter<FormGroup> =
    new EventEmitter<FormGroup>();

  get isValid(): boolean {
    return this.form?.controls[this.field.id]?.valid;
  }

  get isDate(): boolean {
    return this.field.controlType === 'date';
  }

  get isBoolean(): boolean {
    return this.field.controlType === 'boolean';
  }

  get isCommonField(): boolean {
    return !this.isCheckBoxButton && !this.isDate && !this.isBoolean;
  }

  get fieldId(): string {
    return this.field?.id;
  }

  onFieldUpdate(): void {
    this.fieldUpdate.emit(this.form);
  }

  get getOptionValue(): any {
    const matchedOption = (this.field.options.filter(
      (option) => option?.key === this.value
    ) || [])[0];
    return matchedOption ? matchedOption?.value : '';
  }

  searchItem(event: any): void {
    event.stopPropagation();
    const searchingText = event.target.value;
    this.members$ = of([]);
  }

  getSelectedItemFromOption(event: Event, item, key): void {
    event.stopPropagation();
    const value = item?.isDrug ? item?.formattedKey : item?.uuid;
    let objectToUpdate = {};
    objectToUpdate[key] = value;
    this.form.patchValue(objectToUpdate);
    this.fieldUpdate.emit(this.form);
  }
}
