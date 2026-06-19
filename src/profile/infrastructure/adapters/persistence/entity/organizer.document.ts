import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { UserDocument } from './user.document';
import { UserType } from './user-type.enum';

export type OrganizerDocumentType = HydratedDocument<OrganizerDocument>;

@Schema()
export class OrganizerDocument extends UserDocument {
  constructor() {
    super();
    this.userType = UserType.ORGANIZER;
  }

  @Prop({ type: String, default: null })
  contactInfo: string | null = null;
}

export const OrganizerDocumentSchema: MongooseSchema =
  SchemaFactory.createForClass(OrganizerDocument);
