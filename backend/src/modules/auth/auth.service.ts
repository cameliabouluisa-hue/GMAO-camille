import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: {
        email: dto.email,
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
      },
    });

    if (!utilisateur) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    if (!utilisateur.actif) {
      throw new ForbiddenException('Ce compte utilisateur est désactivé.');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      utilisateur.motDePasse,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    const permissions = utilisateur.role.privileges
      .filter((item) => item.privilege.actif)
      .map((item) => item.privilege.code);

    const payload = {
      sub: utilisateur.idUtilisateur,
      email: utilisateur.email,
      role: utilisateur.role.code,
      permissions,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    await this.prisma.utilisateur.update({
      where: {
        idUtilisateur: utilisateur.idUtilisateur,
      },
      data: {
        derniereConnexion: new Date(),
      },
    });

    return {
      token: accessToken,
      accessToken,
      user: {
        id: String(utilisateur.idUtilisateur),
        idUtilisateur: utilisateur.idUtilisateur,
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        fullName: this.buildFullName(utilisateur.prenom, utilisateur.nom),
        role: utilisateur.role.code,
        roleLabel: utilisateur.role.libelle,
        permissions,
        actif: utilisateur.actif,
        derniereConnexion: utilisateur.derniereConnexion,
      },
    };
  }

  async getProfile(idUtilisateur: number) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: {
        idUtilisateur,
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
      },
    });

    if (!utilisateur || !utilisateur.actif) {
      throw new UnauthorizedException('Utilisateur non autorisé.');
    }

    const permissions = utilisateur.role.privileges
      .filter((item) => item.privilege.actif)
      .map((item) => item.privilege.code);

    return {
      id: String(utilisateur.idUtilisateur),
      idUtilisateur: utilisateur.idUtilisateur,
      email: utilisateur.email,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      fullName: this.buildFullName(utilisateur.prenom, utilisateur.nom),
      role: utilisateur.role.code,
      roleLabel: utilisateur.role.libelle,
      permissions,
      actif: utilisateur.actif,
      dateCreation: utilisateur.dateCreation,
      derniereConnexion: utilisateur.derniereConnexion,
    };
  }

  private buildFullName(prenom?: string | null, nom?: string | null) {
    return [prenom, nom].filter(Boolean).join(' ') || 'Utilisateur';
  }
}