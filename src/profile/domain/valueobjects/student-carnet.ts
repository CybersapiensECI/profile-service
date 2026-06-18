import { InvalidInputException } from '../exceptions/invalid-input.exception';

export class StudentCarnet {
  readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new InvalidInputException('The carnet cannot be null or empty');
    }
    if (!/^\d{10}$/.test(value)) {
      throw new InvalidInputException('The carnet must have exactly 10 digits');
    }
    this.value = value;
  }
}
