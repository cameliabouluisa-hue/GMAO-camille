import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcryptjs';

import { PrismaClient } from '../generated/prisma/client';
import {
  PRIVILEGES,
  ROLE_CODES,
  ROLE_LABELS,
  ROLE_PRIVILEGES,
  type RoleCode,
} from '../src/modules/auth/constants/auth-permissions';

const adapter = new PrismaMariaDb({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'cam2003',
  database: 'gmao_db',
  connectionLimit: 5,
});

const prisma = new PrismaClient({
  adapter,
});

const testAccounts = [
  {
    email: 'admin@gmao.local',
    password: 'admin123',
    nom: 'Administrateur',
    prenom: 'GMAO',
    role: ROLE_CODES.ADMIN,
  },
  {
    email: 'responsable@gmao.local',
    password: 'resp123',
    nom: 'Responsable',
    prenom: 'Maintenance',
    role: ROLE_CODES.RESPONSABLE_MAINTENANCE,
  },
  {
    email: 'technicien@gmao.local',
    password: 'tech123',
    nom: 'Technicien',
    prenom: 'Maintenance',
    role: ROLE_CODES.TECHNICIEN,
  },
  {
    email: 'demandeur@gmao.local',
    password: 'dem123',
    nom: 'Demandeur',
    prenom: 'BMT',
    role: ROLE_CODES.DEMANDEUR,
  },
  {
    email: 'magasinier@gmao.local',
    password: 'mag123',
    nom: 'Magasinier',
    prenom: 'Stock',
    role: ROLE_CODES.MAGASINIER,
  },
];

async function seedPrivileges() {
  console.log('Insertion des privilèges...');

  for (const privilege of PRIVILEGES) {
    await prisma.privilege_gmao.upsert({
      where: {
        code: privilege.code,
      },
      create: {
        code: privilege.code,
        libelle: privilege.libelle,
        module: privilege.module,
        description: privilege.description ?? null,
        actif: true,
      },
      update: {
        libelle: privilege.libelle,
        module: privilege.module,
        description: privilege.description ?? null,
        actif: true,
      },
    });
  }

  console.log(`${PRIVILEGES.length} privilège(s) synchronisé(s).`);
}

async function seedRoles() {
  console.log('Insertion des rôles...');

  const roleCodes = Object.values(ROLE_CODES) as RoleCode[];

  for (const roleCode of roleCodes) {
    await prisma.role_gmao.upsert({
      where: {
        code: roleCode,
      },
      create: {
        code: roleCode,
        libelle: ROLE_LABELS[roleCode],
        description: `Rôle ${ROLE_LABELS[roleCode]} de l’application GMAO BMT.`,
        actif: true,
      },
      update: {
        libelle: ROLE_LABELS[roleCode],
        description: `Rôle ${ROLE_LABELS[roleCode]} de l’application GMAO BMT.`,
        actif: true,
      },
    });
  }

  console.log(`${roleCodes.length} rôle(s) synchronisé(s).`);
}

async function seedRolePrivileges() {
  console.log('Association des privilèges aux rôles...');

  const roleCodes = Object.values(ROLE_CODES) as RoleCode[];

  for (const roleCode of roleCodes) {
    const role = await prisma.role_gmao.findUnique({
      where: {
        code: roleCode,
      },
    });

    if (!role) {
      throw new Error(`Rôle introuvable : ${roleCode}`);
    }

    const privilegeCodes = ROLE_PRIVILEGES[roleCode] ?? [];

    const privileges = await prisma.privilege_gmao.findMany({
      where: {
        code: {
          in: privilegeCodes,
        },
      },
      select: {
        idPrivilege: true,
        code: true,
      },
    });

    const existingPrivilegeCodes = new Set(
      privileges.map((privilege) => privilege.code),
    );

    const missingPrivileges = privilegeCodes.filter(
      (code) => !existingPrivilegeCodes.has(code),
    );

    if (missingPrivileges.length > 0) {
      console.warn(
        `Privilèges introuvables pour ${roleCode} : ${missingPrivileges.join(
          ', ',
        )}`,
      );
    }

    await prisma.role_privilege_gmao.deleteMany({
      where: {
        idRole: role.idRole,
      },
    });

    if (privileges.length > 0) {
      await prisma.role_privilege_gmao.createMany({
        data: privileges.map((privilege) => ({
          idRole: role.idRole,
          idPrivilege: privilege.idPrivilege,
        })),
        skipDuplicates: true,
      });
    }

    console.log(
      `${roleCode} : ${privileges.length} privilège(s) associé(s).`,
    );
  }
}

async function seedUsers() {
  console.log('Insertion des comptes utilisateurs de test...');

  for (const account of testAccounts) {
    const role = await prisma.role_gmao.findUnique({
      where: {
        code: account.role,
      },
    });

    if (!role) {
      throw new Error(`Rôle introuvable pour ${account.email}`);
    }

    const passwordHash = await bcrypt.hash(account.password, 10);

    await prisma.utilisateur.upsert({
      where: {
        email: account.email,
      },
      create: {
        nom: account.nom,
        prenom: account.prenom,
        email: account.email,
        motDePasse: passwordHash,
        actif: true,
        idRole: role.idRole,
      },
      update: {
        nom: account.nom,
        prenom: account.prenom,
        motDePasse: passwordHash,
        actif: true,
        idRole: role.idRole,
      },
    });

    console.log(`Compte synchronisé : ${account.email}`);
  }
}

async function main() {
  console.log('Démarrage du seed authentification...');

  await seedPrivileges();
  await seedRoles();
  await seedRolePrivileges();
  await seedUsers();

  console.log('Seed authentification terminé avec succès.');
}

main()
  .catch((error) => {
    console.error('Erreur pendant le seed authentification :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });