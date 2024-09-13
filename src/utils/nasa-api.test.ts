import { dateToAPIDateFormat } from "./nasa-api";

describe("NASA API", () => {
  describe("dateToAPIDateFormat", () => {
    it("should return a string in the format YYYYMMDD", () => {
      expect(dateToAPIDateFormat(new Date("2021-01-01"))).toBe("20210101");
      expect(dateToAPIDateFormat(new Date("2021-12-31"))).toBe("20211231");
      expect(dateToAPIDateFormat(new Date("2021-05-05"))).toBe("20210505");
    });
  });
});
