import Limiter from "bottleneck";

export const BottleneckProvider = {
  provide: "Bottleneck",
  useValue: new Limiter({
    maxConcurrent: 1,
    minTime: 1000 / 6,
  }),
};
