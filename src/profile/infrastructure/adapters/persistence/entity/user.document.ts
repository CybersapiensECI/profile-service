import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { GenderEnum } from '../../../../domain/model/enum';
import { UserType } from './user-type.enum';

export type UserDocumentType = HydratedDocument<UserDocument>;

@Schema({
  collection: 'users',
  discriminatorKey: 'userType',
  timestamps: { createdAt: 'createdAt', updatedAt: false },
})
export class UserDocument {
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  _id!: unknown;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, enum: GenderEnum })
  gender!: GenderEnum;

  @Prop({ type: Date, default: null })
  birthdate: Date | null = null;

  createdAt!: Date;

  userType!: UserType;
}

export const UserDocumentSchema: MongooseSchema =
  SchemaFactory.createForClass(UserDocument);
