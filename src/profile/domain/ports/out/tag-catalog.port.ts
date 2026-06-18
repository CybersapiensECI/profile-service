import { CategoryWithTags } from '../../model/category-with-tags';

export interface TagCatalogPort {
  getAllCategoriesWithTags(): Promise<CategoryWithTags[]>;
  tagExists(tagId: string): Promise<boolean>;
  getTagNameById(tagId: string): Promise<string>;
}
