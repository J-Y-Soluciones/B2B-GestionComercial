import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class DemoProtectionGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const isDemo = process.env.IS_DEMO_MODE === 'true';
        if (!isDemo) return true;

        const req = context.switchToHttp().getRequest();
        const method = req.method;
        const path = req.url;

        // Permitir flujo comercial completo: GET, POST (crear proformas, simular ventas, agregar clientes)
        // Bloquear acciones destructivas o cambios de usuarios/perfiles en la demo
        if (method === 'DELETE') {
            throw new ForbiddenException('La eliminación de registros está deshabilitada en la versión Demo.');
        }

        if ((method === 'PUT' || method === 'PATCH') && path.includes('/users')) {
            throw new ForbiddenException('No está permitido modificar usuarios ni credenciales en la versión Demo.');
        }

        return true;
    }
}