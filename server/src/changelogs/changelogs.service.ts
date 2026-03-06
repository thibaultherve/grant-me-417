import { Injectable } from '@nestjs/common';
import type { Changelog } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  ChangelogResponse,
  ChangelogsResponse,
} from '@get-granted/shared';
import { formatDate, formatTimestamp } from '../common/utils/format.js';

@Injectable()
export class ChangelogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10): Promise<ChangelogsResponse> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.changelog.findMany({
        skip,
        take: limit,
        orderBy: { changelogDate: 'desc' },
      }),
      this.prisma.changelog.count(),
    ]);

    return {
      data: data.map((c) => this.mapToResponse(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private mapToResponse(changelog: Changelog): ChangelogResponse {
    return {
      id: changelog.id,
      changelogDate: formatDate(changelog.changelogDate),
      title: changelog.title,
      contentMarkdown: changelog.contentMarkdown,
      summary: changelog.summary ?? null,
      createdAt: formatTimestamp(changelog.createdAt),
    };
  }
}
