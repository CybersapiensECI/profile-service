import { ApiProperty } from '@nestjs/swagger';

export class TagSummaryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ example: 'Machine Learning' })
  name: string;
}
