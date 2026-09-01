import { Module } from '@nestjs/common';
import { ProformasController } from './infrastructure/controllers/proformas.controller.js';
import { ProformasService } from './application/services/proformas.service.js';

@Module({
    controllers: [ProformasController],
    providers: [ProformasService],
    exports: [ProformasService],
})
export class ProformasModule { }