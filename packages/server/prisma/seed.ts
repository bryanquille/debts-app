import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const debtor = await prisma.user.upsert({
    where: { email: "deudor@test.com" },
    update: {},
    create: {
      name: "Juan Deudor",
      email: "deudor@test.com",
      password,
    },
  });

  const creditor = await prisma.user.upsert({
    where: { email: "acreedor@test.com" },
    update: {},
    create: {
      name: "María Acreedora",
      email: "acreedor@test.com",
      password,
    },
  });

  const externalPerson = await prisma.user.upsert({
    where: { email: "externo@test.com" },
    update: {},
    create: {
      name: "Pedro Externo",
      email: "externo@test.com",
      password,
    },
  });

  await prisma.debt.deleteMany();

  await prisma.debt.create({
    data: {
      title: "Préstamo para el auto",
      description: "Me prestó para la reparación del auto",
      totalAmount: 5000,
      status: "ACTIVE",
      createdById: debtor.id,
      debtorId: debtor.id,
      creditorId: creditor.id,
    },
  });

  await prisma.debt.create({
    data: {
      title: "Cena del sábado",
      totalAmount: 850,
      status: "ACTIVE",
      createdById: creditor.id,
      debtorId: debtor.id,
      creditorId: creditor.id,
    },
  });

  await prisma.debt.create({
    data: {
      title: "Renta de enero",
      description: "Mitad de la renta del departamento",
      totalAmount: 7500,
      status: "ACTIVE",
      createdById: debtor.id,
      debtorId: debtor.id,
      creditorName: "Carlos (casero)",
    },
  });

  await prisma.debt.create({
    data: {
      title: "Viaje a la playa",
      totalAmount: 3200,
      status: "PAID",
      createdById: debtor.id,
      debtorId: debtor.id,
      creditorName: "Ana",
    },
  });

  await prisma.debt.create({
    data: {
      title: "Herramientas",
      totalAmount: 1200,
      status: "CANCELLED",
      createdById: creditor.id,
      debtorName: "Roberto",
      creditorId: creditor.id,
    },
  });

  console.log("Seed completado exitosamente");
  console.log(`  - Usuarios: ${debtor.name}, ${creditor.name}, ${externalPerson.name}`);
  console.log(`  - Password para todos: password123`);
  console.log(`  - Deudas creadas: 5`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
