import { IsString, IsEmail, IsArray, IsNumber, IsOptional, ValidateNested, IsDecimal } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  product_id: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  quantity: number;

  @IsString()
  price: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  shipping_name: string;

  @IsEmail()
  shipping_email: string;

  @IsString()
  shipping_phone: string;

  @IsString()
  shipping_address: string;

  @IsOptional()
  @IsString()
  billing_name?: string;

  @IsOptional()
  @IsEmail()
  billing_email?: string;

  @IsOptional()
  @IsString()
  billing_phone?: string;

  @IsOptional()
  @IsString()
  billing_address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  shipping_fee?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  tax_amount?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  discount_amount?: number;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  total_amount: number;
}
