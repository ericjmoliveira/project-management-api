import { IsString, IsNotEmpty, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class UserDto {
  @IsString()
  @IsNotEmpty()
  sub: string;
}

export class RequestDto {
  @ValidateNested()
  @Type(() => UserDto)
  @IsOptional()
  user?: UserDto;
}
