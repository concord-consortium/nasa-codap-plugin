import React from "react";

import "./glossary-tab.scss";

const Link = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer">
    { children }
  </a>
);

export const GlossaryTab: React.FC = () => {
  return (
    <div className="glossary-tab">
      <table>
        <thead>
          <tr>
            <th>Term</th>
            <th>Definition</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sunlight</td>
            <td>
              <p>
                Length of day and times of sunrise and sunset are reported using a 24-hour clock for hours. Parts of an
                hour (minutes) are reported in decimals.
              </p>
              <p>
                Hours: For example, a sunset that occurs at 6:00 pm on a clock would display a value of 18.00 in the data
                table. This means that 18 hours have passed since midnight (12 + 6 = 18 hours).
              </p>
              <p>
                Minutes: To find the decimal time of minutes, we divide the number of minutes on the clock by the total
                minutes in an hour. For example, 30 minutes/60 minutes = 0.5 hours.
              </p>
              <p>
                By reporting the time on a 24 hour clock and with decimal minutes we can more easily add, subtract, and
                compare times of day.
              </p>
            </td>
          </tr>

          <tr>
            <td>Length of day</td>
            <td>Number of hours of sunlight in decimal time (see “Sunlight”).</td>
          </tr>

          <tr>
            <td>Sunrise</td>
            <td>The local time of sunrise in decimal time (see “Sunlight”).</td>
          </tr>

          <tr>
            <td>Sunset</td>
            <td>The local time of sunset in decimal time (see “Sunlight”).</td>
          </tr>

          <tr>
            <td>Sunlight angle</td>
            <td>
              <p>
                Because of the earth’s tilted axis, sunlight reaches the Earth at varying angles over the course of
                a year. During summer months, for the part of the earth that is tilted toward the sun, it appears higher
                in the sky and more overhead. This means that during summer, the angle of sunlight approaches 90°
                and is more direct, concentrated, and intense.
              </p>
              <p>
                During the winter, the sun appears lower in the sky. At these angles, sunlight spreads out over surfaces
                and becomes less direct, less concentrated, and less intense. In addition, it is more likely to be
                reflected or absorbed by the atmosphere on its way to the surface.
              </p>
              <p>
                <strong>Note that scientists measure the angle of the sun from 0° to 180°.</strong> As a result, values for the Northern
                Hemisphere are reported form 0° to 90° and values for the Southern Hemisphere are reported from 90° to 180°.
              </p>
              <p>
                The round shape of the earth also impacts the sunlight angle, which affects the degree of warmth that
                reaches each region. Light from the sun will shine more directly overhead near the
                equator compared to latitudes further into in the Northern and Southern Hemispheres.
              </p>
              <p>
                To explore these factors interactively, visit
                the <Link href="https://models-resources.concord.org/grasp-seasons/">Earth-Sun simulation</Link> or
                access the Day Length CODAP plugin.
              </p>
            </td>
          </tr>

          <tr>
            <td>UV Index</td>
            <td>
              <p>
                The ultraviolet radiation exposure index (UV index) is a linear scale used to measure the amount of UV
                radiation reaching the Earth&apos;s surface. It is used to help individuals anticipate the expected risk of
                overexposure to the sun.
              </p>
              <p>
                The UV index is calculated to include forecast ozone levels, cloudiness, and elevation in order to be an
                accurate prediction of UV exposure at solar noon, when the sun is at its highest point in the sky.
                Nearby light-reflecting surfaces like sand and water can also increase the UV index.
              </p>
              <p>
                The UV index can help people determine how to protect themselves from the sun when planning outdoor
                activities. For example, when the UV index is 6–7 (high) or 3–5 (medium), people should take precautions
                like seeking shade, using sunscreen, and wearing protective clothing. People with lighter skin, blond or
                red hair, freckles or moles, or a history of sunburns are more vulnerable to the sun&apos;s rays and may need
                to take precautions at lower UV Index levels.
              </p>
              <p>
                UV index data are typically available with a delay of 3-4 months for processing the values.
              </p>
            </td>
          </tr>

          <tr>
            <td>Solar intensity</td>
            <td>
              The total flow of energy from the Sun traveling downward toward the surface of the Earth. It is an estimate
              calculated by NASA from satellite readings and includes the effect of aerosols (particles in the air) such
              as smoke, but does not include cloud cover.
            </td>
          </tr>

          <tr>
            <td>Max air temp</td>
            <td>
              Daily maximum air temperature at 2 meters above the surface of the earth.  Two meters is the height above the ground
              at which all official temperature measurements are made around the world.
            </td>
          </tr>

          <tr>
            <td>Max surface temp</td>
            <td>
              Daily maximum temperature at the Earth’s surface for a specific location. Also known as Earth’s “skin temperature.”
            </td>
          </tr>

          <tr>
            <td>Precipitation</td>
            <td>
              Precipitation is water that falls from clouds to the Earth&apos;s surface in the form of rain, sleet, snow,
              freezing rain, or hail. It&apos;s the primary way that water from the atmosphere returns to the Earth&apos;s surface.
            </td>
          </tr>

          <tr>
            <td>Clouds daytime</td>
            <td>
              <p>
                Clouds are a visible indicator of available water present in the atmosphere. The amount of clouds and the
                altitude of clouds during the day can also impact the amount of solar energy that reaches or is trapped
                near the earth’s surface.
              </p>
              <p>
                Daytime cloud data are typically available with a delay of 3-4 months for processing the values.
              </p>
            </td>
          </tr>

          <tr>
            <td>Soil moisture</td>
            <td>
              <p>
                The fraction of soil moisture, when available. A value of 0 indicates a completely water-free soil and a value of 1
                indicates a completely saturated soil. The soil measured here is the layer from the surface (0 cm) to 5 cm below it.
              </p>
              <p>
                Soil moisture data are typically available with a delay of 3-4 months for processing the values.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

