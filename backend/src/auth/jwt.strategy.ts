import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '123', // Usa variabile d'ambiente in produzione!dopo verra modificata e usata una variabile d'ambiente 
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    //console.log('Inside JWT Strategy Validate');
    //console.log(payload);
    return { userId: payload.sub, email: payload.email, role: payload.role, }; // Questo sarà disponibile in req.user
  }
}