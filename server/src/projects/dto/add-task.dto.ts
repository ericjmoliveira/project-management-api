import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Priority } from '@prisma/client';

export class AddTaskDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  description: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Priority)
  priority: Priority;

  @IsOptional()
  @IsDateString()
  dueDate: string;
}
