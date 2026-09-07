// backend/prisma/seed.ts
import { PrismaClient, Prisma, Role, CustomerType, ProformaStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
    console.log('Iniciando seeding con RBAC dinámico, inventario multi-proveedor y proformas de prueba...');

    // 1. Limpieza en orden estricto de dependencias foráneas
    await prisma.payment.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.saleDetail.deleteMany();
    await prisma.sale.deleteMany();

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
    const modUsers = await prisma.module.create({
        data: { name: 'Usuarios y Perfiles', code: 'USERS', path: '/users', icon: 'shield' },
    });

    // 3. Perfiles (Profiles)
    const profileAdmin = await prisma.profile.create({
        data: { name: 'Administrador', description: 'Acceso total y configuración de la tienda' },
    });
    const profileManager = await prisma.profile.create({
        data: { name: 'Gerente Comercial', description: 'Supervisión de almacén y aprobación de precio 3' },
    });
    const profileSeller = await prisma.profile.create({
        data: { name: 'Vendedor', description: 'Emisión de proformas y registro de clientes' },
    });
    const profileWarehouse = await prisma.profile.create({
        data: { name: 'Almacén', description: 'Gestión y consulta de stock disponible' },
    });

    // 4. Asignación de Permisos (ProfileModule)
    const allModules = [modProformas, modCatalog, modCustomers, modApprovals, modUsers];

    for (const m of allModules) {
        await prisma.profileModule.create({
            data: { profileId: profileAdmin.id, moduleId: m.id, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
        });
    }

    for (const m of [modProformas, modCatalog, modCustomers, modApprovals]) {
        await prisma.profileModule.create({
            data: { profileId: profileManager.id, moduleId: m.id, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
        });
    }

    for (const m of [modProformas, modCatalog, modCustomers]) {
        await prisma.profileModule.create({
            data: { profileId: profileSeller.id, moduleId: m.id, canCreate: true, canRead: true, canUpdate: false, canDelete: false },
        });
    }

    await prisma.profileModule.create({
        data: { profileId: profileWarehouse.id, moduleId: modCatalog.id, canCreate: false, canRead: true, canUpdate: true, canDelete: false },
    });

    // 5. Usuarios Base
    const defaultPassword = await bcrypt.hash('Vortex2024!', 10);

    const userAdmin = await prisma.user.create({
        data: { email: 'admin@repuestos.com', passwordHash: defaultPassword, role: Role.ADMIN, profileId: profileAdmin.id, isActive: true },
    });
    const userManager = await prisma.user.create({
        data: { email: 'gerente@repuestos.com', passwordHash: defaultPassword, role: Role.MANAGER, profileId: profileManager.id, isActive: true },
    });
    const userSeller = await prisma.user.create({
        data: { email: 'vendedor@repuestos.com', passwordHash: defaultPassword, role: Role.SELLER, profileId: profileSeller.id, isActive: true },
    });
    await prisma.user.create({
        data: { email: 'almacen@repuestos.com', passwordHash: defaultPassword, role: Role.WAREHOUSE, profileId: profileWarehouse.id, isActive: true },
    });

    // 6. Clientes Base (Incluyendo Comodín para Mostrador / Clientes Varios)
    const customerComodin = await prisma.customer.create({
        data: {
            type: CustomerType.NATURAL,
            documentNumber: '00000000',
            name: 'CLIENTES VARIOS (MOSTRADOR)',
            email: 'mostrador@repuestos.com',
            phone: '000000000',
            address: 'Venta Directa de Mostrador',
        },
    });

    const customerNatural = await prisma.customer.create({
        data: {
            type: CustomerType.NATURAL,
            documentNumber: '71234567',
            name: 'Juan Pérez',
            email: 'juan.perez@empresa.com',
            phone: '987654321',
            address: 'Jr. Huancavelica 550, Lima',
        },
    });

    const customerNatural2 = await prisma.customer.create({
        data: {
            type: CustomerType.NATURAL,
            documentNumber: '45891234',
            name: 'Carlos Mendoza Ramos',
            email: 'mendoza.mecanica@gmail.com',
            phone: '971234567',
            address: 'Av. Nicolás Ayllón 1420, Ate',
        },
    });

    const customerBusiness = await prisma.customer.create({
        data: {
            type: CustomerType.BUSINESS,
            documentNumber: '20123456789',
            name: 'Transportes del Norte SAC',
            email: 'logistica@transportesnorte.com',
            phone: '014445555',
            address: 'Av. Los Motores 123, Lima',
        },
    });

    const customerBusiness2 = await prisma.customer.create({
        data: {
            type: CustomerType.BUSINESS,
            documentNumber: '20556677881',
            name: 'Automotriz del Centro EIRL',
            email: 'compras@autocentro.pe',
            phone: '016543210',
            address: 'Av. Iquitos 890, La Victoria',
        },
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

    const supplierMayorista = await prisma.supplier.create({
        data: {
            ruc: '20778899001',
            name: 'Mayorista Central de Autopartes Lima SAC',
            contactName: 'Roberto Gómez',
            phone: '945678123',
            email: 'pedidos@autoparteslima.pe',
            isActive: true,
        },
    });

    // 8. Productos con Stock Multi-proveedor y Matriz de 3 Precios
    const p1 = await prisma.product.create({
        data: {
            internalCode: 'BOSCH-PF-01',
            name: 'Pastillas de Freno Bosch Delanteras',
            brand: 'Bosch',
            category: 'Frenos',
            minStock: 6,
            isActive: true,
            priceTiers: {
                create: [
                    { tier: 1, price: new Prisma.Decimal(120.0) },
                    { tier: 2, price: new Prisma.Decimal(105.0) },
                    { tier: 3, price: new Prisma.Decimal(95.0) },
                ],
            },
            stocks: {
                create: [
                    { supplierId: supplierBosch.id, supplierSku: 'BOSCH-BP-994', stock: 14, costPrice: new Prisma.Decimal(68.5) },
                    { supplierId: supplierImports.id, supplierSku: 'PAC-PF-BOSCH', stock: 8, costPrice: new Prisma.Decimal(72.0) },
                    { supplierId: supplierMayorista.id, supplierSku: 'MAY-7701-F', stock: 5, costPrice: new Prisma.Decimal(70.0) },
                ],
            },
        },
    });

    const p2 = await prisma.product.create({
        data: {
            internalCode: 'FRAM-FA-02',
            name: 'Filtro de Aceite Blindado Fram',
            brand: 'Fram',
            category: 'Filtros & Lubricantes',
            minStock: 10,
            isActive: true,
            priceTiers: {
                create: [
                    { tier: 1, price: new Prisma.Decimal(35.0) },
                    { tier: 2, price: new Prisma.Decimal(30.0) },
                    { tier: 3, price: new Prisma.Decimal(25.0) },
                ],
            },
            stocks: {
                create: [
                    { supplierId: supplierImports.id, supplierSku: 'FRAM-PH-3593A', stock: 25, costPrice: new Prisma.Decimal(16.0) },
                    { supplierId: supplierMayorista.id, supplierSku: 'MAY-OIL-02', stock: 18, costPrice: new Prisma.Decimal(15.5) },
                ],
            },
        },
    });

    const p3 = await prisma.product.create({
        data: {
            internalCode: 'NGK-BJ-03',
            name: 'Bujía Láser Iridium NGK',
            brand: 'NGK',
            category: 'Motor & Culata',
            minStock: 8,
            isActive: true,
            priceTiers: {
                create: [
                    { tier: 1, price: new Prisma.Decimal(45.0) },
                    { tier: 2, price: new Prisma.Decimal(40.0) },
                    { tier: 3, price: new Prisma.Decimal(36.0) },
                ],
            },
            stocks: {
                create: [
                    { supplierId: supplierImports.id, supplierSku: 'NGK-ILZKR7B-11', stock: 20, costPrice: new Prisma.Decimal(21.0) },
                    { supplierId: supplierBosch.id, supplierSku: 'BOSCH-DIST-NGK', stock: 15, costPrice: new Prisma.Decimal(22.5) },
                ],
            },
        },
    });

    // 9. Proformas de Prueba
    const expiresToday = new Date();
    expiresToday.setHours(expiresToday.getHours() + 18);

    const expiresTomorrow = new Date();
    expiresTomorrow.setDate(expiresTomorrow.getDate() + 2);

    const proforma1 = await prisma.proforma.create({
        data: {
            code: 'PROF-2026-0012',
            customerId: customerBusiness.id,
            sellerId: userSeller.id,
            totalAmount: new Prisma.Decimal(1310.00), // Corregido: (10*95) + (10*36) = 1310
            status: ProformaStatus.PENDING_APPROVAL,
            expiresAt: expiresToday,
            details: {
                create: [
                    { productId: p1.id, quantity: 10, unitPrice: new Prisma.Decimal(95.0), priceTier: 3, subtotal: new Prisma.Decimal(950.0) },
                    { productId: p3.id, quantity: 10, unitPrice: new Prisma.Decimal(36.0), priceTier: 3, subtotal: new Prisma.Decimal(360.0) },
                ],
            },
            statusLogs: {
                create: {
                    status: ProformaStatus.PENDING_APPROVAL,
                    changedById: userSeller.id,
                    reason: 'Cliente de flota licitó mantenimiento de unidades. Requiere Tier 3.',
                },
            },
        },
    });

    const proforma2 = await prisma.proforma.create({
        data: {
            code: 'PROF-2026-0015',
            customerId: customerNatural.id,
            sellerId: userSeller.id,
            totalAmount: new Prisma.Decimal(760.00),
            status: ProformaStatus.PENDING_APPROVAL,
            expiresAt: expiresTomorrow,
            details: {
                create: [
                    { productId: p1.id, quantity: 8, unitPrice: new Prisma.Decimal(95.0), priceTier: 3, subtotal: new Prisma.Decimal(760.0) },
                ],
            },
            statusLogs: {
                create: {
                    status: ProformaStatus.PENDING_APPROVAL,
                    changedById: userSeller.id,
                    reason: 'Taller independiente solicita descuento Tier 3 por volumen.',
                },
            },
        },
    });

    // Proforma 3: Aprobada y lista para caja directa con Cliente Comodín
    const proforma3 = await prisma.proforma.create({
        data: {
            code: 'PROF-2026-0018',
            customerId: customerComodin.id,
            sellerId: userSeller.id,
            totalAmount: new Prisma.Decimal(190.00),
            status: ProformaStatus.APPROVED,
            expiresAt: expiresTomorrow,
            details: {
                create: [
                    { productId: p1.id, quantity: 1, unitPrice: new Prisma.Decimal(120.0), priceTier: 1, subtotal: new Prisma.Decimal(120.0) },
                    { productId: p2.id, quantity: 2, unitPrice: new Prisma.Decimal(35.0), priceTier: 1, subtotal: new Prisma.Decimal(70.0) },
                ],
            },
        },
    });

    console.log(`Seeding completado con éxito:`);
    console.log(`- Cliente comodín registrado: ${customerComodin.name} (${customerComodin.documentNumber})`);
    console.log(`- 3 Proveedores y 3 Repuestos multi-stock creados`);
    console.log(`- 3 Proformas creadas: ${proforma1.code}, ${proforma2.code}, ${proforma3.code}`);
}

main()
    .catch((e) => {
        console.error('Error durante el seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });