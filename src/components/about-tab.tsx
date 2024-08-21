import React from "react";

import "../assets/scss/about-tab.scss";

export const AboutTab: React.FC = () => {
  return (
    <div className="about-tab">
      <h2>Lorem ipsum dolor sit amet</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec aliquam nisl nisl sit amet nisl.</p>
      <p>Donec auctor, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec aliquam nisl nisl sit amet nisl. Nullam auctor, nisl nec ultricies lacinia, nisl nisl aliquam nisl.</p>
      <hr/>
      <h2>Consectetur adipiscing elit</h2>
      <div className="subsection">
        <h3>Nullam auctor</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec aliquam nisl nisl sit amet nisl.</p>
        <h3>Nisl nec ultricies</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec aliquam nisl nisl sit amet nisl.</p>
      </div>
    </div>
  );
};

