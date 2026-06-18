import { InvalidInputException } from '../exceptions/invalid-input.exception';

export class Biography {
  readonly value: string | null;

  constructor(value: string | null) {
    if (value != null && value.length > 200) {
      throw new InvalidInputException(
        'The biography cannot exceed 200 characters',
      );
    }
    this.value = value;
  }

  getValue(): string | null {
    return this.value;
  }
}
