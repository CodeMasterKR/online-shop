import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { QueryBaseDto } from '../../../common/dto/query-base.dto';

export class QueryCategoryDto extends QueryBaseDto {
  @IsOptional()
  @IsString()
  filterByName?: string; 
}