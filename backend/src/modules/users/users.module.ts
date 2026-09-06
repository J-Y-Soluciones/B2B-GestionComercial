import { Module } from '@nestjs/common';
import { UserController } from './infrastructure/controllers/user.controller.js';
import { UsersService } from './application/services/users.service.js';

@Module({
    controllers: [UserController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }