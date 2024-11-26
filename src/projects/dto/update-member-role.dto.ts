import { Role } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateMemberRoleDto {
  @IsNotEmpty()
  memberId: string;

  @IsNotEmpty()
  @IsEnum(Role)
  newRole: Role;
}
