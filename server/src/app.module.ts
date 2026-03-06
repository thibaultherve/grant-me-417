import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { PostcodesModule } from './postcodes/postcodes.module.js';
import { EmployersModule } from './employers/employers.module.js';
import { ChangelogsModule } from './changelogs/changelogs.module.js';
import { VisasModule } from './visas/visas.module.js';
import { WorkEntriesModule } from './work-entries/work-entries.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostcodesModule,
    EmployersModule,
    ChangelogsModule,
    VisasModule,
    WorkEntriesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
