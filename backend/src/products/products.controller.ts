// In un controller qualsiasi, es. src/products/products.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/user.entity';

@Controller('products')
export class ProductsController {
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Applica prima l'autenticazione, poi il controllo ruoli
  @Roles(UserRole.ADMIN) // Solo gli admin possono accedere
  @Get('admin-only')
  getAdminProducts() {
    return 'Questi sono prodotti per gli admin!';
  }

  @UseGuards(AuthGuard('jwt')) // Tutti gli utenti autenticati possono accedere
  @Get('all-authenticated')
  getAllAuthenticatedProducts() {
    return 'Questi sono prodotti per tutti gli utenti autenticati!';
  }
}