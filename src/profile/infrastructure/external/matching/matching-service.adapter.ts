import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CategoryWithTags } from '../../../domain/model/category-with-tags';
import { Tag } from '../../../domain/model/tag';
import type { TagCatalogPort } from '../../../domain/ports/out/tag-catalog.port';
import { ExternalServiceException } from '../../../domain/exceptions/external-service.exception';
import { ProfileServiceException } from '../../../domain/exceptions/profile-service.exception';

interface TagDto {
  id: string;
  name: string;
  categoryId: string;
}

interface CategoryWithTagsDto {
  id: string;
  name: string;
  tags: TagDto[];
}

@Injectable()
export class MatchingServiceAdapter implements TagCatalogPort {
  private readonly baseUrl: string;

  constructor(config: ConfigService) {
    const url = config.get<string>('MATCHING_SERVICE_URL') ?? '';
    const path = config.get<string>('MATCHING_SERVICE_PATH') ?? '';
    this.baseUrl = `${url}${path}`;
  }

  async getAllCategoriesWithTags(): Promise<CategoryWithTags[]> {
    if (!this.baseUrl) return [];
    const dtos = await this.get<CategoryWithTagsDto[]>(
      '/categories/categories-with-tags',
    );
    return dtos.map((dto) => this.toCategoryWithTags(dto));
  }

  async tagExists(tagId: string): Promise<boolean> {
    if (!this.baseUrl) return true;
    try {
      await this.get<TagDto>(`/categories/tags/${tagId}`);
      return true;
    } catch (err) {
      if (
        err instanceof ProfileServiceException &&
        err.status === HttpStatus.NOT_FOUND
      ) {
        return false;
      }
      throw err;
    }
  }

  async getTagNameById(tagId: string): Promise<string> {
    if (!this.baseUrl) return tagId;
    const dto = await this.get<TagDto>(`/categories/tags/${tagId}`);
    return dto.name;
  }

  private async get<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      throw new ExternalServiceException(
        `Matching service unavailable: could not reach ${this.baseUrl}`,
      );
    }
    if (response.status === 404) {
      throw new ProfileServiceException(
        `Matching service: resource not found at ${path}`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (!response.ok) {
      throw new ExternalServiceException(
        `Matching service returned ${response.status} for ${path}`,
      );
    }
    return response.json() as Promise<T>;
  }

  private toCategoryWithTags(dto: CategoryWithTagsDto): CategoryWithTags {
    const cat = new CategoryWithTags();
    cat.id = dto.id;
    cat.name = dto.name;
    cat.tags = (dto.tags ?? []).map((t) => {
      const tag = new Tag();
      tag.id = t.id;
      tag.name = t.name;
      tag.categoryId = t.categoryId;
      return tag;
    });
    return cat;
  }
}
