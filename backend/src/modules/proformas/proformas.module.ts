// backend/src/modules/proformas/proformas.module.ts
import { Module } from '@nestjs/common';
import { ProformaController } from './infrastructure/controllers/proformas.controller.js';
import { ProformaService } from './application/services/proformas.service.js';
import { PrismaProformaRepository } from './infrastructure/repositories/prisma-proforma.repository.js';
import { PROFORMA_REPOSITORY } from './domain/repositories/proforma.repository.interface.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';
import { ProformaPdfService } from './application/services/proforma-pdf.service.js';

@Module({
    imports: [PrismaModule],
    controllers: [ProformaController],
    providers: [
        {
            provide: PROFORMA_REPOSITORY,
            useClass: PrismaProformaRepository,
        },
        ProformaService,
        ProformaPdfService,
    ],
    exports: [ProformaService, PROFORMA_REPOSITORY],
})
export class ProformasModule { }