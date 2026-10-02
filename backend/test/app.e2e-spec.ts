import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('App System (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('debe proteger las rutas comerciales y rechazar accesos sin token con 401', () => {
    return request(app.getHttpServer())
      .get('/sales')
      .expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});