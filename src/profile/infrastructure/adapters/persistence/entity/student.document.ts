import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { CareerEnum, PrivacyLevelEnum } from '../../../../domain/model/enum';
import { ScheduleDocument, ScheduleDocumentSchema } from './schedule.document';
import { UserDocument } from './user.document';
import { UserType } from './user-type.enum';

export type StudentDocumentType = HydratedDocument<StudentDocument>;

@Schema()
export class StudentDocument extends UserDocument {
  constructor() {
    super();
    this.userType = UserType.STUDENT;
  }

  @Prop({ required: true, enum: CareerEnum })
  career!: CareerEnum;

  @Prop({ type: Number, default: null })
  semester: number | null = null;

  @Prop({ type: String, default: null })
  studentCarnet: string | null = null;

  // Java Spring stored this field as 'photo', not 'photoUrl'.
  @Prop({ type: String, default: null })
  photo: string | null = null;

  @Prop({ type: String, default: null })
  biography: string | null = null;

  @Prop({ required: true, enum: PrivacyLevelEnum })
  privacyLevel!: PrivacyLevelEnum;

  @Prop({ default: false })
  geolocationEnabled: boolean = false;

  // Java Spring stored this field as 'scheduleAvailability' (singular).
  @Prop({ type: [ScheduleDocumentSchema], default: [] })
  scheduleAvailability: ScheduleDocument[] = [];

  @Prop({ type: [String], default: [] })
  tagsId: string[] = [];

  @Prop({ type: [String], default: [] })
  friendsId: string[] = [];

  @Prop({ default: 0 })
  xp: number = 0;

  @Prop({ default: 1 })
  level: number = 1;

  @Prop({ default: false })
  isActive: boolean = false;
}

export const StudentDocumentSchema: MongooseSchema =
  SchemaFactory.createForClass(StudentDocument);
