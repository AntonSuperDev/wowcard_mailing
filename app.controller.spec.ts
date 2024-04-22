import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appService: AppService;
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appService = app.get<AppService>(AppService);
    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it("should return 'Hello...'", () => {
      jest
        .spyOn(appService, "getHello")
        .mockImplementation(() => "Hello guys!");

      expect(appController.root()).toBe("Hello guys!");
    });
  });
});
