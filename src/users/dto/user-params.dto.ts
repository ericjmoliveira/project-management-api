import { IsString } from 'class-validator';

export class UserParamsDto {
  @IsString()
  projectId: string;
}
