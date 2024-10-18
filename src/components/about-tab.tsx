import React from "react";
import NasaPartnerImg from "../assets/images/nasa-partner.png";

import "./about-tab.scss";

const Link = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer">
    { children }
  </a>
);

export const AboutTab: React.FC = () => {
  return (
    <div className="about-tab">
      <h2>NASA: Earth, Air, and Water Data</h2>
      <img src={NasaPartnerImg} alt="NASA Partner Logo" />
      <p>
        The NASA: Earth, Air and Water plugin for CODAP was developed to help students use data to explore solar
        intensity (energy) at different locations and/or time frames. Additionally, the data can be used to investigate
        relationships between solar intensity and different parts of the earth’s systems: hydrosphere (precipitation),
        atmosphere (cloud and UV Index), geosphere (soil moisture).
      </p>
      <h2>Missing Values</h2>
      <p>
        Cells with missing values often occur for two different reasons: the data for those dates are not yet available
        or the sensors on the satellite were unable to return the values for that day. In general, you can expect a 3-4
        month lag in the data for UV index, Daytime clouds, and Soil moisture. Sunlight intensity data are intermittent.
      </p>
      <h2>Simulation and Other Resources</h2>
      <p>
        To further explore solar intensity through a simulation, we suggest you explore the Daylight Plugin simulation
        available in the CODAP plugin menu. For additional lessons from NASA and visualizations about solar intensity or
        the Earth’s energy budget,
        visit <Link href="https://mynasadata.larc.nasa.gov/phenomenon/earth-energy-budget">MyNASAdata</Link>.
      </p>
      <h2>Data Acknowledgement</h2>
      <p>
        These data are obtained for educational purposes from the NASA Langley Research Center
        (LaRC) <Link href="https://power.larc.nasa.gov/">POWER Project</Link> funded through the NASA Earth
        Science/Applied Science Program.
      </p>
      <h2>Project Funders</h2>
      <p>
        This material is based upon work supported by the National Science Foundation under Grant No. 2101049 and by a
        National Aeronautics and Space Administration (NASA) grant or cooperative agreement (No. 80NSSC22M0005) and is
        part of NASA’s Science Activation Portfolio. Any opinions, findings, conclusions or recommendations expressed in
        this material are those of the author and do not necessarily reflect the views of the National Science
        Foundation or NASA.
      </p>
    </div>
  );
};

