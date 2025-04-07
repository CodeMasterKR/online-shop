import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCategoryDto {

    @ApiProperty({
        description: "Kategoriya uchun unikal nom",
        example: "Telefonlar",
        required: true
    })
    @IsString({message: "Kategoriya nomi matn (string) bo'lishi kerak!"})
    @IsNotEmpty({message: "Kategoriya nomi bo'sh bo'lishi mumkin emas!"})
    name: string;

    @ApiProperty({
        description: "Kategoriya haqida batafsil ma'lumot",
        example: "Eng so'nggi rusmdagi smartfonlar va aksessuarlar",
        required: true
    })
    @IsString({message: "Tavsif matn (string) bo'lishi kerak!"})
    @IsNotEmpty({message: "Tavsif bo'sh bo'lishi mumkin emas!"})
    description: string;

    @ApiProperty({
        description: "Kategoriya rasmining URL manzili yoki serverdagi yo'li",
        example: "/uploads/images/phones.jpg",
        required: true
    })
    @IsString({message: "Rasm manzili path yoki havola ko'rinishida bo'lishi kerak!"})
    @IsNotEmpty({message: "Rasm manzili bo'sh bo'lishi mumkin emas!"})
    image: string;
}