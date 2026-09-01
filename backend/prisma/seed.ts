// prisma/seed.ts
import { PrismaClient, Prisma, Role, CustomerType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
    console.log('Iniciando seeding de base de datos...');

    // 1. Limpieza de tablas (Orden inverso a las dependencias)
    await prisma.proformaStatusLog.deleteMany();
    await prisma.proformaDetail.deleteMany();
    await prisma.proforma.deleteMany();
    await prisma.priceTier.deleteMany();
    await prisma.product.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();

    // 2. Creación de Usuarios Base
    const defaultPassword = await bcrypt.hash('Vortex2024!', 10);

    const usersData = [
        { email: 'admin@vortexyolti.com', role: Role.ADMIN },
        { email: 'gerente@vortexyolti.com', role: Role.MANAGER },
        { email: 'vendedor@vortexyolti.com', role: Role.SELLER },
        { email: 'almacen@vortexyolti.com', role: Role.WAREHOUSE },
    ];

    for (const u of usersData) {
        await prisma.user.create({
            data: {
                email: u.email,
                passwordHash: defaultPassword,
                role: u.role,
                isActive: true,
            },
        });
    }
    console.log('Usuarios creados correctamente.');

    // 3. Creación de Clientes
    await prisma.customer.createMany({
        data: [
            {
                type: CustomerType.NATURAL,
                documentNumber: '71234567',
                name: 'Juan Pérez',
                email: 'juan.perez@email.com',
                phone: '987654321',
            },
            {
                type: CustomerType.BUSINESS,
                documentNumber: '20123456789',
                name: 'Transportes del Norte SAC',
                email: 'logistica@transportesnorte.com',
                phone: '014445555',
                address: 'Av. Los Motores 123, Lima',
            },
        ],
    });
    console.log('Clientes creados correctamente.');

    // 4. Creación de Productos y Niveles de Precios
    const productsData = [
        { code: 'BOSCH-PF-01', name: 'Pastillas de Freno Bosch', cat: 'Frenos', p1: 120.0, p2: 105.0, p3: 95.0 },
        { code: 'FRAM-FA-02', name: 'Filtro de Aceite Fram', cat: 'Filtros', p1: 35.0, p2: 30.0, p3: 25.0 },
        { code: 'NGK-BJ-03', name: 'Bujía Iridium NGK', cat: 'Encendido', p1: 45.0, p2: 40.0, p3: 36.0 },
        { code: 'ETNA-BAT-04', name: 'Batería Etna 13 Placas', cat: 'Eléctrico', p1: 320.0, p2: 290.0, p3: 275.0 },
        { code: 'VALEO-PL-05', name: 'Plumillas Limpiaparabrisas Valeo', cat: 'Accesorios', p1: 55.0, p2: 48.0, p3: 42.0 },
    ];

    for (const p of productsData) {
        const product = await prisma.product.create({
            data: {
                internalCode: p.code,
                name: p.name,
                category: p.cat,
                isActive: true,
            },
        });

        await prisma.priceTier.createMany({
            data: [
                { productId: product.id, tier: 1, price: new Prisma.Decimal(p.p1) },
                { productId: product.id, tier: 2, price: new Prisma.Decimal(p.p2) },
                { productId: product.id, tier: 3, price: new Prisma.Decimal(p.p3) },
            ],
        });
    }
    console.log('Productos y niveles de precios creados correctamente.');
}

main()
    .catch((e) => {
        console.error('Error durante el seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });