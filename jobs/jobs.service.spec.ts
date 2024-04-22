import { Test, TestingModule } from "@nestjs/testing";
import { TekmetricService } from "../tekmetric/tekmetric.service";
import { EmptyLogger } from "../__mocks__/@nestjs/logger";
import { JobsService } from "./jobs.service";

jest.mock("../tekmetric/tekmetric.service");

describe("JobsService", () => {
  let service: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TekmetricService],
      providers: [JobsService],
    }).compile();

    service = module.get<JobsService>(JobsService);

    module.useLogger(new EmptyLogger());
    jest.spyOn(console, "error").mockImplementation(() => null);
    jest.spyOn(console, "log").mockImplementation(() => null);
    jest.spyOn(console, "warn").mockImplementation(() => null);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
