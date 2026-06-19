import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDefined } from 'class-validator';

export class GeolocationRequestDto {
  @ApiProperty({ example: true })
  @IsDefined({ message: 'Geolocation enabled field must not be null' })
  @IsBoolean()
  geolocationEnabled: boolean;
}
