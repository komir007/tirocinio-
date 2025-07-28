import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '../user/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Ottieni i ruoli richiesti dalla rotta usando il Reflector
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // Se la rotta non ha il decorator @Roles, è accessibile a tutti gli autenticati.
    }

    // Estrai l'utente dalla richiesta. L'utente è stato allegato dal JwtStrategy.
    const { user } = context.switchToHttp().getRequest();

    // Verifica se il ruolo dell'utente è tra i ruoli richiesti
    return requiredRoles.some((role) => user.role === role);
  }
}