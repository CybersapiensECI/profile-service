import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Connection } from 'mongoose';

@Injectable()
export class StartupDependencyCheck implements OnApplicationBootstrap {
  private readonly logger = new Logger(StartupDependencyCheck.name);

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const checksEnabled = process.env['APP_STARTUP_CHECKS_ENABLED'] === 'true';
    if (!checksEnabled) {
      this.logger.warn('Startup dependency checks are disabled (APP_STARTUP_CHECKS_ENABLED != true)');
      return;
    }
    await this.checkMongo();
    await this.checkCloudinary();
    this.logger.log(
      'Startup dependency checks passed: MongoDB and Cloudinary are reachable',
    );
  }

  private async checkMongo(): Promise<void> {
    try {
      if (!this.mongoConnection.db) throw new Error('DB not initialized');
      await this.mongoConnection.db.command({ ping: 1 });
    } catch (e) {
      throw new Error('Startup failed: cannot connect to MongoDB');
    }
  }

  private async checkCloudinary(): Promise<void> {
    try {
      await cloudinary.api.ping();
    } catch (e) {
      throw new Error('Startup failed: cannot connect to Cloudinary');
    }
  }
}
