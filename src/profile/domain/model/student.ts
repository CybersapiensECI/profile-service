import { InvalidInputException } from '../exceptions/invalid-input.exception';
import { Biography } from '../valueobjects/biography';
import { StudentCarnet } from '../valueobjects/student-carnet';
import { CareerEnum, PrivacyLevelEnum } from './enum';
import { Schedule } from './schedule';
import { User } from './user.entity';

export class Student extends User {
  private _career!: CareerEnum;
  private _semester: number | null = null;
  private _studentCarnet: StudentCarnet | null = null;
  private _photoUrl: string | null =
    'https://res.cloudinary.com/dm0a7zugg/image/upload/v1781744092/imagen_2026-06-17_195519884_na0xne.png';
  private _biography: Biography | null = null;
  private _privacyLevel!: PrivacyLevelEnum;

  geolocationEnabled: boolean = false;
  schedulesAvailability: Schedule[] = [];
  tagsId: string[] = [];
  friendsId: string[] = [];
  xp: number = 0;
  level: number = 1;
  isActive: boolean = false;

  // --- career ---
  get career(): CareerEnum {
    return this._career;
  }
  set career(value: CareerEnum) {
    if (value == null)
      throw new InvalidInputException('Career must not be null');
    this._career = value;
  }

  // --- semester ---
  get semester(): number | null {
    return this._semester;
  }
  set semester(value: number | null) {
    if (value != null && (value < 1 || value > 10)) {
      throw new InvalidInputException('Semester must be between 1 and 10');
    }
    this._semester = value;
  }

  // --- studentCarnet ---
  get studentCarnet(): string | null {
    return this._studentCarnet?.value ?? null;
  }
  set studentCarnet(value: string | null) {
    this._studentCarnet =
      value && value.trim().length > 0 ? new StudentCarnet(value) : null;
  }

  // --- photoUrl ---
  get photoUrl(): string | null {
    return this._photoUrl;
  }
  set photoUrl(value: string | null) {
    if (value != null && value.trim().length === 0) {
      throw new InvalidInputException('Photo URL must not be blank');
    }
    this._photoUrl = value;
  }

  // --- biography ---
  get biography(): string | null {
    return this._biography?.value ?? null;
  }
  set biography(value: string | null) {
    this._biography = new Biography(value);
  }

  // --- privacyLevel ---
  get privacyLevel(): PrivacyLevelEnum {
    return this._privacyLevel;
  }
  set privacyLevel(value: PrivacyLevelEnum) {
    if (value == null)
      throw new InvalidInputException('Privacy level must not be null');
    this._privacyLevel = value;
  }
}
