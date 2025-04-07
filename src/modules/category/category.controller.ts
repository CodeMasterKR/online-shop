import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto'; 
import { UpdateCategoryDto } from './dto/update-category.dto'; 
import { QueryCategoryDto } from './dto/query-category.dto'; 
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi kategoriya yaratish' })
  @ApiBody({ type: CreateCategoryDto, description: "Yangi kategoriya ma'lumotlari" })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Kategoriya muvaffaqiyatli yaratildi. Javobda yaratilgan kategoriya qaytadi.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Bu nomdagi kategoriya mavjud.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Noto\'g\'ri so\'rov (validatsiya xatosi).' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCategoryDto: CreateCategoryDto) { 
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha kategoriyalarni olish (filtr/sahifa/tartib bilan)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Sahifa raqami (1 dan boshlanadi)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Har sahifadagi elementlar soni', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Tartiblash maydoni', enum: ['id', 'name', 'description', 'createdAt'], example: 'name' })
  @ApiQuery({ name: 'sortOrder', required: false, type: String, enum: ['asc', 'desc'], description: 'Tartiblash yo\'nalishi', example: 'asc' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Nomi yoki tavsifi bo\'yicha umumiy qidiruv', example: 'elektron' })
  @ApiQuery({ name: 'filterByName', required: false, type: String, description: 'Aniq nom bo\'yicha filtr (katta-kichik harf sezilmaydi)', example: 'Samsung' })
  @ApiResponse({
      status: HttpStatus.OK,
      description: 'Kategoriyalar ro\'yxati va paginatsiya ma\'lumotlari. Javob strukturasi: { data: Category[], meta: { totalItems: number, itemCount: number, itemsPerPage: number, totalPages: number, currentPage: number } }'
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Query parametrlarida xatolik.' })
  findAll(@Query() queryDto: QueryCategoryDto) { 
    return this.categoryService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID bo\'yicha bitta kategoriyani olish' })
  @ApiParam({ name: 'id', description: 'Kategoriya UUID si', type: String, format: 'uuid', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Kategoriya ma\'lumotlari (Category modeli asosida).' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Kategoriya topilmadi.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Noto\'g\'ri ID formati.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { 
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ID bo\'yicha kategoriyani yangilash' })
  @ApiParam({ name: 'id', description: 'Kategoriya UUID si', type: String, format: 'uuid', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @ApiBody({ type: UpdateCategoryDto, description: "Yangilanadigan maydonlar" })
  @ApiResponse({ status: HttpStatus.OK, description: 'Kategoriya muvaffaqiyatli yangilandi. Javobda yangilangan kategoriya qaytadi.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Yangilanadigan kategoriya topilmadi.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Kiritilgan nom boshqa kategoriyada mavjud.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Noto\'g\'ri so\'rov (validatsiya yoki ID xatosi).' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) { 
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ID bo\'yicha kategoriyani o\'chirish' })
  @ApiParam({ name: 'id', description: 'Kategoriya UUID si', type: String, format: 'uuid', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Kategoriya muvaffaqiyatli o\'chirildi. Javobda o\'chirilgan kategoriya qaytadi.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'O\'chiriladigan kategoriya topilmadi.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Kategoriya bilan bog\'liq yozuvlar mavjud (masalan, mahsulotlar).' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Noto\'g\'ri ID formati.' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) { 
    return this.categoryService.remove(id);
  }
}