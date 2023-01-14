import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import * as fs from "fs";
import * as moment from "moment";
import { FileService } from "src/file/file.service";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService
  ) {}

  @Cron("0 * * * *")
  async deleteExpiredShares() {
    const expiredShares = await this.prisma.share.findMany({
      where: {
        // We want to remove only shares that have an expiration date less than the current date, but not 0
        AND: [
          { expiration: { lt: new Date() } },
          { expiration: { not: moment(0).toDate() } },
        ],
      },
    });

    for (const expiredShare of expiredShares) {
      await this.prisma.share.delete({
        where: { id: expiredShare.id },
      });

      await this.fileService.deleteAllFiles(expiredShare.id);
    }

    if (expiredShares.length > 0)
      console.log(`job: deleted ${expiredShares.length} expired shares`);
  }

  @Cron("0 0 * * *")
  deleteTemporaryFiles() {
    let filesDeleted = 0;

    const shareDirectories = fs
      .readdirSync("./data/uploads/shares", { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const shareDirectory of shareDirectories) {
      const temporaryFiles = fs
        .readdirSync(`./data/uploads/shares/${shareDirectory}`)
        .filter((file) => file.endsWith(".tmp-chunk"));

      for (const file of temporaryFiles) {
        const stats = fs.statSync(
          `./data/uploads/shares/${shareDirectory}/${file}`
        );
        const isOlderThanOneDay = moment(stats.mtime)
          .add(1, "day")
          .isBefore(moment());

        if (isOlderThanOneDay) {
          fs.rmSync(`./data/uploads/shares/${shareDirectory}/${file}`);
          filesDeleted++;
        }
      }
    }

    console.log(`job: deleted ${filesDeleted} temporary files`);
  }

  @Cron("0 * * * *")
  async deleteExpiredRefreshTokens() {
    const expiredRefreshTokens = await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    if (expiredRefreshTokens.count > 0)
      console.log(
        `job: deleted ${expiredRefreshTokens.count} expired refresh tokens`
      );
  }
}