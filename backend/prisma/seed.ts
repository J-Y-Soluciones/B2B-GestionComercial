// backend/prisma/seed.ts
import { PrismaClient, Prisma, Role, CustomerType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
    console.log('Iniciando seeding con RBAC dinámico e inventario multiproveedor...');

    // 1. Limpieza en orden estricto de claves foráneas
    await prisma.passwordResetToken.deleteMany();
    await prisma.profileModule.deleteMany();
    await prisma.proformaStatusLog.deleteMany();
    await prisma.proformaDetail.deleteMany();
    await prisma.proforma.deleteMany();
    await prisma.priceTier.deleteMany();
    await prisma.supplierProductStock.deleteMany();
    await prisma.product.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
    await prisma.module.deleteMany();
    await prisma.profile.deleteMany();

    // 2. Módulos del Sistema
    const modProformas = await prisma.module.create({
        data: { name: 'Proformas', code: 'PROFORMAS', path: '/proformas', icon: 'file-text' },
    });
    const modCatalog = await prisma.module.create({
        data: { name: 'Catálogo e Inventario', code: 'CATALOG', path: '/catalog', icon: 'package' },
    });
    const modCustomers = await prisma.module.create({
        data: { name: 'Clientes', code: 'CUSTOMERS', path: '/customers', icon: 'users' },
    });
    const modApprovals = await prisma.module.create({
        data: { name: 'Aprobaciones', code: 'APPROVALS', path: '/approvals', icon: 'check-circle' },
    });

    // 3. Perfiles (Profiles)
    const profileAdmin = await prisma.profile.create({
        data: { name: 'Administrador', description: 'Acceso total y configuración de la tienda' },
    });
    const profileManager = await prisma.profile.create({
        data: { name: 'Gerente', description: 'Supervisión de almacén y aprobación de precio 3' },
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

    // Permisos para Vendedor
    for (const m of [modProformas, modCatalog, modCustomers]) {
        await prisma.profileModule.create({
            data: { profileId: profileSeller.id, moduleId: m.id, canCreate: true, canRead: true, canUpdate: false, canDelete: false },
        });
    }

    // 5. Usuarios Base con dominio comercial de la tienda
    const defaultPassword = await bcrypt.hash('Vortex2024!', 10);
    await prisma.user.createMany({
        data: [
            { email: 'admin@repuestos.com', passwordHash: defaultPassword, role: Role.ADMIN, profileId: profileAdmin.id, isActive: true },
            { email: 'gerente@repuestos.com', passwordHash: defaultPassword, role: Role.MANAGER, profileId: profileManager.id, isActive: true },
            { email: 'vendedor@repuestos.com', passwordHash: defaultPassword, role: Role.SELLER, profileId: profileSeller.id, isActive: true },
            { email: 'almacen@repuestos.com', passwordHash: defaultPassword, role: Role.WAREHOUSE, profileId: null, isActive: true },
        ],
    });

    // 6. Clientes
    await prisma.customer.createMany({
        data: [
            { type: CustomerType.NATURAL, documentNumber: '71234567', name: 'Juan Pérez', email: 'juan.perez@empresa.com', phone: '987654321' },
            { type: CustomerType.BUSINESS, documentNumber: '20123456789', name: 'Transportes del Norte SAC', email: 'logistica@transportesnorte.com', phone: '014445555', address: 'Av. Los Motores 123, Lima' },
        ],
    });

    // 7. Proveedores Base
    const supplierBosch = await prisma.supplier.create({
        data: {
            ruc: '20501234561',
            name: 'Distribuidora Automotriz Bosch Perú SAC',
            contactName: 'Carlos Mendívil',
            phone: '998877665',
            email: 'ventas@boschrepuestos.pe',
            isActive: true,
        },
    });

    const supplierImports = await prisma.supplier.create({
        data: {
            ruc: '20609876543',
            name: 'Importaciones y Repuestos del Pacífico EIRL',
            contactName: 'Mariana Silva',
            phone: '912345678',
            email: 'comercial@repuestospacifico.pe',
            isActive: true,
        },
    });

    // 8. Catálogo con Brand, Matriz de 3 Precios y Stock por Proveedor
    const catalog = [
        {
            code: 'BOSCH-PF-01',
            name: 'Pastillas de Freno Bosch Delanteras',
            brand: 'Bosch',
            cat: 'Frenos',
            minStock: 6,
            p1: 120.0,
            p2: 105.0,
            p3: 95.0,
            stockInfo: {
                supplierId: supplierBosch.id,
                sku: 'BOSCH-BP-994',
                cost: 68.5,
                qty: 24,
            },
        },
        {
            code: 'FRAM-FA-02',
            name: 'Filtro de Aceite Blindado Fram',
            brand: 'Fram',
            cat: 'Filtros',
            minStock: 10,
            p1: 35.0,
            p2: 30.0,
            p3: 25.0,
            stockInfo: {
                supplierId: supplierImports.id,
                sku: 'FRAM-PH-3593A',
                cost: 16.0,
                qty: 40,
            },
        },
        {
            code: 'NGK-BJ-03',
            name: 'Bujía Láser Iridium NGK',
            brand: 'NGK',
            cat: 'Encendido',
            minStock: 8,
            p1: 45.0,
            p2: 40.0,
            p3: 36.0,
            stockInfo: {
                supplierId: supplierImports.id,
                sku: 'NGK-ILZKR7B-11',
                cost: 21.0,
                qty: 32,
            },
        },
    ];

    for (const item of catalog) {
        const prod = await prisma.product.create({
            data: {
                internalCode: item.code,
                name: item.name,
                brand: item.brand,
                category: item.cat,
                minStock: item.minStock,
                isActive: true,
            },
        });

        // Niveles de precio de venta
        await prisma.priceTier.createMany({
            data: [
                { productId: prod.id, tier: 1, price: new Prisma.Decimal(item.p1) },
                { productId: prod.id, tier: 2, price: new Prisma.Decimal(item.p2) },
                { productId: prod.id, tier: 3, price: new Prisma.Decimal(item.p3) },
            ],
        });

        // Inventario y costo asignado al proveedor
        await prisma.supplierProductStock.create({
            data: {
                productId: prod.id,
                supplierId: item.stockInfo.supplierId,
                supplierSku: item.stockInfo.sku,
                stock: item.stockInfo.qty,
                costPrice: new Prisma.Decimal(item.stockInfo.cost),
            },
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