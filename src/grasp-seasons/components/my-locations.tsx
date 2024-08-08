import React, { Component } from "react";
import t, { Language } from "../translation/translate";
import { ILocation } from "../../types";
import { locationsEqual } from "../../utils/daylight-utils";

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

  selectChange(event: any) {
    const { onLocationChange, locations } = this.props;
    const location = locations[event.target.value];
    if (location.latitude && location.longitude) {
      onLocationChange(location.latitude, location.longitude, location.name);
    }
  }

  getOptions() {
    const { locations } = this.props;
    const options = this.selectedCity === "" ? [
      <option key="unsaved" value="" disabled={true}>Custom Location (unsaved)</option>
    ] : [];
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      options.push(<option key={i} value={i}>{ loc.name }</option>);
    }
    return options;
  }

  get selectedCity() {
    const { lat, long, locations } = this.props;
    const currentLocation: ILocation = { latitude: lat, longitude: long, name: "" };
    for (let i = 0; i < locations.length; i++) {
      if (locationsEqual(currentLocation, locations[i])) {
        return i;
      }
    }
    return ""; // custom location
  }

  render() {
    return (
      <div className="my-locations">
        <label>{ t("~MY_LOCATIONS", this.props.lang) }</label>
        <select className="form-control" value={this.selectedCity} onChange={this.selectChange}>
          { this.getOptions() }
        </select>
      </div>
    );
  }
}
