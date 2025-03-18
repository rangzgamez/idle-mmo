import { Controller, Get, Post, Body, Param, Delete, Put, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    try {
      // Find user by username
      const users = await this.usersService.findAll();
      const user = users.find(u => u.username === loginDto.username);
      
      // Check if user exists and password matches
      if (!user || user.password !== loginDto.password) {
        throw new UnauthorizedException('Invalid credentials');
      }
      
      // Return token and user ID (in a real app, generate a JWT token)
      return { 
        token: 'fake-jwt-token-' + Date.now(), 
        userId: user.id
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Log and rethrow other errors
      console.error('Login error:', error);
      throw new UnauthorizedException('Login failed');
    }
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    
    // Return token and user ID
    return {
      token: 'fake-jwt-token-' + Date.now(),
      userId: user.id
    };
  }

  @Post('test')
  createTestUser() {
    const testUser: CreateUserDto = {
      username: 'testuser',
      password: 'password123'
    };
    return this.usersService.create(testUser);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
} 