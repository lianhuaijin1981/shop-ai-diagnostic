import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { User, UserDocument } from './schemas/user.schema'
import { LoginDto, RegisterDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto
    const user = await this.userModel.findOne({ username }).exec()

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    const payload = { sub: user._id, username: user.username, role: user.role }
    const token = this.jwtService.sign(payload)

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    }
  }

  async register(registerDto: RegisterDto) {
    const { username, password, name, phone, email } = registerDto

    const existingUser = await this.userModel.findOne({ username }).exec()
    if (existingUser) {
      throw new ConflictException('用户名已存在')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new this.userModel({
      username,
      password: hashedPassword,
      name,
      phone,
      email,
    })

    await user.save()

    return {
      id: user._id,
      username: user.username,
      name: user.name,
    }
  }

  async validateUser(userId: string) {
    return this.userModel.findById(userId).exec()
  }
}
