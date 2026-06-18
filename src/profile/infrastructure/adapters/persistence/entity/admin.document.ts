import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { UserDocument } from './user.document';
import { UserType } from './user-type.enum';

export type AdminDocumentType = HydratedDocument<AdminDocument>;

@Schema()
export class AdminDocument extends UserDocument {
  constructor() {
    super();
    this.userType = UserType.ADMIN;
  }
}

export const AdminDocumentSchema: MongooseSchema =
  SchemaFactory.createForClass(AdminDocument);
