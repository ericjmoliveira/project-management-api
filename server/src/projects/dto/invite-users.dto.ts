import { IsArray, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { UserInvitedDto } from './user-invited.dto';

export class InviteUsersDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UserInvitedDto)
  usersList: UserInvitedDto[];
}
