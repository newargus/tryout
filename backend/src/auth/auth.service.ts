import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import * as argon from "argon2";
import * as moment from "moment";
import { ConfigService } from "src/config/config.service";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthRegisterDTO } from "./dto/authRegister.dto";
import { AuthSignInDTO } from "./dto/authSignIn.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService
  ) {}

  async signUp(dto: AuthRegisterDTO) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          password: hash,
          isAdmin: !this.config.get("SETUP_FINISHED"),
        },
      });

      const { refreshToken, refreshTokenId } = await this.createRefreshToken(
        user.id
      );
      const accessToken = await this.createAccessToken(user, refreshTokenId);

      return { accessToken, refreshToken };
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code == "P2002") {
          const duplicatedField: string = e.meta.target[0];
          throw new BadRequestException(
            `A user with this ${duplicatedField} already exists`
          );
        }
      }
    }
  }

  async signIn(dto: AuthSignInDTO) {
    if (!dto.email && !dto.username)
      throw new BadRequestException("Email or username is required");

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (!user || !(await argon.verify(user.password, dto.password)))
      throw new UnauthorizedException("Wrong email or password");

    // TODO: Make all old loginTokens invalid when a new one is created
    // Check if the user has TOTP enabled
    if (user.totpVerified) {
      const loginToken = await this.createLoginToken(user.id);

      return { loginToken };
    }

    const { refreshToken, refreshTokenId } = await this.createRefreshToken(
      user.id
    );
    const accessToken = await this.createAccessToken(user, refreshTokenId);

    return { accessToken, refreshToken };
  }

  async updatePassword(user: User, oldPassword: string, newPassword: string) {
    if (!(await argon.verify(user.password, oldPassword)))
      throw new ForbiddenException("Invalid password");

    const hash = await argon.hash(newPassword);

    await this.prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hash },
    });

    return this.createRefreshToken(user.id);
  }

  async createAccessToken(user: User, refreshTokenId: string) {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        refreshTokenId,
      },
      {
        expiresIn: "15min",
        secret: this.config.get("JWT_SECRET"),
      }
    );
  }

  async signOut(accessToken: string) {
    const { refreshTokenId } = this.jwtService.decode(accessToken) as {
      refreshTokenId: string;
    };

    await this.prisma.refreshToken
      .delete({ where: { id: refreshTokenId } })
      .catch((e) => {
        // Ignore error if refresh token doesn't exist
        if (e.code != "P2025") throw e;
      });
  }

  async refreshAccessToken(refreshToken: string) {
    const refreshTokenMetaData = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!refreshTokenMetaData || refreshTokenMetaData.expiresAt < new Date())
      throw new UnauthorizedException();

    return this.createAccessToken(
      refreshTokenMetaData.user,
      refreshTokenMetaData.id
    );
  }

  async createRefreshToken(userId: string) {
    const { id, token } = await this.prisma.refreshToken.create({
      data: { userId, expiresAt: moment().add(3, "months").toDate() },
    });

    return { refreshTokenId: id, refreshToken: token };
  }

  async createLoginToken(userId: string) {
    const loginToken = (
      await this.prisma.loginToken.create({
        data: { userId, expiresAt: moment().add(5, "minutes").toDate() },
      })
    ).token;

    return loginToken;
  }
}