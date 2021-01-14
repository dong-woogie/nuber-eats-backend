import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';
import {
  S3_ACCESS_KEY,
  S3_BUCKET_NAME,
  S3_SECRET_KEY,
} from 'src/common/common.constants';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly configService: ConfigService) {}

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    AWS.config.update({
      credentials: {
        accessKeyId: this.configService.get(S3_ACCESS_KEY),
        secretAccessKey: this.configService.get(S3_SECRET_KEY),
      },
    });
    try {
      const bucketName = this.configService.get(S3_BUCKET_NAME);
      const objectName = `original/${+new Date()}${file.originalname}`;
      await new AWS.S3()
        .putObject({
          Bucket: bucketName,
          Body: file.buffer,
          Key: objectName,
          ACL: 'public-read',
        })
        .promise();
      const url = `https://${bucketName}.s3.ap-northeast-2.amazonaws.com/${objectName}`;
      return { url };
    } catch {
      return null;
    }
  }
}
