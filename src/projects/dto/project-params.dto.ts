import { IsOptional, IsString } from 'class-validator';

export class ProjectParamsDto {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  memberId?: string;
}
