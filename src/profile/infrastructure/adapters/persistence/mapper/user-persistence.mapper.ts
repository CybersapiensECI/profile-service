import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Admin } from '../../../../domain/model/admin';
import { Organizer } from '../../../../domain/model/organizer';
import { Schedule } from '../../../../domain/model/schedule';
import { Student } from '../../../../domain/model/student';
import { User } from '../../../../domain/model/user.entity';
import { AdminDocument } from '../entity/admin.document';
import { OrganizerDocument } from '../entity/organizer.document';
import { ScheduleDocument } from '../entity/schedule.document';
import { StudentDocument } from '../entity/student.document';
import { UserDocument } from '../entity/user.document';
import { UserType } from '../entity/user-type.enum';

@Injectable()
export class UserPersistenceMapper {
  // ─── Domain → Document ───────────────────────────────────────────────────────

  studentToDocument(profile: Student): StudentDocument {
    const doc = new StudentDocument();
    doc._id = profile.id ?? randomUUID();
    doc.name = profile.name;
    doc.gender = profile.gender;
    doc.dateOfBirth = profile.dateOfBirth;
    doc.createdAt = profile.createdAt ?? new Date();
    doc.userType = UserType.STUDENT;
    doc.career = profile.career;
    doc.semester = profile.semester;
    doc.studentCarnet = profile.studentCarnet;
    doc.photoUrl = profile.photoUrl;
    doc.biography = profile.biography;
    doc.privacyLevel = profile.privacyLevel;
    doc.geolocationEnabled = profile.geolocationEnabled;
    doc.schedulesAvailability = profile.schedulesAvailability.map((s) =>
      this.scheduleToDocument(s),
    );
    doc.tagsId = profile.tagsId;
    doc.friendsId = profile.friendsId;
    doc.xp = profile.xp;
    doc.level = profile.level;
    doc.isActive = profile.isActive;
    return doc;
  }

  adminToDocument(admin: Admin): AdminDocument {
    const doc = new AdminDocument();
    doc._id = admin.id ?? randomUUID();
    doc.name = admin.name;
    doc.gender = admin.gender;
    doc.dateOfBirth = admin.dateOfBirth;
    doc.createdAt = admin.createdAt ?? new Date();
    doc.userType = UserType.ADMIN;
    return doc;
  }

  organizerToDocument(organizer: Organizer): OrganizerDocument {
    const doc = new OrganizerDocument();
    doc._id = organizer.id ?? randomUUID();
    doc.name = organizer.name;
    doc.gender = organizer.gender;
    doc.dateOfBirth = organizer.dateOfBirth;
    doc.createdAt = organizer.createdAt ?? new Date();
    doc.userType = UserType.ORGANIZER;
    doc.contactInfo = organizer.contactInfo;
    return doc;
  }

  scheduleToDocument(schedule: Schedule): ScheduleDocument {
    const doc = new ScheduleDocument();
    doc.dayOfWeek = schedule.dayOfWeek;
    doc.name = schedule.name;
    doc.startTime = schedule.startTime;
    doc.endTime = schedule.endTime;
    return doc;
  }

  // ─── Document → Domain ───────────────────────────────────────────────────────

  studentToDomain(doc: StudentDocument): Student {
    const student = new Student();
    student.id = doc._id;
    student.name = doc.name;
    student.gender = doc.gender;
    student.dateOfBirth = doc.dateOfBirth;
    student.createdAt = doc.createdAt;
    student.career = doc.career;
    student.semester = doc.semester;
    student.studentCarnet = doc.studentCarnet;
    student.photoUrl = doc.photoUrl;
    student.biography = doc.biography;
    student.privacyLevel = doc.privacyLevel;
    student.geolocationEnabled = doc.geolocationEnabled;
    student.schedulesAvailability = (doc.schedulesAvailability ?? []).map((s) =>
      this.scheduleDocumentToDomain(s),
    );
    student.tagsId = doc.tagsId ?? [];
    student.friendsId = doc.friendsId ?? [];
    student.xp = doc.xp;
    student.level = doc.level;
    student.isActive = doc.isActive;
    return student;
  }

  adminToDomain(doc: AdminDocument): Admin {
    const admin = new Admin();
    admin.id = doc._id;
    admin.name = doc.name;
    admin.gender = doc.gender;
    admin.dateOfBirth = doc.dateOfBirth;
    admin.createdAt = doc.createdAt;
    return admin;
  }

  organizerToDomain(doc: OrganizerDocument): Organizer {
    const organizer = new Organizer();
    organizer.id = doc._id;
    organizer.name = doc.name;
    organizer.gender = doc.gender;
    organizer.dateOfBirth = doc.dateOfBirth;
    organizer.createdAt = doc.createdAt;
    organizer.contactInfo = doc.contactInfo;
    return organizer;
  }

  scheduleDocumentToDomain(doc: ScheduleDocument): Schedule {
    return new Schedule(doc.dayOfWeek, doc.name, doc.startTime, doc.endTime);
  }

  toDomainByType(doc: UserDocument): User | null {
    if (!doc?.userType) return null;
    switch (doc.userType) {
      case UserType.STUDENT:
        return this.studentToDomain(doc as unknown as StudentDocument);
      case UserType.ADMIN:
        return this.adminToDomain(doc as unknown as AdminDocument);
      case UserType.ORGANIZER:
        return this.organizerToDomain(doc as unknown as OrganizerDocument);
    }
  }

  toDomainList(docs: StudentDocument[]): Student[] {
    return (docs ?? []).map((d) => this.studentToDomain(d));
  }
}
