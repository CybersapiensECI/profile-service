import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DayOfWeekEnum } from '../../../../domain/model/enum';

@Schema({ _id: false })
export class ScheduleDocument {
  @Prop({ required: true, enum: DayOfWeekEnum })
  dayOfWeek: DayOfWeekEnum;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;
}

export const ScheduleDocumentSchema =
  SchemaFactory.createForClass(ScheduleDocument);
