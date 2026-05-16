import { IsString, MinLength, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  username: string

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string
}

export class RegisterDto {
  @ApiProperty({ example: 'newuser' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string

  @ApiProperty({ example: '张三' })
  @IsString()
  name: string

  @ApiProperty({ example: '13800138000', required: false })
  @IsString()
  phone?: string

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsString()
  email?: string
}
