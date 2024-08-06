import React, { Component } from "react";
import CITY_DATA from "../utils/city-data";
import t, { Language } from "../translation/translate";

import "./city-select.scss";

interface IProps {
  lang: Language;
  lat: number;
  long: number;
  onCityChange: (lat: number, long: number, name: string) => void;
}
interface ILocation {
  name: string;
  lat?: number;
  long?: number;
  disabled?: boolean;
}
interface IState {
  locations: ILocation[];
}
export default class CitySelect extends Component<IProps> {
  state: IState;
  constructor(props: IProps) {
    super(props);
    this.state = {
      locations: [{ name: t("~CUSTOM_LOCATION", props.lang), disabled: true } as ILocation].concat(CITY_DATA),
    };

    this.selectChange = this.selectChange.bind(this);
  }

  selectChange(event: any) {
    const { onCityChange } = this.props;
    const { locations } = this.state;
    const city = locations[event.target.value];
    if (city.lat && city.long) {
      onCityChange(city.lat, city.long, city.name);
    }
  }

  getOptions() {
    const { locations } = this.state;
    const options = [];
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      options.push(<option key={i} value={i} disabled={loc.disabled}>{ loc.name }</option>);
    }
    return options;
  }

  get selectedCity() {
    const { lat, long } = this.props;
    const { locations } = this.state;
    for (let i = 0; i < locations.length; i++) {
      if (lat === locations[i].lat && long === locations[i].long) {
        return i;
      }
    }
    return 0; // custom location
  }

  render() {
    return (
      <div className="city-select">
        <label>{ t("~MY_LOCATIONS", this.props.lang) }</label>
        <select className="form-control" value={this.selectedCity} onChange={this.selectChange}>
          { this.getOptions() }
        </select>
      </div>
    );
  }
}
