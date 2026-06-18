import { ApiProperty } from '@nestjs/swagger';
import { TagSummaryResponseDto } from './tag-summary.response.dto';

export class CategoryWithTagsResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ example: 'Technology' })
  name: string;

  @ApiProperty({ type: [TagSummaryResponseDto] })
  tags: TagSummaryResponseDto[];
}
