import { InvalidInputException } from '../exceptions/invalid-input.exception';
import { GenderEnum } from './enum';

export abstract class User {
  id: string;
  createdAt: Date;
  private _name: string;
  private _gender: GenderEnum;
  private _dateOfBirth: Date | null = null;

  // --- name ---
  get name(): string {
    return this._name;
  }
  set name(value: string) {
    if (!value || value.trim().length < 2 || value.trim().length > 50) {
      throw new InvalidInputException(
        'Name must be between 2 and 50 characters',
      );
    }
    this._name = value.trim();
  }

  // --- gender ---
  get gender(): GenderEnum {
    return this._gender;
  }
  set gender(value: GenderEnum) {
    if (value == null) {
      throw new InvalidInputException('Gender must not be null');
    }
    this._gender = value;
  }

  // --- dateOfBirth ---
  get dateOfBirth(): Date | null {
    return this._dateOfBirth;
  }
  set dateOfBirth(value: Date | null) {
    if (value && value >= new Date()) {
      throw new InvalidInputException('Date of birth must be a past date');
    }
    this._dateOfBirth = value;
  }
}
