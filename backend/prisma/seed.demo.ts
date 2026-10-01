// backend/prisma/seed.demo.ts
import { PrismaClient, Prisma, Role, CustomerType, ProformaStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
    console.log('🚀 Iniciando Seeding DEMO interactivo (JY Soluciones Tech / VortexYolTI)...');

    // 1. Limpieza de datos en orden estricto
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

    // 2. Módulos
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

    // 3. Perfil Demo (Administrador con privilegios de supervisión)
    const profileDemo = await prisma.profile.create({
        data: { name: 'Demo Full Access', description: 'Perfil demostrativo comercial con acceso a todos los módulos' },
    });

    for (const m of [modProformas, modCatalog, modCustomers, modApprovals, modUsers]) {
        await prisma.profileModule.create({
            data: { profileId: profileDemo.id, moduleId: m.id, canCreate: true, canRead: true, canUpdate: true, canDelete: true },
        });
    }

    // 4. Usuario Demo
    const demoPassword = await bcrypt.hash('Demo2026!', 10);
    const userDemo = await prisma.user.create({
        data: {
            email: 'demo@jysoluciones.tech',
            passwordHash: demoPassword,
            role: Role.ADMIN,
            profileId: profileDemo.id,
            isActive: true,
        },
    });

    // 5. Clientes de Prueba
    const customerComodin = await prisma.customer.create({
        data: {
            type: CustomerType.NATURAL,
            documentNumber: '00000000',
            name: 'CLIENTES VARIOS (VENTA RÁPIDA)',
            email: 'mostrador@autopartesdemo.pe',
            phone: '999888777',
            address: 'Atención en Mostrador',
        },
    });

    const customerFlota = await prisma.customer.create({
        data: {
            type: CustomerType.BUSINESS,
            documentNumber: '20608912341',
            name: 'Transandina Express Cargo SAC',
            email: 'operaciones@transandina.pe',
            phone: '015554321',
            address: 'Av. Elmer Faucett 1980, Callao',
        },
    });

    const customerMecanico = await prisma.customer.create({
        data: {
            type: CustomerType.NATURAL,
            documentNumber: '46892134',
            name: 'Renato Cárdenas (Taller Mecánico)',
            email: 'renato.cardenas@gmail.com',
            phone: '984512345',
            address: 'Av. Canadá 1420, La Victoria',
        },
    });

    // 6. Proveedores
    const supBosch = await prisma.supplier.create({
        data: {
            ruc: '20501234561',
            name: 'Robert Bosch Perú SAC',
            contactName: 'Carlos Mendívil',
            phone: '998877665',
            email: 'ventas@bosch.pe',
            isActive: true,
        },
    });

    const supPacifico = await prisma.supplier.create({
        data: {
            ruc: '20609876543',
            name: 'Importaciones Automotrices del Pacífico SAC',
            contactName: 'Mariana Silva',
            phone: '912345678',
            email: 'pedidos@autopartespacifico.pe',
            isActive: true,
        },
    });

    // 7. Repuestos con imágenes públicas nítidas y stock multi-proveedor
    const p1 = await prisma.product.create({
        data: {
            internalCode: 'BOSCH-BRK-01',
            name: 'Pastillas de Freno Delanteras Cerámicas',
            brand: 'Bosch',
            category: 'Frenos',
            imageUrl: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=600&auto=format&fit=crop&q=80',
            minStock: 5,
            priceTiers: {
                create: [
                    { tier: 1, price: new Prisma.Decimal(135.00) },
                    { tier: 2, price: new Prisma.Decimal(120.00) },
                    { tier: 3, price: new Prisma.Decimal(108.00) },
                ],
            },
            stocks: {
                create: [
                    { supplierId: supBosch.id, supplierSku: 'BSH-BP-440', stock: 18, costPrice: new Prisma.Decimal(72.00) },
                    { supplierId: supPacifico.id, supplierSku: 'PAC-BRK-99', stock: 6, costPrice: new Prisma.Decimal(75.50) },
                ],
            },
        },
    });

    const p2 = await prisma.product.create({
        data: {
            internalCode: 'DENSO-SK-02',
            name: 'Bujías Iridium Long-Life (Juego x4)',
            brand: 'Denso',
            category: 'Encendido & Motor',
            imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80',
            minStock: 8,
            priceTiers: {
                create: [
                    { tier: 1, price: new Prisma.Decimal(160.00) },
                    { tier: 2, price: new Prisma.Decimal(145.00) },
                    { tier: 3, price: new Prisma.Decimal(130.00) },
                ],
            },
            stocks: {
                create: [
                    { supplierId: supPacifico.id, supplierSku: 'DNS-IK20TT', stock: 24, costPrice: new Prisma.Decimal(88.00) },
                ],
            },
        },
    });

    const p3 = await prisma.product.create({
        data: {
            internalCode: 'MANN-OIL-03',
            name: 'Filtro de Aceite Blindado W 712/75',
            brand: 'Mann Filter',
            category: 'Filtros & Lubricantes',
            imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&auto=format&fit=crop&q=80',
            minStock: 10,
            priceTiers: {
                create: [
                    { tier: 1, price: new Prisma.Decimal(42.00) },
                    { tier: 2, price: new Prisma.Decimal(36.00) },
                    { tier: 3, price: new Prisma.Decimal(30.00) },
                ],
            },
            stocks: {
                create: [
                    { supplierId: supBosch.id, supplierSku: 'MANN-712-A', stock: 32, costPrice: new Prisma.Decimal(18.50) },
                    { supplierId: supPacifico.id, supplierSku: 'PAC-MANN-03', stock: 15, costPrice: new Prisma.Decimal(19.00) },
                ],
            },
        },
    });

    // 8. Proformas precargadas para probar la bandeja gerencial
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 3);

    await prisma.proforma.create({
        data: {
            code: 'PROF-DEMO-001',
            customerId: customerFlota.id,
            sellerId: userDemo.id,
            totalAmount: new Prisma.Decimal(1080.00),
            status: ProformaStatus.PENDING_APPROVAL,
            expiresAt: expDate,
            details: {
                create: [
                    { productId: p1.id, quantity: 10, unitPrice: new Prisma.Decimal(108.00), priceTier: 3, subtotal: new Prisma.Decimal(1080.00) },
                ],
            },
            statusLogs: {
                create: {
                    status: ProformaStatus.PENDING_APPROVAL,
                    changedById: userDemo.id,
                    reason: 'Cliente de flota solicita descuento corporativo Tier 3 por lote de 10 unidades.',
                },
            },
        },
    });

    await prisma.proforma.create({
        data: {
            code: 'PROF-DEMO-002',
            customerId: customerMecanico.id,
            sellerId: userDemo.id,
            totalAmount: new Prisma.Decimal(332.00),
            status: ProformaStatus.APPROVED,
            expiresAt: expDate,
            details: {
                create: [
                    { productId: p2.id, quantity: 2, unitPrice: new Prisma.Decimal(145.00), priceTier: 2, subtotal: new Prisma.Decimal(290.00) },
                    { productId: p3.id, quantity: 1, unitPrice: new Prisma.Decimal(42.00), priceTier: 1, subtotal: new Prisma.Decimal(42.00) },
                ],
            },
        },
    });

    console.log('✅ Base de datos Demo inicializada con éxito:');
    console.log('   Credencial: demo@jysoluciones.tech | Demo2026!');
}

main()
    .catch((e) => {
        console.error('Error durante seed demo:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });