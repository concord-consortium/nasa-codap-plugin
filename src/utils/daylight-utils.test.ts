import { getSunrayAngleInDegrees } from "./daylight-utils"

describe("getSunrayAngleInDegrees", () => {
  it("should return the correct sunray angle in degrees", () => {
    const dayNum = 172;
    const earthTilt = 23.5;
    const lat = 37.7749;
    const result = getSunrayAngleInDegrees(dayNum, earthTilt, lat);
    expect(result).toBeCloseTo(75.7251);
  });

  it("should return the correct sunray angle in degrees (90deg case)", () => {
    const dayNum = 171;
    const earthTilt = 23.5;
    const lat = 23.5;
    const result = getSunrayAngleInDegrees(dayNum, earthTilt, lat);
    expect(result).toBeCloseTo(90);
  });
});
