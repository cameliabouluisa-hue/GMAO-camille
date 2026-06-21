import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from '../../../prisma/prisma.service';

type JwtPayload = {
  sub: number;
  email: string;
  role: string;
  permissions: string[];
  idTechnicien?: number | null;
  idEquipe?: number | null;
};

const JWT_SECRET = process.env.JWT_SECRET || 'gmao_bmt_secret_developpement';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: {
        idUtilisateur: payload.sub,
      },
      include: {
        role: {
          include: {
            privileges: {
              include: {
                privilege: true,
              },
            },
          },
        },
        technicien: {
          include: {
            equipe_maintenance: true,
          },
        },
      },
    });

    if (!utilisateur || !utilisateur.actif) {
      throw new UnauthorizedException('Utilisateur non autorisé.');
    }

    const permissions = utilisateur.role.privileges
      .filter((item) => item.privilege.actif)
      .map((item) => item.privilege.code);

    const technicien = utilisateur.technicien;

    return {
      idUtilisateur: utilisateur.idUtilisateur,
      email: utilisateur.email,
      role: utilisateur.role.code,
      permissions,

      idTechnicien: technicien?.idTechnicien ?? null,
      idEquipe: technicien?.idEquipe ?? null,
      equipe: technicien?.equipe_maintenance
        ? {
            idEquipe: technicien.equipe_maintenance.idEquipe,
            code: technicien.equipe_maintenance.code,
            libelle: technicien.equipe_maintenance.libelle,
          }
        : null,
    };
  }
}