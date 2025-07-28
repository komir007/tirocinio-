import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import { UserRole } from '../user/user.entity'; // Importa UserRole

// Assumi che JWT_SECRET_KEY sia definito come prima (sia con ConfigService che hardcoded)
const JWT_SECRET_KEY = 'laMiaChiaveSegretaMoltoLungaPerJWT';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET_KEY,
    });
  }

  async validate(payload: any) {
    // Il payload ora include il ruolo
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }
    // Restituisci l'oggetto utente con il ruolo allegato. Sarà disponibile in req.user.
    return { userId: payload.sub, email: payload.email, role: payload.role as UserRole };
  }
}