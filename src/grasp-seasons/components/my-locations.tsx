import React, { Component } from "react";
import t, { Language } from "../translation/translate";
import { ILocation } from "../../types";
import { locationsEqual } from "../../utils/daylight-utils";
import { Dropdown, IOption } from "../../components/dropdown";
import LocationIcon from "../../assets/images/icon-location.svg";

import "./my-locations.scss";

interface IProps {
  lang: Language;
  lat: number;
  long: number;
  onLocationChange: (lat: number, long: number, name: string) => void;
  locations: ILocation[];
}

export default class MyLocations extends Component<IProps> {
  constructor(props: IProps) {
    super(props);
    this.selectChange = this.selectChange.bind(this);
  }

  selectChange(option: IOption) {
    const { onLocationChange, locations } = this.props;
    const location = locations[Number(option.value)];
    if (location && location.latitude && location.longitude) {
      onLocationChange(location.latitude, location.longitude, location.name);
    }
  }

  getOptions() {
    const { locations } = this.props;
    const options = [];
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      options.push({ name: loc.name || `(${loc.latitude}, ${loc.longitude})`, value: i.toString() });
    }
    return options;
  }

  get selectedLocation() {
    const { lat, long, locations } = this.props;
    const currentLocation: ILocation = { latitude: lat, longitude: long, name: "" };
    for (let i = 0; i < locations.length; i++) {
      if (locationsEqual(currentLocation, locations[i])) {
        return locations[i].name;
      }
    }
    return ""; // custom location
  }

  render() {
    return (
      <div className="my-locations">
        <Dropdown
          width="252px"
          value={this.selectedLocation}
          options={this.getOptions()}
          onSelect={this.selectChange}
          label={t("~MY_LOCATIONS", this.props.lang)}
          icon={<LocationIcon />}
        />
      </div>
    );
  }
}
