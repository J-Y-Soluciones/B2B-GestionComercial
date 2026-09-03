import { PrismaClient, Prisma, Role, CustomerType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
    console.log('Iniciando seeding con RBAC dinámico...');

    // 1. Limpieza en orden de dependencias
    await prisma.passwordResetToken.deleteMany();
    await prisma.profileModule.deleteMany();
    await prisma.proformaStatusLog.deleteMany();
    await prisma.proformaDetail.deleteMany();
    await prisma.proforma.deleteMany();
    await prisma.priceTier.deleteMany();
    await prisma.product.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
    await prisma.module.deleteMany();
    await prisma.profile.deleteMany();

    // 2. Módulos del Sistema
    const modProformas = await prisma.module.create({
        data: { name: 'Proformas', code: 'PROFORMAS', path: '/proformas', icon: 'file-text' },
    });
    const modCatalog = await prisma.module.create({
        data: { name: 'Catálogo de Repuestos', code: 'CATALOG', path: '/catalog', icon: 'package' },
    });
    const modCustomers = await prisma.module.create({
        data: { name: 'Clientes', code: 'CUSTOMERS', path: '/customers', icon: 'users' },
    });
    const modApprovals = await prisma.module.create({
        data: { name: 'Aprobaciones', code: 'APPROVALS', path: '/approvals', icon: 'check-circle' },
    });

    // 3. Perfiles (Profiles)
    const profileAdmin = await prisma.profile.create({
        data: { name: 'Administrador', description: 'Acceso total y configuración' },
    });
    const profileManager = await prisma.profile.create({
        data: { name: 'Gerente', description: 'Supervisión y aprobación de precios especiales' },
    });
    const profileSeller = await prisma.profile.create({
        data: { name: 'Vendedor', description: 'Emisión de proformas y registro de clientes' },
    });

    // 4. Asignación de Permisos (ProfileModule)
    const allModules = [modProformas, modCatalog, modCustomers, modApprovals];
    for (const m of allModules) {
        await prisma.profileModule.create({
            data: { profileId: profileAdmin.id, moduleId: m.id, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
        });
        await prisma.profileModule.create({
            data: { profileId: profileManager.id, moduleId: m.id, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
        });
    }

    // Permisos para Vendedor (sin acceso al módulo de aprobaciones)
    for (const m of [modProformas, modCatalog, modCustomers]) {
        await prisma.profileModule.create({
            data: { profileId: profileSeller.id, moduleId: m.id, canCreate: true, canRead: true, canUpdate: false, canDelete: false },
        });
    }

    // 5. Usuarios Base con Perfil vinculado
    const defaultPassword = await bcrypt.hash('Vortex2024!', 10);
    await prisma.user.createMany({
        data: [
            { email: 'admin@vortexyolti.com', passwordHash: defaultPassword, role: Role.ADMIN, profileId: profileAdmin.id, isActive: true },
            { email: 'gerente@vortexyolti.com', passwordHash: defaultPassword, role: Role.MANAGER, profileId: profileManager.id, isActive: true },
            { email: 'vendedor@vortexyolti.com', passwordHash: defaultPassword, role: Role.SELLER, profileId: profileSeller.id, isActive: true },
            { email: 'almacen@vortexyolti.com', passwordHash: defaultPassword, role: Role.WAREHOUSE, profileId: null, isActive: true },
        ],
    });

    // 6. Clientes
    await prisma.customer.createMany({
        data: [
            { type: CustomerType.NATURAL, documentNumber: '71234567', name: 'Juan Pérez', email: 'juan.perez@email.com', phone: '987654321' },
            { type: CustomerType.BUSINESS, documentNumber: '20123456789', name: 'Transportes del Norte SAC', email: 'logistica@transportesnorte.com', phone: '014445555', address: 'Av. Los Motores 123, Lima' },
        ],
    });

    // 7. Productos con 3 Tiers
    const products = [
        { code: 'BOSCH-PF-01', name: 'Pastillas de Freno Bosch', cat: 'Frenos', p1: 120.0, p2: 105.0, p3: 95.0 },
        { code: 'FRAM-FA-02', name: 'Filtro de Aceite Fram', cat: 'Filtros', p1: 35.0, p2: 30.0, p3: 25.0 },
        { code: 'NGK-BJ-03', name: 'Bujía Iridium NGK', cat: 'Encendido', p1: 45.0, p2: 40.0, p3: 36.0 },
    ];

    for (const p of products) {
        const prod = await prisma.product.create({
            data: { internalCode: p.code, name: p.name, category: p.cat, isActive: true },
        });
        await prisma.priceTier.createMany({
            data: [
                { productId: prod.id, tier: 1, price: new Prisma.Decimal(p.p1) },
                { productId: prod.id, tier: 2, price: new Prisma.Decimal(p.p2) },
                { productId: prod.id, tier: 3, price: new Prisma.Decimal(p.p3) },
            ],
        });
    }

    console.log('Seeding completado con éxito.');
}

main()
    .catch((e) => {
        console.error('Error durante el seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });