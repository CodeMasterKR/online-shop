import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min, MinLength } from "class-validator";

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100
const DEFAULT_SORT_BY = "createdAt"
const DEFAULT_SORT_ORDER = "asc"

export class QueryBaseDto{
    @IsOptional()
    @Type(() => Number)
    @IsInt({message: "page butun son bo'lishi kerak!"})
    @Min(1, {message: "page kamida 1 bo'lishi kerak"})
    page?: number = DEFAULT_PAGE;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Limit butun son boʻlishi kerak' })
    @Min(1, { message: 'Limit kamida 1 boʻlishi kerak' })
    @Max(MAX_LIMIT, { message: `Limit koʻpi bilan ${MAX_LIMIT} boʻlishi kerak` })
    limit?: number = DEFAULT_LIMIT;

    @IsOptional()
    @IsString({ message: 'Tartiblash maydoni matn boʻlishi kerak' })
    sortBy?: string = DEFAULT_SORT_BY;

    @IsOptional()
    @IsString()
    @IsIn(['asc', 'desc'], { message: "Tartiblash yo'nalishi 'asc' yoki 'desc' bo'lishi kerak" })
    sortOrder?: 'asc' | 'desc' = DEFAULT_SORT_ORDER;

    @IsOptional()
    @IsString({ message: 'Qidiruv matni matn boʻlishi kerak' })
    @MinLength(1) 
    search?: string;
} 