import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Binary } from 'bson';
import { UserDocument } from '../entity/user.document';
import { StudentDocument } from '../entity/student.document';
import { AdminDocument } from '../entity/admin.document';
import { OrganizerDocument } from '../entity/organizer.document';
import { UserType } from '../entity/user-type.enum';

const HEX_32_RE = /^[0-9a-f]{32}$/i;

@Injectable()
export class UserMongoRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Student/Admin/Organizer-only fields (career, tagsId, contactInfo, ...)
   * live on their discriminator schema, not on the base UserDocument one.
   * findOneAndUpdate() casts the update payload against whatever model it's
   * called on, so running it on the base model silently strips every field
   * the base schema doesn't know about -- e.g. every write via the base
   * model dropped tagsId. Route through the matching discriminator model.
   */
  private modelForUserType(userType: UserType | undefined): Model<UserDocument> {
    const name =
      userType === UserType.STUDENT
        ? StudentDocument.name
        : userType === UserType.ADMIN
          ? AdminDocument.name
          : userType === UserType.ORGANIZER
            ? OrganizerDocument.name
            : undefined;
    const discriminator = name ? this.userModel.discriminators?.[name] : undefined;
    return (discriminator as Model<UserDocument> | undefined) ?? this.userModel;
  }

  async save(user: UserDocument): Promise<UserDocument> {
    return this.userModel.create(user);
  }

  async findById(id: string): Promise<UserDocument | null> {
    const byString = await this.userModel.findOne({ _id: id }).exec();
    if (byString) return byString;
    // Fallback: old Java data stores _id as BSON Binary UUID (subtype 3 or 4).
    if (HEX_32_RE.test(id)) {
      const buf = Buffer.from(id, 'hex');
      return (
        (await this.userModel.findOne({ _id: new Binary(buf, 3) }).exec()) ??
        this.userModel.findOne({ _id: new Binary(buf, 4) }).exec()
      );
    }
    return null;
  }

  async findByUserType(userType: UserType): Promise<UserDocument[]> {
    return this.userModel.find({ userType }).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findAllByIds(ids: string[]): Promise<UserDocument[]> {
    const binaryIds = ids
      .filter((id) => HEX_32_RE.test(id))
      .flatMap((id) => {
        const buf = Buffer.from(id, 'hex');
        return [new Binary(buf, 3), new Binary(buf, 4)];
      });
    return this.userModel.find({ _id: { $in: [...ids, ...binaryIds] } }).exec();
  }

  async update(
    id: string,
    data: Partial<UserDocument>,
  ): Promise<UserDocument | null> {
    const model = this.modelForUserType(data.userType);
    const byString = await model
      .findOneAndUpdate({ _id: id }, data, { new: true })
      .exec();
    if (byString) return byString;
    if (HEX_32_RE.test(id)) {
      const buf = Buffer.from(id, 'hex');
      return (
        (await model
          .findOneAndUpdate({ _id: new Binary(buf, 3) }, data, { new: true })
          .exec()) ??
        model
          .findOneAndUpdate({ _id: new Binary(buf, 4) }, data, { new: true })
          .exec()
      );
    }
    return null;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findOneAndDelete({ _id: id }).exec();
    if (!result && HEX_32_RE.test(id)) {
      const buf = Buffer.from(id, 'hex');
      const bySubtype3 = await this.userModel
        .findOneAndDelete({ _id: new Binary(buf, 3) })
        .exec();
      if (!bySubtype3) {
        await this.userModel
          .findOneAndDelete({ _id: new Binary(buf, 4) })
          .exec();
      }
    }
  }
}
