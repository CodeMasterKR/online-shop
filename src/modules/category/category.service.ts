import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException, 
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { QueryCategoryDto } from './dto/query-category.dto';
import { Prisma, Category } from '@prisma/client'; 

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const isExist = await this.prisma.category.findFirst({
      where: { name: createCategoryDto.name },
    });

    if (isExist) {
      throw new ConflictException('Bu nomdagi kategoriya allaqachon mavjud!');
    }

    try {
      const data = await this.prisma.category.create({
        data: createCategoryDto,
      });
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new BadRequestException(
        `Kategoriya yaratishda xatolik: ${error.message}`,
      );
    }
  }

  async findAll(queryDto: QueryCategoryDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name', 
      sortOrder = 'asc', 
      filterByName, 
      search, 
    } = queryDto;

    const allowedSortFields = ['name', 'description'];
    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';

    const skip = (page - 1) * limit;
    const take = limit;

    const orderBy: Prisma.CategoryOrderByWithRelationInput = {
      [finalSortBy]: sortOrder,
    };

    const whereConditions: Prisma.CategoryWhereInput[] = []; 

    if (search) {
      whereConditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (filterByName) {
      whereConditions.push({
        name: { contains: filterByName, mode: 'insensitive' },
      });
    }

    const where: Prisma.CategoryWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    try {
      const [categories, totalCount] = await this.prisma.$transaction([
        this.prisma.category.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
        this.prisma.category.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: categories,
        meta: {
          totalItems: totalCount,
          itemCount: categories.length,
          itemsPerPage: limit,
          totalPages: totalPages,
          currentPage: page,
        },
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new BadRequestException(`Kategoriyalarni olishda xatolik: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Category> { 
    try {
      const category = await this.prisma.category.findUniqueOrThrow({
        where: { id },
      });
      return category;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`ID='${id}' bo'lgan kategoriya topilmadi`);
      }
      throw new BadRequestException(`Kategoriyani topishda xatolik: ${error.message}`);
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> { 
    await this.findOne(id); 

    if (updateCategoryDto.name) {
      const existingByName = await this.prisma.category.findFirst({
        where: {
          name: updateCategoryDto.name,
          id: { not: id },
        },
      });
      if (existingByName) {
        throw new ConflictException(
          `'${updateCategoryDto.name}' nomli kategoriya allaqachon mavjud!`,
        );
      }
    }

    try {
      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });
      return updatedCategory;
    } catch (error) {
       if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
         throw new NotFoundException(`ID='${id}' bo'lgan kategoriya topilmadi (yangilashda)`);
       }
       if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
         throw new ConflictException("Nom bo'yicha unikalik buzildi (yangilashda)");
       }
      console.error(`Error updating category with ID ${id}:`, error);
      throw new BadRequestException(`Kategoriyani yangilashda xatolik: ${error.message}`);
    }
  }

  async remove(id: string): Promise<Category> {
    await this.findOne(id); 

    try {
      const deletedCategory = await this.prisma.category.delete({
        where: { id },
      });
      return deletedCategory;
    } catch (error) {
       if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
         throw new NotFoundException(`ID='${id}' bo'lgan kategoriya topilmadi (o'chirishda)`);
       }
       if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
           throw new ConflictException(`Bu kategoriya bilan bog'liq yozuvlar mavjud. Avval ularni o'chiring yoki o'zgartiring.`);
       }
      console.error(`Error removing category with ID ${id}:`, error);
      throw new BadRequestException(`Kategoriyani o'chirishda xatolik: ${error.message}`);
    }
  }
}