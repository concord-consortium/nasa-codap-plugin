import React from "react";

import "./about-tab.scss";

const Link = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
);

export const AboutTab: React.FC = () => {
  return (
    <div className="about-tab">
      <h2>Day Length Data</h2>
      <p>
        The Day Length plugin calculates data on daylight for each day of the year at any location on Earth. The
        calculated dataset does not include the effects of clouds, land formation, and other variables that affect
        sunlight in order to provide the underlying causes of Earth’s seasons and climate.
      </p>
      <h2>Simulation</h2>
      <p>
        An integrated simulation of the orbit of the Earth around the Sun allows for a focus on the physical
        relationship of Earth and Sun. The data and simulation can be used to explore the amount, angle and intensity of
        daylight that determine seasonal and climatic differences across the globe.
      </p>
      <h2>Solar Intensity and Sunlight Angle</h2>
      <p>
        Solar energy is radiant light and heat from the Sun that is important for understanding Earth’s seasons and
        climate. The Earth’s axis and yearly orbit cause the daylight hours and solar intensity reaching the Earth to
        vary by location.
      </p>
      <p>
        Because the Earth is spherical, sunlight reaches the surface at different angles—from 0° when it is at the
        horizon (lowest solar intensity) to 90° when directly overhead (highest solar intensity). In addition, the 23°
        tilt of the Earth’s axis further affects the angle of sunlight reaching the different latitudes of the Earth.
      </p>
      <p>
        To explore actual measurement values of sunlight data for locations, we suggest visiting
        the <Link href="https://power.larc.nasa.gov/">NASA POWER website</Link>.
      </p>

      <hr/>

      <p>
        The Day Length plugin for CODAP was developed by the <Link href="https://concord.org/">Concord Consortium</Link> as
        part of the <Link href="https://mss.wested.org/project/boosting-data-science-teaching-and-learning-in-stem/">Boosting Data Science</Link> project,
        a collaboration between <Link href="https://www.wested.org/">WestEd</Link> and the Concord Consortium.
      </p>
      <p>
        This material is based upon work supported by the National Science Foundation under Grant No. 2101049. Any
        opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and
        do not necessarily reflect the views of the National Science Foundation.
      </p>
    </div>
  );
};

